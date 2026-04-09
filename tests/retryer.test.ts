import { retryer } from '../src/lib/github'

describe('retryer', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('should throw error when no token is configured', async () => {
    delete process.env.PAT_1

    const fetcher = jest.fn()

    await expect(retryer(fetcher, {})).rejects.toThrow(
      'No GitHub Token found. Please check your .env file and ensure PAT_1 is set.',
    )
  })

  it('should call fetcher with correct token', async () => {
    process.env.PAT_1 = 'test-token-1'

    const fetcher = jest.fn().mockResolvedValue({
      data: { data: { user: { login: 'test' } }, errors: null },
    })

    await retryer(fetcher, { username: 'test' })

    expect(fetcher).toHaveBeenCalledWith({ username: 'test' }, 'test-token-1', 0)
  })

  it('should retry on rate limit exceeded', async () => {
    process.env.PAT_1 = 'test-token-1'
    process.env.PAT_2 = 'test-token-2'

    const fetcher = jest
      .fn()
      .mockResolvedValueOnce({
        data: {
          data: null,
          errors: [{ type: 'RATE_LIMITED', message: 'Rate limited' }],
        },
      })
      .mockResolvedValueOnce({
        data: { data: { user: { login: 'test' } }, errors: null },
      })

    await retryer(fetcher, { username: 'test' })

    expect(fetcher).toHaveBeenCalledTimes(2)
    expect(fetcher).toHaveBeenNthCalledWith(1, { username: 'test' }, 'test-token-1', 0)
    expect(fetcher).toHaveBeenNthCalledWith(2, { username: 'test' }, 'test-token-2', 1)
  })

  it('should retry on 401 Bad credentials', async () => {
    process.env.PAT_1 = 'test-token-1'
    process.env.PAT_2 = 'test-token-2'

    const error401 = new Error('Bad credentials')
    error401.response = { status: 401 }

    const fetcher = jest
      .fn()
      .mockRejectedValueOnce(error401)
      .mockResolvedValueOnce({
        data: { data: { user: { login: 'test' } }, errors: null },
      })

    await retryer(fetcher, { username: 'test' })

    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it('should throw error when tokens exhausted', async () => {
    process.env.PAT_1 = 'test-token-1'
    delete process.env.PAT_2

    const fetcher = jest.fn().mockResolvedValue({
      data: {
        data: null,
        errors: [{ type: 'RATE_LIMITED', message: 'Rate limited' }],
      },
    })

    await expect(retryer(fetcher, {})).rejects.toThrow('No more GitHub Tokens available to retry.')
  })

  it('should not retry on non-auth errors', async () => {
    process.env.PAT_1 = 'test-token-1'

    const error500 = new Error('Server error')
    error500.response = { status: 500 }

    const fetcher = jest.fn().mockRejectedValue(error500)

    await expect(retryer(fetcher, { username: 'test' })).rejects.toThrow('Server error')
    expect(fetcher).toHaveBeenCalledTimes(1)
  })
})
