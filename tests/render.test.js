const renderInfo = require('../src/render')

describe('renderInfo', () => {
  const mockUser = {
    login: 'testuser',
    name: 'Test User',
    avatarUrl: 'https://example.com/avatar.png',
    url: 'https://github.com/testuser',
    bioHTML: '<div>Test Bio</div>',
    websiteUrl: 'https://test.com',
    company: 'Test Co',
    location: 'Test City',
    email: 'test@example.com',
    isHireable: true,
    followers: { totalCount: 100 },
    following: { totalCount: 50 },
    totalCommits: 1000,
    repositories: {
      nodes: [
        {
          name: 'repo1',
          shortDescriptionHTML: 'desc1',
          url: 'https://github.com/testuser/repo1',
          isFork: false,
          stargazers: { totalCount: 10 },
          forkCount: 5,
          primaryLanguage: { name: 'JavaScript' },
        },
        {
          name: 'fork1',
          url: 'https://github.com/testuser/fork1',
          isFork: true,
          stargazers: { totalCount: 2 },
          forkCount: 0,
          primaryLanguage: { name: 'HTML' },
        },
      ],
    },
  }

  it('should render HTML correctly for default theme', async () => {
    const html = await renderInfo(mockUser, { theme: 'dark', includeFork: false })
    expect(html).toContain('Test User')
    expect(html).toContain('repo1')
    expect(html).not.toContain('fork1')
    // Check for dark theme specific style (CSS not minified, has spaces)
    expect(html).toContain('--bg-color: #0a0a0a')
  })

  it('should include forks when includeFork is true', async () => {
    const html = await renderInfo(mockUser, { theme: 'light', includeFork: true })
    expect(html).toContain('repo1')
    expect(html).toContain('fork1')
    // Check for light theme specific style
    expect(html).toContain('--bg-color: #fafafa')
  })

  it('should handle missing optional fields', async () => {
    const minimalUser = {
      ...mockUser,
      name: null,
      company: null,
      location: null,
    }
    const html = await renderInfo(minimalUser, { theme: 'dark' })
    expect(html).toContain('testuser')
    // Should not contain null or undefined visible text
    expect(html).not.toContain('null')
    expect(html).not.toContain('undefined')
  })

  it('空仓库列表时不应 crash', async () => {
    const userWithNoRepos = { ...mockUser, repositories: { nodes: [] } }
    const html = await renderInfo(userWithNoRepos, { theme: 'dark' })
    expect(html).toContain('testuser')
  })

  it('repositories 为 null 时不应 crash', async () => {
    const userWithNullRepos = { ...mockUser, repositories: null }
    const html = await renderInfo(userWithNullRepos, { theme: 'dark' })
    expect(html).toContain('testuser')
  })

  it('bioHTML 含有 XSS 时应被 sanitize', async () => {
    const xssUser = {
      ...mockUser,
      bioHTML: '<script>alert(1)</script><div>safe</div>',
    }
    const html = await renderInfo(xssUser, { theme: 'dark' })
    expect(html).not.toContain('<script>alert(1)</script>')
    expect(html).toContain('safe')
  })

  it('repo.shortDescriptionHTML 含有 XSS 时应被 sanitize', async () => {
    const xssUser = {
      ...mockUser,
      repositories: {
        nodes: [
          {
            ...mockUser.repositories.nodes[0],
            shortDescriptionHTML: '<img src=x onerror=alert(1)>desc',
          },
        ],
      },
    }
    const html = await renderInfo(xssUser, { theme: 'dark' })
    expect(html).not.toContain('onerror=alert(1)')
    expect(html).toContain('desc')
  })

  it('无效 theme 时降级为 auto theme', async () => {
    const html = await renderInfo(mockUser, { theme: 'nonexistent-theme' })
    // auto theme 使用 prefers-color-scheme
    expect(html).toContain('prefers-color-scheme')
  })

  it('repo 名称含特殊字符时应被转义', async () => {
    const specialUser = {
      ...mockUser,
      repositories: {
        nodes: [
          {
            ...mockUser.repositories.nodes[0],
            name: '<evil>"test"',
          },
        ],
      },
    }
    const html = await renderInfo(specialUser, { theme: 'dark' })
    expect(html).not.toContain('<evil>')
    expect(html).toContain('&lt;evil&gt;')
  })

  it('isHireable 为 false 时不显示 Available for hire', async () => {
    const notHireable = { ...mockUser, isHireable: false }
    const html = await renderInfo(notHireable, { theme: 'dark' })
    // 应该是 display:none
    expect(html).toContain('display:none')
  })

  it('totalCommits 为 0 时正常渲染', async () => {
    const zeroCommits = { ...mockUser, totalCommits: 0 }
    const html = await renderInfo(zeroCommits, { theme: 'dark' })
    expect(html).toContain('0 commits')
  })
})
