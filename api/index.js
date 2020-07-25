const fetchInfo = require('../src/fetch')
const renderInfo = require('../src/render')
module.exports = async (req, res) => {
  const { username, theme } = req.query
  let info
  try {
    info = await fetchInfo(username)
  } catch (err) {
    return res.send(err.message)
  }
  renderInfo(info, { theme: theme }).then((value) => {
    res.send(value)
  })
  // res.writeHead(200, { 'Content-Type': 'text/html' })
}
