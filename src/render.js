const path = require('path')
const bluebird = require('bluebird')
const hbs = require('handlebars')
const fs = bluebird.promisifyAll(require('fs'))
const jsdom = require('jsdom').JSDOM,
  options = {
    resources: 'usable',
  }
const dir = path.resolve(__dirname, '..')
const renderInfo = (info, args = {}) => {
  const { includeFork, twitter, linkedin, medium, dribbble, theme } = args

  return jsdom.fromFile(`${dir}/assets/index.html`, options).then((dom) => {
    let window = dom.window,
      document = window.document
    try {
      const user = info
      const repos = user.repositories.nodes
      for (let i = 0; i < repos.length; i++) {
        let element
        if (repos[i].isFork == false) {
          element = document.getElementById('work_section')
        } else if (includeFork == true) {
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
            <span style="display:${repos[i].description == undefined ? 'none' : 'block'};">${
          repos[i].description
        }</span>
            </div>
            <div class="bottom_section">
                <span style="display:${
                  repos[i].primaryLanguage.name == null ? 'none' : 'inline-block'
                };"><i class="fas fa-code"></i>&nbsp; ${repos[i].primaryLanguage.name}</span>
                <span><i class="fas fa-star"></i>&nbsp; ${repos[i].stargazers.totalCount}</span>
                <span><i class="fas fa-code-branch"></i>&nbsp; ${repos[i].forkCount}</span>
            </div>
        </section>
        </a>`
      }
      let background = 'https://cdn.jsdelivr.net/gh/wangningkai/wangningkai/assets/bg.jpg'

      document.title = user.login
      themeFile = `/assets/themes/${theme}.css`

      // let themeSource = fs.readFileSync(`${dir}/assets/themes/${theme}.css`)
      // themeSource = themeSource.toString('utf-8')
      // let themeTemplate = hbs.compile(themeSource)
      // let styles = themeTemplate({
      //   background: `${background}`,
      // })

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
      document.getElementById('userbio').style.display = user.bio == null || !user.bioHTML ? 'none' : 'block'
      document.getElementById('about').innerHTML = `
              <span style="display:${
                user.company == null || !user.company ? 'none' : 'block'
              };"><i class="fas fa-users"></i> &nbsp; ${user.company}</span>
              <span style="display:${
                user.email == null || !user.email ? 'none' : 'block'
              };"><i class="fas fa-envelope"></i> &nbsp; ${user.email}</span>
              <span style="display:${
                user.blog == null || !user.blog ? 'none' : 'block'
              };"><i class="fas fa-link"></i> &nbsp; <a href="${user.blog}">${user.blog}</a></span>
              <span style="display:${
                user.location == null || !user.location ? 'none' : 'block'
              };"><i class="fas fa-map-marker-alt"></i> &nbsp;&nbsp; ${user.location}</span>
              <span style="display:${
                user.isHireable == false || !user.isHireable ? 'none' : 'block'
              };"><i class="fas fa-user-tie"></i> &nbsp;&nbsp; Available for hire</span>
              <div class="socials">
              <span style="display:${
                twitter == null ? 'none !important' : 'block'
              };"><a href="https://www.twitter.com/${twitter}" target="_blank" class="socials"><i class="fab fa-twitter"></i></a></span>
              <span style="display:${
                dribbble == null ? 'none !important' : 'block'
              };"><a href="https://www.dribbble.com/${dribbble}" target="_blank" class="socials"><i class="fab fa-dribbble"></i></a></span>
              <span style="display:${
                linkedin == null ? 'none !important' : 'block'
              };"><a href="https://www.linkedin.com/in/${linkedin}/" target="_blank" class="socials"><i class="fab fa-linkedin-in"></i></a></span>
              <span style="display:${
                medium == null ? 'none !important' : 'block'
              };"><a href="https://www.medium.com/@${medium}/" target="_blank" class="socials"><i class="fab fa-medium-m"></i></a></span>
              </div>
              `
      return '<!DOCTYPE html>' + window.document.documentElement.outerHTML
    } catch (error) {
      console.error(error)
    }
  })
}
module.exports = renderInfo
