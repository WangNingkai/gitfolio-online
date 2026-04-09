import type { Metadata } from 'next'
import { fetchInfo, type GitHubUser } from '@/lib/github'
import { resolveTheme, type Theme, getThemeCss } from '@/lib/theme'
import { clampValue, parseBoolean, CONSTANTS } from '@/lib/utils'
import ProfilePanel from '@/components/profile-panel'
import ProjectGrid from '@/components/project-grid'
import GithubCorner from '@/components/github-corner'

interface PageProps {
  params: Promise<{ username: string }>
  searchParams: Promise<{
    theme?: string
    includeFork?: string
    cache_seconds?: string
    repoNum?: string
  }>
}

const BACKGROUND_IMAGE = 'https://cdn.jsdelivr.net/gh/WangNingkai/BingImageApi@latest/images/latest.png'

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params
  return {
    title: username,
  }
}

export const revalidate = 1800

function renderError(message: string, secondaryMessage = 'Opps!'): string {
  const safeMessage = message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
  const safeSecondary = secondaryMessage
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
  return `
    <style>
      html,body{background:#fff;color:#636b6f;font-family:'Nunito',sans-serif;font-weight:100;height:100vh;margin:0}
      .full-height{height:100vh}
      .flex-center{align-items:center;display:flex;justify-content:center}
      .position-ref{position:relative}
      .code{border-right:2px solid;font-size:26px;padding:0 15px 0 15px;text-align:center}
      .message{font-size:18px;text-align:center}
    </style>
    <div class="flex-center position-ref full-height">
      <div class="code">${safeSecondary}</div>
      <div class="message" style="padding:10px;">${safeMessage}</div>
    </div>
  `
}

export default async function UsernamePage({ params, searchParams }: PageProps) {
  const { username } = await params
  const { theme: themeParam, includeFork: includeForkParam, cache_seconds, repoNum: repoNumParam } = await searchParams

  const parsedRepoNum = clampValue(parseInt(repoNumParam || '30', 10) || 30, 1, 100)

  let user: GitHubUser
  try {
    user = await fetchInfo(username, parsedRepoNum)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    const isInvalid = message === 'Invalid username'
    return (
      <div
        dangerouslySetInnerHTML={{
          __html: renderError(message, isInvalid ? 'Invalid Username' : 'Opps!'),
        }}
      />
    )
  }

  const activeTheme = resolveTheme(themeParam)
  const includeFork = parseBoolean(includeForkParam) === true

  const themeCss = getThemeCss(activeTheme, BACKGROUND_IMAGE)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: themeCss }} />
      <link rel="icon" href={user.avatarUrl} type="image/png" />
      <GithubCorner url={user.url} theme={activeTheme} />
      <ProfilePanel user={user} />
      <ProjectGrid repos={user.repositories.nodes} includeFork={includeFork} />
    </>
  )
}
