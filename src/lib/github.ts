import axios from 'axios'
import githubUsernameRegex from 'github-username-regex'

const TOTAL_COMMITS_TIMEOUT_MS = 1500

const logger =
  process.env.NODE_ENV !== 'test'
    ? console
    : {
        log: () => {},
        error: () => {},
      }

function request(data: Record<string, unknown>, headers: Record<string, string>) {
  return axios({
    url: 'https://api.github.com/graphql',
    method: 'post',
    headers,
    data,
  })
}

const retryer = async (
  fetcher: (variables: Record<string, unknown>, token: string, retries: number) => Promise<unknown>,
  variables: Record<string, unknown>,
  retries = 0,
): Promise<unknown> => {
  if (retries > 7) {
    throw new Error('Maximum retries exceeded')
  }

  const tokenKey = `PAT_${retries + 1}`
  const token = process.env[tokenKey]

  if (!token) {
    logger.log(`${tokenKey} is missing in environment variables.`)
    if (retries === 0) {
      throw new Error('No GitHub Token found. Please check your .env file and ensure PAT_1 is set.')
    }
    throw new Error('No more GitHub Tokens available to retry.')
  }

  try {
    logger.log(`Trying ${tokenKey}`)
    const response = (await fetcher(variables, token, retries)) as {
      data: { errors?: Array<{ type?: string; message?: string }> }
    }
    const isRateExceeded = response.data.errors && response.data.errors[0].type === 'RATE_LIMITED'
    if (isRateExceeded) {
      logger.log(`${tokenKey} Rate Limited`)
      retries++
      return retryer(fetcher, variables, retries)
    }
    return response
  } catch (err: unknown) {
    const isBadCredential =
      (err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'status' in err.response &&
        err.response.status === 401) ||
      (err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response &&
        err.response.data &&
        typeof err.response.data === 'object' &&
        'message' in err.response.data &&
        err.response.data.message === 'Bad credentials')

    if (isBadCredential) {
      logger.log(`${tokenKey} Failed: Bad credentials`)
      retries++
      return retryer(fetcher, variables, retries)
    }

    throw err
  }
}

const fetcher = (variables: Record<string, unknown>, token: string) => {
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

const totalCommitsFetcher = async (username: string): Promise<number> => {
  if (!githubUsernameRegex.test(username)) {
    return 0
  }

  const fetchTotalCommits = (variables: Record<string, unknown>, token: string) => {
    return axios({
      method: 'get',
      url: `https://api.github.com/search/commits?q=author:${variables.login}`,
      timeout: TOTAL_COMMITS_TIMEOUT_MS,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github.cloak-preview',
        Authorization: `bearer ${token}`,
      },
    })
  }

  try {
    const res = (await retryer(fetchTotalCommits, { login: username })) as {
      data: { total_count?: number }
    }
    if (res.data.total_count) {
      return res.data.total_count
    }
    return 0
  } catch (err) {
    logger.error(err)
    return 0
  }
}

export interface GitHubLanguage {
  color: string
  id: string
  name: string
}

export interface GitHubStargazers {
  totalCount: number
}

export interface GitHubRepository {
  name: string
  nameWithOwner: string
  description: string | null
  shortDescriptionHTML: string | null
  url: string
  isPrivate: boolean
  isArchived: boolean
  isTemplate: boolean
  isFork: boolean
  primaryLanguage: GitHubLanguage | null
  stargazers: GitHubStargazers
  forkCount: number
}

export interface GitHubUser {
  name: string | null
  login: string
  avatarUrl: string
  bioHTML: string | null
  websiteUrl: string | null
  isHireable: boolean | null
  company: string | null
  location: string | null
  url: string
  contributionsCollection: {
    totalCommitContributions: number
    restrictedContributionsCount: number
  }
  repositoriesContributedTo: {
    totalCount: number
  }
  starredRepositories: {
    totalCount: number
  }
  status: {
    emoji: string | null
    message: string | null
  } | null
  followers: {
    totalCount: number
  }
  following: {
    totalCount: number
  }
  repositories: {
    totalCount: number
    nodes: GitHubRepository[]
  }
  totalCommits: number
}

export interface GitHubGraphQLResponse {
  data: {
    data: {
      user: Omit<GitHubUser, 'totalCommits'>
    }
    errors?: Array<{ message: string; type?: string }>
  }
}

const fetchInfo = async (username: string, repoNum: number): Promise<GitHubUser> => {
  if (!username) throw new Error('Invalid username')
  const numRepoNum = repoNum ? Number(repoNum) : 30

  const totalCommitsPromise = Promise.race([
    totalCommitsFetcher(username),
    new Promise<number>((resolve) => setTimeout(() => resolve(0), TOTAL_COMMITS_TIMEOUT_MS)),
  ])

  const [res, experimentalTotalCommits] = await Promise.all([
    retryer(fetcher, {
      username: username,
      repo_num: numRepoNum,
    }) as Promise<GitHubGraphQLResponse>,
    totalCommitsPromise,
  ])

  if (res.data.errors) {
    logger.error(res.data.errors)
    throw new Error(res.data.errors[0].message || 'Could not fetch user')
  }

  const user = res.data.data.user as Omit<GitHubUser, 'totalCommits'>
  const contributionCount = user.contributionsCollection
  ;(user as GitHubUser).totalCommits = contributionCount.totalCommitContributions + (experimentalTotalCommits as number)
  return user as GitHubUser
}

export { fetchInfo, retryer }
