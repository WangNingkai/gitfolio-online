const handler = require('../api/index')

// Mock dependencies
jest.mock('../src/fetch')
jest.mock('../src/render')

const fetchInfo = require('../src/fetch')
const renderInfo = require('../src/render')
const { renderError } = require('../src/utils')

/**
 * 构造 mock Express-like req/res
 */
const mockReqRes = (query = {}) => {
  const req = { query }
  const res = {
    _status: 200,
    _body: '',
    _headers: {},
    status(code) {
      this._status = code
      return this
    },
    send(body) {
      this._body = body
      return this
    },
    setHeader(key, value) {
      this._headers[key] = value
    },
  }
  return { req, res }
}

const mockUserInfo = {
  login: 'testuser',
  name: 'Test User',
  avatarUrl: 'https://example.com/avatar.png',
  url: 'https://github.com/testuser',
  bioHTML: '<div>Test Bio</div>',
  websiteUrl: 'https://test.com',
  company: 'Test Co',
  location: 'Test City',
  isHireable: true,
  followers: { totalCount: 100 },
  following: { totalCount: 50 },
  totalCommits: 1000,
  repositories: {
    nodes: [],
  },
}

describe('api/index.js', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    fetchInfo.mockResolvedValue(mockUserInfo)
    renderInfo.mockResolvedValue('<html>portfolio</html>')
  })

  describe('用户名验证', () => {
    it('缺失 username 时返回 400', async () => {
      const { req, res } = mockReqRes({})
      await handler(req, res)
      expect(res._status).toBe(400)
      expect(res._body).toContain('Invalid username format')
    })

    it('格式无效的 username 返回 400', async () => {
      const { req, res } = mockReqRes({ username: '$$invalid$$' })
      await handler(req, res)
      expect(res._status).toBe(400)
    })

    it('有效 username 正常处理', async () => {
      const { req, res } = mockReqRes({ username: 'validuser' })
      await handler(req, res)
      expect(fetchInfo).toHaveBeenCalledWith('validuser', 30)
    })
  })

  describe('repoNum 校验', () => {
    it('repoNum 超出范围时 clamp 到 1-100', async () => {
      const { req, res } = mockReqRes({ username: 'validuser', repoNum: '999' })
      await handler(req, res)
      expect(fetchInfo).toHaveBeenCalledWith('validuser', 100)
    })

    it('repoNum 为 0 时 fallback 到默认值 30', async () => {
      const { req, res } = mockReqRes({ username: 'validuser', repoNum: '0' })
      await handler(req, res)
      // parseInt('0') || 30 = 30，再 clamp 到 [1,100] = 30
      expect(fetchInfo).toHaveBeenCalledWith('validuser', 30)
    })

    it('repoNum 默认为 30', async () => {
      const { req, res } = mockReqRes({ username: 'validuser' })
      await handler(req, res)
      expect(fetchInfo).toHaveBeenCalledWith('validuser', 30)
    })

    it('repoNum 非数字时默认为 30', async () => {
      const { req, res } = mockReqRes({ username: 'validuser', repoNum: 'abc' })
      await handler(req, res)
      expect(fetchInfo).toHaveBeenCalledWith('validuser', 30)
    })
  })

  describe('Cache-Control header', () => {
    it('设置 Cache-Control header', async () => {
      const { req, res } = mockReqRes({ username: 'validuser' })
      await handler(req, res)
      expect(res._headers['Cache-Control']).toContain('s-maxage=')
    })

    it('自定义 cache_seconds 在合法范围内生效', async () => {
      const { req, res } = mockReqRes({ username: 'validuser', cache_seconds: '3600' })
      await handler(req, res)
      expect(res._headers['Cache-Control']).toContain('s-maxage=3600')
    })

    it('cache_seconds 超上限时 clamp 到 ONE_DAY', async () => {
      const { req, res } = mockReqRes({ username: 'validuser', cache_seconds: '999999' })
      await handler(req, res)
      expect(res._headers['Cache-Control']).toContain('s-maxage=86400')
    })
  })

  describe('错误处理', () => {
    it('fetchInfo 抛出 Invalid username 时返回 400', async () => {
      fetchInfo.mockRejectedValue(new Error('Invalid username'))
      const { req, res } = mockReqRes({ username: 'validuser' })
      await handler(req, res)
      expect(res._status).toBe(400)
    })

    it('fetchInfo 抛出其他错误时返回 502', async () => {
      fetchInfo.mockRejectedValue(new Error('GitHub API error'))
      const { req, res } = mockReqRes({ username: 'validuser' })
      await handler(req, res)
      expect(res._status).toBe(502)
    })

    it('renderInfo 抛出错误时返回 500', async () => {
      renderInfo.mockRejectedValue(new Error('render failed'))
      const { req, res } = mockReqRes({ username: 'validuser' })
      await handler(req, res)
      expect(res._status).toBe(500)
    })
  })

  describe('正常响应', () => {
    it('成功时 send HTML 内容', async () => {
      const { req, res } = mockReqRes({ username: 'validuser' })
      await handler(req, res)
      expect(res._body).toBe('<html>portfolio</html>')
    })
  })
})
