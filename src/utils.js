const axios = require('axios')
// const SocksProxyAgent = require('socks-proxy-agent') // 代理
// const proxyURL = 'socks://127.0.0.1:1080'
// const httpsAgent = new SocksProxyAgent(proxyURL)

/**
 * @param {string} message
 * @param {string} secondaryMessage
 */
const renderError = (message, secondaryMessage = 'Opps!') => {
  return `
<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport"content="width=device-width, initial-scale=1"><title>Error</title><!--Fonts--><link rel="dns-prefetch"href="//fonts.gstatic.com"><link href="https://fonts.lug.ustc.edu.cn/css?family=Nunito"rel="stylesheet"><!--Styles--><style>html,body{background-color:#fff;color:#636b6f;font-family:'Nunito',sans-serif;font-weight:100;height:100vh;margin:0}.full-height{height:100vh}.flex-center{align-items:center;display:flex;justify-content:center}.position-ref{position:relative}.code{border-right:2px solid;font-size:26px;padding:0 15px 0 15px;text-align:center}.message{font-size:18px;text-align:center}</style></head><body><div class="flex-center position-ref full-height"><div class="code">${secondaryMessage}</div><div class="message"style="padding: 10px;">${message}</div></div></body></html>
  `
}

/**
 *
 * @param {string} url
 * @param {string} theme
 */
const renderGithub = (url, theme = 'light') => {
  let themeSource = {
    dark: {
      fill: '#fff',
      color: 'rgb(10, 10, 10)',
    },
    light: {
      fill: 'rgb(10, 10, 10)',
      color: '#fff',
    },
  }
  let color = themeSource[theme]['color']
  let fill = themeSource[theme]['fill']
  return `<a href="${url}" class="github-corner" aria-label="View source on GitHub"><svg width="80" height="80" viewBox="0 0 250 250" style="color:${color}; fill:${fill}; position: absolute; top: 0; border: 0; right: 0;" aria-hidden="true"><path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path><path d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" fill="currentColor" style="transform-origin: 130px 106px;" class="octo-arm"></path><path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" fill="currentColor" class="octo-body"></path></svg></a><style>.github-corner:hover .octo-arm{animation:octocat-wave 560ms ease-in-out}@keyframes octocat-wave{0%,100%{transform:rotate(0)}20%,60%{transform:rotate(-25deg)}40%,80%{transform:rotate(10deg)}}@media (max-width:500px){.github-corner:hover .octo-arm{animation:none}.github-corner .octo-arm{animation:octocat-wave 560ms ease-in-out}}</style>`
}

/**
 *
 * @param {Number} num
 */
const kFormatter = (num) => {
  return Math.abs(num) > 999 ? Math.sign(num) * (Math.abs(num) / 1000).toFixed(1) + 'k' : Math.sign(num) * Math.abs(num)
}

/**
 *
 * @param {Number} number
 * @param {Number} min
 * @param {Number} max
 */
const clampValue = (number, min, max) => {
  return Math.max(min, Math.min(number, max))
}

/**
 *
 * @param {mixed} value
 */
const parseBoolean = (value) => {
  if (value === 'true') {
    return true
  } else if (value === 'false') {
    return false
  } else {
    return value
  }
}

/**
 *
 * @param {Number} min
 * @param {Number} max
 */
const randomNumber = (min, max) => {
  return Math.round(Math.random() * (max - min)) + min
}

/**
 *
 * @param {Date} time
 * @param {string} format
 */
const timeFormat = (time, format) => {
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

/**
 *
 * @param {object} data
 * @param {object} headers
 */
const request = (data, headers) => {
  return axios({
    url: 'https://api.github.com/graphql',
    method: 'post',
    headers,
    data,
    // httpsAgent, // proxy
  })
}

const fn = () => {}
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
  renderGithub,
  renderError,
  kFormatter,
  clampValue,
  parseBoolean,
  randomNumber,
  timeFormat,
  request,
  logger,
  CONSTANTS,
}
