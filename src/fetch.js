const { request, logger } = require('./utils')
const retryer = require('./retryer')

const fetcher = (variables, token) => {
  return request(
    {
      query: `
fragment RepoInfo on Repository {
  name
  nameWithOwner
  isPrivate
  isArchived
  isTemplate
  isFork
  stargazers {
    totalCount
  }
  description
  shortDescriptionHTML
  primaryLanguage {
    color
    id
    name
  }
  forkCount
  url
}

query userInfo($username: String!) {
  user(login: $username) {
    name
    login
    avatarUrl
    bioHTML
    websiteUrl
    isHireable
    status {
      emoji
      message
    }
    company
    location
    url
    starredRepositories{
      totalCount
    }
    repositories(first: 30, ownerAffiliations: OWNER, privacy: PUBLIC, orderBy: {direction: DESC, field: STARGAZERS}) {
      totalCount
      nodes {
        ...RepoInfo
      }
    }
    followers {
      totalCount
    }
    following {
      totalCount
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

async function fetchInfo(username) {
  if (!username) throw Error('Invalid username')
  let res = await retryer(fetcher, {
    username: username,
  })

  if (res.data.errors) {
    logger.error(res.data.errors)
    throw Error(res.data.errors[0].message || 'Could not fetch user')
  }
  const user = res.data.data.user

  return user
}

module.exports = fetchInfo
