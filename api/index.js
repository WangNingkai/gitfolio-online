const fetchInfo = require('../src/fetch')
const renderInfo = require('../src/render')
const { clampValue, CONSTANTS } = require('../src/utils')
module.exports = async (req, res) => {
  const { username, theme, cache_seconds } = req.query
  if (typeof theme === 'undefined') {
    themeType = 'dark'
  } else {
    themeType = theme
  }
  let info
  try {
    info = await fetchInfo(username)
  } catch (err) {
    return res.send(err.message)
  }
  const cacheSeconds = clampValue(
    parseInt(cache_seconds || CONSTANTS.THIRTY_MINUTES, 10),
    CONSTANTS.THIRTY_MINUTES,
    CONSTANTS.ONE_DAY,
  )
  res.setHeader('Cache-Control', `public, max-age=${cacheSeconds},s-maxage=86400,stale-while-revalidate`)
  renderInfo(info, { theme: themeType }).then((value) => {
    res.send(value)
  })
}
