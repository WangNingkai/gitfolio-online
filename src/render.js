const path = require('path')
const jsdom = require('jsdom').JSDOM,
  options = {
    resources: 'usable',
  }
const { kFormatter } = require('../src/utils')
const dir = path.resolve(__dirname, '..')
const renderInfo = (info, args = {}) => {
  const { theme, includeFork} = args
  return jsdom.fromFile(`${dir}/assets/index.html`, options).then((dom) => {
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
      themeFile = `https://cdn.jsdelivr.net/gh/wangningkai/gitfolio-online/assets/themes/${theme}.css`

      let style = document.createElement('link')
      style.setAttribute('rel', 'stylesheet')
      style.setAttribute('href', themeFile)

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
  })
}
module.exports = renderInfo
