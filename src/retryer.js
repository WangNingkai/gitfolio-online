const { logger } = require('./utils')

const retryer = async (fetcher, variables, retries = 0) => {
  if (retries > 7) {
    throw new Error('Maximum retries exceeded')
  }

  const tokenKey = `PAT_${retries + 1}`
  const token = process.env[tokenKey]

  if (!token) {
    logger.log(`${tokenKey} is missing in environment variables.`)
    // 如果是第一个 token 就缺失，说明配置有问题，直接抛错
    if (retries === 0) {
      throw new Error('No GitHub Token found. Please check your .env file and ensure PAT_1 is set.')
    }
    // 如果后续 token 缺失，说明已经用完了所有配置的 token，停止重试
    throw new Error('No more GitHub Tokens available to retry.')
  }

  try {
    logger.log(`Trying ${tokenKey}`)
    let response = await fetcher(variables, token, retries)
    const isRateExceeded = response.data.errors && response.data.errors[0].type === 'RATE_LIMITED'
    if (isRateExceeded) {
      logger.log(`${tokenKey} Rate Limited`)
      retries++
      return retryer(fetcher, variables, retries)
    }
    return response
  } catch (err) {
    // 检查是否是 401 Bad credentials
    const isBadCredential =
      (err.response && err.response.status === 401) ||
      (err.response && err.response.data && err.response.data.message === 'Bad credentials')

    if (isBadCredential) {
      logger.log(`${tokenKey} Failed: Bad credentials`)
      retries++
      return retryer(fetcher, variables, retries)
    }

    // 如果不是认证错误，直接抛出，不再重试
    throw err
  }
}

module.exports = retryer
