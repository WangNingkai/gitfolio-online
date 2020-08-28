const fetchInfo = require('../src/fetch')
const renderInfo = require('../src/render')
const { renderError, clampValue, parseBoolean, CONSTANTS } = require('../src/utils')
module.exports = async (req, res) => {
  const { username, theme, includeFork, cache_seconds, repoNum } = req.query
  if (typeof theme === 'undefined') {
    themeType = 'dark'
  } else {
    themeType = theme
  }
  let info
  try {
    info = await fetchInfo(username, repoNum)
  } catch (err) {
    res.send(renderError(err.message))
  }
  const cacheSeconds = clampValue(
    parseInt(cache_seconds || CONSTANTS.THIRTY_MINUTES, 10),
    CONSTANTS.THIRTY_MINUTES,
    CONSTANTS.ONE_DAY,
  )
  res.setHeader('Cache-Control', `s-maxage=${cacheSeconds},stale-while-revalidate`)
  renderInfo(info, { theme: themeType, includeFork: parseBoolean(includeFork) }).then((value) => {
    res.send(value)
  })
}
