const axios = require('axios')

/**
 * @param {string} message
 * @param {string} secondaryMessage
 */
const escapeHtml = (value = '') => {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const renderError = (message, secondaryMessage = 'Opps!') => {
  const safeMessage = escapeHtml(message)
  const safeSecondaryMessage = escapeHtml(secondaryMessage)
  return `
<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport"content="width=device-width, initial-scale=1"><title>Error</title><!--Fonts--><link rel="dns-prefetch"href="//fonts.gstatic.com"><link href="https://fonts.lug.ustc.edu.cn/css?family=Nunito"rel="stylesheet"><!--Styles--><style>html,body{background-color:#fff;color:#636b6f;font-family:'Nunito',sans-serif;font-weight:100;height:100vh;margin:0}.full-height{height:100vh}.flex-center{align-items:center;display:flex;justify-content:center}.position-ref{position:relative}.code{border-right:2px solid;font-size:26px;padding:0 15px 0 15px;text-align:center}.message{font-size:18px;text-align:center}</style></head><body><div class="flex-center position-ref full-height"><div class="code">${safeSecondaryMessage}</div><div class="message"style="padding: 10px;">${safeMessage}</div></div></body></html>
  `
}

const GITHUB_CORNER_THEMES = {
  auto: { fill: 'rgb(10, 10, 10)', color: '#fff' },
  dracula: { fill: '#fff', color: 'rgb(10, 10, 10)' },
  dark: { fill: '#fff', color: 'rgb(10, 10, 10)' },
  light: { fill: 'rgb(10, 10, 10)', color: '#fff' },
}

/**
 *
 * @param {string} url
 * @param {string} theme
 */
const renderGithub = (url, theme = 'auto') => {
  const { color, fill } = GITHUB_CORNER_THEMES[theme] || GITHUB_CORNER_THEMES.auto
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
 * @param {object} data
 * @param {object} headers
 */
const request = (data, headers) => {
  return axios({
    url: 'https://api.github.com/graphql',
    method: 'post',
    headers,
    data,
    timeout: 10000,
  })
}

const logger = process.env.NODE_ENV !== 'test' ? console : { log: () => {}, error: () => {} }

const CONSTANTS = {
  THIRTY_MINUTES: 1800,
  ONE_DAY: 86400,
}

/**
 * @param {string} url
 */
const sanitizeUrl = (url) => {
  if (!url) return ''
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol) ? url : ''
  } catch {
    return ''
  }
}

/**
 * 简易 HTML 净化 — 仅保留安全的文本格式标签，移除所有脚本/事件属性
 * @param {string} html
 */
const sanitizeHtml = (html) => {
  if (!html) return ''
  let result = String(html)
  // 移除 <script> 标签及其内容
  result = result.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  // 移除 <iframe> 标签
  result = result.replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, '')
  // 移除 <object> 和 <embed> 标签
  result = result.replace(/<(?:object|embed)\b[^>]*>[\s\S]*?<\/(?:object|embed)>/gi, '')
  // 移除事件处理器属性 (onclick, onerror 等)
  result = result.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|\S+)/gi, '')
  // 移除 javascript: 和 data: 协议的完整 href 属性
  result = result.replace(/\s+href\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*'|javascript:\S+)/gi, '')
  result = result.replace(/\s+href\s*=\s*(?:"data:[^"]*"|'data:[^']*'|data:\S+)/gi, '')
  return result
}

module.exports = {
  renderGithub,
  renderError,
  escapeHtml,
  sanitizeHtml,
  sanitizeUrl,
  kFormatter,
  clampValue,
  parseBoolean,
  request,
  logger,
  CONSTANTS,
}
