const axios = require('axios')
// const SocksProxyAgent = require('socks-proxy-agent') // 代理
// const proxyURL = 'socks://127.0.0.1:1080'
// const httpsAgent = new SocksProxyAgent(proxyURL)
const renderError = (message, secondaryMessage = 'Opps!') => {
  return `
<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport"content="width=device-width, initial-scale=1"><title>Error</title><!--Fonts--><link rel="dns-prefetch"href="//fonts.gstatic.com"><link href="https://fonts.lug.ustc.edu.cn/css?family=Nunito"rel="stylesheet"><!--Styles--><style>html,body{background-color:#fff;color:#636b6f;font-family:'Nunito',sans-serif;font-weight:100;height:100vh;margin:0}.full-height{height:100vh}.flex-center{align-items:center;display:flex;justify-content:center}.position-ref{position:relative}.code{border-right:2px solid;font-size:26px;padding:0 15px 0 15px;text-align:center}.message{font-size:18px;text-align:center}</style></head><body><div class="flex-center position-ref full-height"><div class="code">${secondaryMessage}</div><div class="message"style="padding: 10px;">${message}</div></div></body></html>
  `
}
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

function randomNumber(min, max) {
  return Math.round(Math.random() * (max - min)) + min
}

/**
 *
 * @param {Date} time
 * @param {string} format
 */
function timeFormat(time, format) {
  let o = {
    'M+': time.getMonth() + 1, //月份
    'd+': time.getDate(), //日
    'h+': time.getHours(), //小时
    'm+': time.getMinutes(), //分
    's+': time.getSeconds(), //秒
    'q+': Math.floor((time.getMonth() + 3) / 3), //季度
    S: time.getMilliseconds(), //毫秒
  }
  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, (time.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  for (let k in o) {
    if (new RegExp('(' + k + ')').test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length))
    }
  }
  return format
}

function request(data, headers) {
  return axios({
    url: 'https://api.github.com/graphql',
    method: 'post',
    headers,
    data,
    // httpsAgent,
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
  renderError,
  kFormatter,
  request,
  clampValue,
  parseBoolean,
  randomNumber,
  timeFormat,
  logger,
  CONSTANTS,
}
