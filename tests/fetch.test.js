const fetchInfo = require('../src/fetch')

// Mock retryer 模块
jest.mock('../src/retryer')
const retryer = require('../src/retryer')

const mockGraphQLResponse = {
  data: {
    data: {
      user: {
        login: 'testuser',
        name: 'Test User',
        avatarUrl: 'https://example.com/avatar.png',
        url: 'https://github.com/testuser',
        bioHTML: '<div>Bio</div>',
        websiteUrl: 'https://test.com',
        company: 'Test Co',
        location: 'Test City',
        isHireable: true,
        followers: { totalCount: 100 },
        following: { totalCount: 50 },
        contributionsCollection: {
          totalCommitContributions: 800,
          restrictedContributionsCount: 50,
        },
        repositoriesContributedTo: { totalCount: 10 },
        starredRepositories: { totalCount: 20 },
        status: null,
        repositories: {
          totalCount: 5,
          nodes: [],
        },
      },
    },
  },
}

describe('fetchInfo', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('缺少 username 时抛出 Invalid username 错误', async () => {
    await expect(fetchInfo('')).rejects.toThrow('Invalid username')
    await expect(fetchInfo(null)).rejects.toThrow('Invalid username')
  })

  it('正常解析 GraphQL 响应并计算 totalCommits', async () => {
    // 第一次调用: totalCommitsFetcher (REST)，第二次: GraphQL fetcher
    retryer
      .mockResolvedValueOnce({ data: { total_count: 200 } }) // totalCommitsFetcher
      .mockResolvedValueOnce(mockGraphQLResponse)              // fetcher

    const user = await fetchInfo('testuser', 30)

    expect(user.login).toBe('testuser')
    // totalCommits = totalCommitContributions(800) + experimentalTotalCommits(200)
    expect(user.totalCommits).toBe(1000)
  })

  it('GraphQL 返回 errors 时抛出错误', async () => {
    retryer
      .mockResolvedValueOnce({ data: { total_count: 0 } })
      .mockResolvedValueOnce({
        data: {
          errors: [{ message: 'Could not resolve to a User' }],
        },
      })

    await expect(fetchInfo('noexistuser', 30)).rejects.toThrow('Could not resolve to a User')
  })

  it('totalCommitsFetcher 失败时不影响主流程，返回 0 commits', async () => {
    retryer
      .mockRejectedValueOnce(new Error('REST API error')) // totalCommitsFetcher 失败
      .mockResolvedValueOnce(mockGraphQLResponse)          // GraphQL 正常

    const user = await fetchInfo('testuser', 30)
    // experimentalTotalCommits 应为 0
    expect(user.totalCommits).toBe(800)
  })

  it('repoNum 默认值为 30', async () => {
    retryer
      .mockResolvedValueOnce({ data: { total_count: 0 } })
      .mockResolvedValueOnce(mockGraphQLResponse)

    await fetchInfo('testuser')

    // 第二次调用 retryer 是 fetcher，检查传入的变量
    const fetcherCall = retryer.mock.calls[1]
    expect(fetcherCall[1]).toMatchObject({ repo_num: 30 })
  })
})
