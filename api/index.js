const fetchInfo = require('../src/fetch')
const renderInfo = require('../src/render')
module.exports = async (req, res) => {
  const { username, theme } = req.query
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
  renderInfo(info, { theme: themeType }).then((value) => {
    res.send(value)
  })
}
