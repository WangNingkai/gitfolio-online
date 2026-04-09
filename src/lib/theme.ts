import fs from 'fs'
import path from 'path'

export type Theme = 'auto' | 'dark' | 'light' | 'dracula'

const THEME_DIR = path.join(process.cwd(), 'assets', 'themes')

export const AVAILABLE_THEMES = new Set(
  fs
    .readdirSync(THEME_DIR)
    .filter((fileName: string) => fileName.endsWith('.css'))
    .map((fileName: string) => fileName.replace(/\.css$/, '') as Theme),
)

export const resolveTheme = (theme: string | undefined): Theme => {
  if (!theme || !AVAILABLE_THEMES.has(theme as Theme)) {
    return 'auto'
  }
  return theme as Theme
}

export const getThemeCss = (theme: Theme, backgroundUrl: string): string => {
  const themePath = path.join(THEME_DIR, `${theme}.css`)
  const css = fs.readFileSync(themePath, 'utf-8')
  return css.replace(/\{\{\{background\}\}\}/g, backgroundUrl)
}

export const GITHUB_CORNER_THEMES: Record<Theme, { fill: string; color: string }> = {
  auto: { fill: 'rgb(10, 10, 10)', color: '#fff' },
  dracula: { fill: '#fff', color: 'rgb(10, 10, 10)' },
  dark: { fill: '#fff', color: 'rgb(10, 10, 10)' },
  light: { fill: 'rgb(10, 10, 10)', color: '#fff' },
}
