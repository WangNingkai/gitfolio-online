const axios = require('axios')
const SocksProxyAgent = require('socks-proxy-agent')
const proxyURL = 'socks://127.0.0.1:1080'
const httpsAgent = new SocksProxyAgent(proxyURL)

function kFormatter(num) {
  return Math.abs(num) > 999 ? Math.sign(num) * (Math.abs(num) / 1000).toFixed(1) + 'k' : Math.sign(num) * Math.abs(num)
}

function clampValue(number, min, max) {
  return Math.max(min, Math.min(number, max))
}

function parseBoolean(value) {
  if (value === 'true') {
    return true
  } else if (value === 'false') {
    return false
  } else {
    return value
  }
}

function request(data, headers) {
  return axios({
    url: 'https://api.github.com/graphql',
    method: 'post',
    headers,
    data,
    httpsAgent,
  })
}

const fn = () => {}
// return console instance based on the environment
const logger =
  process.env.NODE_ENV !== 'test'
    ? console
    : {
        log: fn,
        error: fn,
      }

const CONSTANTS = {
  THIRTY_MINUTES: 1800,
  TWO_HOURS: 7200,
  ONE_DAY: 86400,
}

module.exports = {
  kFormatter,
  request,
  clampValue,
  parseBoolean,
  logger,
  CONSTANTS,
}
