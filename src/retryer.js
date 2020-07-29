const { logger } = require('./utils')

const retryer = async (fetcher, variables, retries = 0) => {
  if (retries > 7) {
    throw new Error('Maximum retries exceeded')
  }
  try {
    logger.log(`Trying PAT_${retries + 1}`)
    let response = await fetcher(variables, process.env[`PAT_${retries + 1}`], retries)
    const isRateExceeded = response.data.errors && response.data.errors[0].type === 'RATE_LIMITED'
    if (isRateExceeded) {
      logger.log(`PAT_${retries + 1} Failed`)
      retries++
      return retryer(fetcher, variables, retries)
    }
    return response
  } catch (err) {
    const isBadCredential = err.response.data && err.response.data.message === 'Bad credentials'

    if (isBadCredential) {
      logger.log(`PAT_${retries + 1} Failed`)
      retries++
      return retryer(fetcher, variables, retries)
    }
  }
}

module.exports = retryer
