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
    // Check for dark theme specific style
    expect(html).toContain('--bg-color:rgb(10, 10, 10)')
  })

  it('should include forks when includeFork is true', async () => {
    const html = await renderInfo(mockUser, { theme: 'light', includeFork: true })
    expect(html).toContain('repo1')
    expect(html).toContain('fork1')
    // Check for light theme specific style
    expect(html).toContain('--bg-color:#fff')
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
})
