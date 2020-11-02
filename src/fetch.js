const { request, logger } = require('./utils')
const retryer = require('./retryer')
const githubUsernameRegex = require('github-username-regex')
const axios = require('axios')

const fetcher = (variables, token) => {
  return request(
    {
      query: `
fragment RepoInfo on Repository {
  name
  nameWithOwner
  description
  shortDescriptionHTML
  url
  isPrivate
  isArchived
  isTemplate
  isFork
  primaryLanguage {
    color
    id
    name
  }  
  stargazers {
    totalCount
  }
  forkCount
}

query userInfo($username: String!,$repo_num: Int!) {
  user(login: $username) {
    name
    login
    avatarUrl
    bioHTML
    websiteUrl
    isHireable
    company
    location
    url
    contributionsCollection {
      totalCommitContributions
      restrictedContributionsCount
    }
    repositoriesContributedTo(first: 1, contributionTypes: [COMMIT, ISSUE, PULL_REQUEST, REPOSITORY]) {
      totalCount
    }
    starredRepositories{
      totalCount
    }
    status {
      emoji
      message
    }
    followers {
      totalCount
    }
    following {
      totalCount
    }
    repositories(first: $repo_num, ownerAffiliations: OWNER, privacy: PUBLIC, orderBy: {direction: DESC, field: STARGAZERS}) {
      totalCount
      nodes {
        ...RepoInfo
      }
    }
  }
}
      `,
      variables,
    },
    {
      Authorization: `bearer ${token}`,
    },
  )
}

const totalCommitsFetcher = async (username) => {
  if (!githubUsernameRegex.test(username)) {
    return 0
  }

  // https://developer.github.com/v3/search/#search-commits
  const fetchTotalCommits = (variables, token) => {
    return axios({
      method: 'get',
      url: `https://api.github.com/search/commits?q=author:${variables.login}`,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github.cloak-preview',
        Authorization: `bearer ${token}`,
      },
    })
  }

  try {
    let res = await retryer(fetchTotalCommits, { login: username })
    if (res.data.total_count) {
      return res.data.total_count
    }
  } catch (err) {
    // just return 0 if there is something wrong so that
    // we don't break the whole app
    logger.error(err)
    return 0
  }
}

const fetchInfo = async (username, repoNum) => {
  if (!username) throw Error('Invalid username')
  if (!repoNum) {
    repoNum = 30
  }

  let res = await retryer(fetcher, {
    username: username,
    repo_num: Number(repoNum),
  })

  if (res.data.errors) {
    logger.error(res.data.errors)
    throw Error(res.data.errors[0].message || 'Could not fetch user')
  }
  experimental_totalCommits = await totalCommitsFetcher(username)
  const user = res.data.data.user
  const contributionCount = user.contributionsCollection
  user.totalCommits = contributionCount.totalCommitContributions + experimental_totalCommits
  return user
}

module.exports = fetchInfo
