const path = require('path')
const hbs = require('handlebars')
const fs = require('fs')
const { kFormatter, renderGithub, escapeHtml, sanitizeHtml, sanitizeUrl } = require('../src/utils')

const LANGUAGE_COLORS = require('./language-colors.json')

const getLanguageColor = (languageName) => {
  return LANGUAGE_COLORS[languageName] || '#8b8b8b'
}

const ROOT_DIR = path.resolve(__dirname, '..')
const ASSET_DIR = path.resolve(`${ROOT_DIR}/assets/`)
const LAYOUT_CSS_PATH = path.resolve(ASSET_DIR, 'index.css')
const THEME_DIR = path.join(ASSET_DIR, 'themes')
const BACKGROUND_IMAGE = 'https://cdn.jsdelivr.net/gh/WangNingkai/BingImageApi@latest/images/latest.png'
const AVAILABLE_THEMES = new Set(
  fs
    .readdirSync(THEME_DIR)
    .filter((fileName) => fileName.endsWith('.css'))
    .map((fileName) => fileName.replace(/\.css$/, '')),
)

// 启动时预加载静态资源（只读一次）
let cachedLayoutCss = null
const themeTemplateCache = new Map()

const getLayoutCss = () => {
  if (!cachedLayoutCss) {
    cachedLayoutCss = fs.readFileSync(LAYOUT_CSS_PATH, 'utf-8')
  }
  return cachedLayoutCss
}

const resolveTheme = (theme) => {
  return AVAILABLE_THEMES.has(theme) ? theme : 'auto'
}

const getThemeTemplate = (theme) => {
  if (themeTemplateCache.has(theme)) {
    return themeTemplateCache.get(theme)
  }
  const themeSource = fs.readFileSync(path.join(THEME_DIR, `${theme}.css`), 'utf-8')
  const compiledTemplate = hbs.compile(themeSource)
  themeTemplateCache.set(theme, compiledTemplate)
  return compiledTemplate
}

const renderProjectCard = (repo) => {
  const languageColor = repo.primaryLanguage ? getLanguageColor(repo.primaryLanguage.name) : null
  const safeDesc = sanitizeHtml(repo.shortDescriptionHTML || '')
  return `<a href="${escapeHtml(repo.url)}" target="_blank"><section><div class="section_title">${escapeHtml(repo.name)}</div><div class="about_section"><span style="display:${safeDesc ? 'block' : 'none'};">${safeDesc}</span></div><div class="bottom_section"><span class="lang-tag" style="display:${repo.primaryLanguage == null ? 'none' : 'inline-flex'};"><span class="lang-dot" style="background:${languageColor}"></span>${repo.primaryLanguage == null ? '' : escapeHtml(repo.primaryLanguage.name)}</span><span><i class="fas fa-star"></i>&nbsp;${kFormatter(repo.stargazers.totalCount)}</span><span><i class="fas fa-code-branch"></i>&nbsp;${kFormatter(repo.forkCount)}</span></div></section></a>`
}

const renderInfo = async (info, args = {}) => {
  const { theme, includeFork } = args
  const activeTheme = resolveTheme(theme)
  const user = info
  const repos = user?.repositories?.nodes || []

  let workSectionHtml = ''
  let forksSectionHtml = ''
  let totalStars = 0

  for (let i = 0; i < repos.length; i++) {
    totalStars += repos[i].stargazers.totalCount
    if (repos[i].isFork === false) {
      workSectionHtml += renderProjectCard(repos[i])
    } else if (repos[i].isFork === true && includeFork === true) {
      forksSectionHtml += renderProjectCard(repos[i])
    }
  }

  const stars = kFormatter(totalStars)
  const title = `${user.name || user.login} — GitHub Portfolio`
  const bioText = user.bioHTML ? user.bioHTML.replace(/<[^>]*>/g, '').slice(0, 160) : `${user.login}'s GitHub portfolio`

  const themeCss = getThemeTemplate(activeTheme)({ background: BACKGROUND_IMAGE })
  const layoutCss = getLayoutCss()

  const forksDisplay = includeFork === true && forksSectionHtml ? 'block' : 'none'

  const nameDisplay = user.name == null || !user.name ? 'none' : 'block'
  const usernameHtml = `<span style="display:${nameDisplay};">${escapeHtml(user.name || '')}</span><a href="${escapeHtml(user.url)}">@${escapeHtml(user.login)}</a>`
  const userbioDisplay = user.bioHTML == null || !user.bioHTML ? 'none' : 'block'
  const userbioHtml = `<div style="display:${userbioDisplay};">${sanitizeHtml(user.bioHTML || '')}</div>`
  const aboutHtml = `<span style="display:${user.followers == null || !user.followers ? 'none' : 'block'};"><i class="fas fa-users"></i> &nbsp;${kFormatter(user.followers.totalCount)} followers · ${kFormatter(user.following.totalCount)} following</span>
<span style="display:block"><i class="fas fa-star"></i> &nbsp;${stars} stars</span>
<span style="display:block"><i class="fas fa-history"></i> &nbsp;${kFormatter(user.totalCommits)} commits</span>
<span style="display:${user.company == null || !user.company ? 'none' : 'block'};"><i class="fas fa-building"></i> &nbsp;${escapeHtml(user.company || '')}</span>
<span style="display:${user.websiteUrl == null || !user.websiteUrl ? 'none' : 'block'};"><i class="fas fa-link"></i> &nbsp;<a href="${escapeHtml(sanitizeUrl(user.websiteUrl))}">${escapeHtml(user.websiteUrl || '')}</a></span>
<span style="display:${user.location == null || !user.location ? 'none' : 'block'};"><i class="fas fa-map-marker-alt"></i> &nbsp;${escapeHtml(user.location || '')}</span>
<span style="display:${user.isHireable == false || !user.isHireable ? 'none' : 'block'};"><i class="fas fa-user-tie"></i> &nbsp;Available for hire</span>`

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="X-UA-Compatible" content="ie=edge"><title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(bioText)}"><meta property="og:type" content="profile"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(user.login)}'s GitHub portfolio"><meta property="og:image" content="${escapeHtml(user.avatarUrl)}"><meta property="twitter:card" content="summary"><meta property="twitter:title" content="${escapeHtml(title)}"><meta property="twitter:description" content="${escapeHtml(user.login)}'s GitHub portfolio"><meta property="twitter:image" content="${escapeHtml(user.avatarUrl)}"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="preconnect" href="https://cdn.jsdelivr.net"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins&family=Questrial&display=swap"><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/animate.css@4.1.1/animate.min.css"><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@7.1.0/css/all.min.css"><link rel="icon" href="${user.avatarUrl}" type="image/png"><style>${themeCss}</style><style>${layoutCss}</style></head><body><div id="loading" role="status" aria-live="polite" aria-label="Loading portfolio content"><div id="skeleton" aria-hidden="true"><div class="skeleton-profile"><div class="skeleton-avatar"></div><div class="skeleton-name"></div><div class="skeleton-bio"></div></div><div class="skeleton-content"><h1 class="skeleton-title"></h1><div class="skeleton-grid"><div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div></div></div></div></div>${renderGithub(user.url, activeTheme)}<div id="profile" role="region" aria-label="User profile"><div id="profile_img" style="background:url('${user.avatarUrl}') center center"></div><div id="username">${usernameHtml}</div><div id="userbio">${userbioHtml}</div><div id="about">${aboutHtml}</div></div><div id="display" role="main"><div id="work" role="region" aria-label="Work projects"><h1>Work.</h1><div class="projects" id="work_section" aria-live="polite">${workSectionHtml}</div></div><div id="forks" style="display:${forksDisplay}" role="region" aria-label="Forked projects"><h1>Forks.</h1><div class="projects" id="forks_section">${forksSectionHtml}</div></div><div id="footer"><a href="https://github.com/wangningkai" target="_blank">made on earth by a human</a></div></div><script type="text/javascript">setTimeout(function(){document.getElementById('loading').classList.add('animated'),document.getElementById('loading').classList.add('fadeOut'),setTimeout(function(){document.getElementById('loading').classList.remove('animated'),document.getElementById('loading').classList.remove('fadeOut'),document.getElementById('loading').style.display='none'},600)},600)</script></body></html>`
}

module.exports = renderInfo
