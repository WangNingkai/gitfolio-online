const path = require('path')
/* Promise library */
const bluebird = require('bluebird')
const hbs = require('handlebars')
/*  Creates promise-returning async functions
    from callback-passed async functions      */
const fs = bluebird.promisifyAll(require('fs'))
const jsdom = require('jsdom').JSDOM,
  options = {
    resources: 'usable',
  }
const { kFormatter } = require('../src/utils')
const dir = path.resolve(__dirname, '..')
const assetDir = path.resolve(`${dir}/assets/`)

const renderInfo = async (info, args = {}) => {
  const { theme, includeFork } = args
  const dom = await jsdom.fromFile(path.resolve(assetDir, 'index.html'), options)
  let window = dom.window,
    document = window.document,
    stars = 0
  try {
    const user = info
    const repos = user.repositories.nodes
    for (let i = 0; i < repos.length; i++) {
      stars += repos[i].stargazers.totalCount
      isFork = repos[i].isFork
      let element
      if (isFork == false) {
        element = document.getElementById('work_section')
      } else if (isFork == true && includeFork == true) {
        document.getElementById('forks').style.display = 'block'
        element = document.getElementById('forks_section')
      } else {
        continue
      }
      element.innerHTML += `
        <a href="${repos[i].url}" target="_blank">
        <section>
            <div class="section_title">${repos[i].name}</div>
            <div class="about_section">
            <span style="display:${repos[i].shortDescriptionHTML == undefined ? 'none' : 'block'};">${
        repos[i].shortDescriptionHTML
      }</span>
            </div>
            <div class="bottom_section">
                <span style="display:${
                  repos[i].primaryLanguage == null ? 'none' : 'inline-block'
                };"><i class="fas fa-code"></i>&nbsp; ${
        repos[i].primaryLanguage == null ? '' : repos[i].primaryLanguage.name
      }</span>
                <span><i class="fas fa-star"></i>&nbsp; ${kFormatter(repos[i].stargazers.totalCount)}</span>
                <span><i class="fas fa-code-branch"></i>&nbsp; ${kFormatter(repos[i].forkCount)}</span>
            </div>
        </section>
        </a>`
    }
    stars = kFormatter(stars)
    document.title = user.login
    Date.prototype.format = function (fmt) {
      let o = {
        'M+': this.getMonth() + 1,
        'd+': this.getDate(),
        'h+': this.getHours(),
        'm+': this.getMinutes(),
        's+': this.getSeconds(),
        'q+': Math.floor((this.getMonth() + 3) / 3),
        S: this.getMilliseconds(),
      }
      if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length))
      }
      for (let k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) {
          fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length))
        }
      }
      return fmt
    }
    let time = new Date().getTime() - 24 * 60 * 60 * 1000
    let date = new Date(time).format('yyyyMMdd')
    let background = `https://cdn.jsdelivr.net/gh/WangNingkai/BingImageApi@latest/images/${date}.png`
    let themeSource = fs.readFileSync(path.join(assetDir, 'themes', `${theme}.css`))
    themeSource = themeSource.toString('utf-8')
    let themeTemplate = hbs.compile(themeSource)
    let styles = themeTemplate({
      background: `${background}`,
    })

    let style = document.createElement('style')
    style.type = 'text/css'
    style.innerHTML = styles

    let icon = document.createElement('link')
    icon.setAttribute('rel', 'icon')
    icon.setAttribute('href', user.avatarUrl)
    icon.setAttribute('type', 'image/png')

    document.getElementsByTagName('head')[0].appendChild(icon)
    document.getElementsByTagName('head')[0].appendChild(style)
    document.getElementById('profile_img').style.background = `url('${user.avatarUrl}') center center`
    document.getElementById('username').innerHTML = `<span style="display:${
      user.name == null || !user.name ? 'none' : 'block'
    };">${user.name}</span><a href="${user.url}">@${user.login}</a>`
    document.getElementById('userbio').innerHTML = user.bioHTML
    document.getElementById('userbio').style.display = user.bioHTML == null || !user.bioHTML ? 'none' : 'block'
    document.getElementById('about').innerHTML = `
              <span style="display:${
                user.followers == null || !user.followers ? 'none' : 'block'
              };"><i class="fas fa-users"></i> &nbsp; ${kFormatter(user.followers.totalCount)} followers · ${kFormatter(
      user.following.totalCount,
    )} following</span>
              <span style="display:block"><i class="fas fa-star"></i> &nbsp; ${stars} stars</span>
              <span style="display:${
                user.company == null || !user.company ? 'none' : 'block'
              };"><i class="fas fa-building"></i> &nbsp; ${user.company}</span>
              <span style="display:${
                user.email == null || !user.email ? 'none' : 'block'
              };"><i class="fas fa-envelope"></i> &nbsp; ${user.email}</span>
              <span style="display:${
                user.websiteUrl == null || !user.websiteUrl ? 'none' : 'block'
              };"><i class="fas fa-link"></i> &nbsp; <a href="${user.websiteUrl}">${user.websiteUrl}</a></span>
              <span style="display:${
                user.location == null || !user.location ? 'none' : 'block'
              };"><i class="fas fa-map-marker-alt"></i> &nbsp; ${user.location}</span>
              <span style="display:${
                user.isHireable == false || !user.isHireable ? 'none' : 'block'
              };"><i class="fas fa-user-tie"></i> &nbsp; Available for hire</span>
              `
    return '<!DOCTYPE html>' + window.document.documentElement.outerHTML
  } catch (error) {
    console.error(error)
  }
}
module.exports = renderInfo
