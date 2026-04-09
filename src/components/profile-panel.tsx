import { kFormatter } from '@/lib/utils'
import { sanitizeUrl } from '@/lib/utils'
import type { GitHubUser } from '@/lib/github'

interface ProfilePanelProps {
  user: GitHubUser
}

export default function ProfilePanel({ user }: ProfilePanelProps) {
  const totalStars = user.repositories.nodes.reduce((sum, repo) => sum + repo.stargazers.totalCount, 0)

  return (
    <div id="profile">
      <div id="profile_img" style={{ backgroundImage: `url('${user.avatarUrl}')` }} />
      <div id="username">
        <span style={{ display: user.name == null || !user.name ? 'none' : 'block' }}>{user.name}</span>
        <a href={user.url}>@{user.login}</a>
      </div>
      <div
        id="userbio"
        style={{ display: user.bioHTML == null || !user.bioHTML ? 'none' : 'block' }}
        dangerouslySetInnerHTML={{ __html: user.bioHTML || '' }}
      />
      <div id="about">
        <span style={{ display: user.followers == null || !user.followers ? 'none' : 'flex' }}>
          <i className="fas fa-users" /> {kFormatter(user.followers.totalCount)} followers &middot;{' '}
          {kFormatter(user.following.totalCount)} following
        </span>
        <span style={{ display: 'flex' }}>
          <i className="fas fa-star" /> {kFormatter(totalStars)} stars
        </span>
        <span style={{ display: 'flex' }}>
          <i className="fas fa-history" /> {kFormatter(user.totalCommits)} commits
        </span>
        <span style={{ display: user.company == null || !user.company ? 'none' : 'flex' }}>
          <i className="fas fa-building" /> {user.company}
        </span>
        <span style={{ display: user.websiteUrl == null || !user.websiteUrl ? 'none' : 'flex' }}>
          <i className="fas fa-link" /> <a href={sanitizeUrl(user.websiteUrl)}>{user.websiteUrl}</a>
        </span>
        <span style={{ display: user.location == null || !user.location ? 'none' : 'flex' }}>
          <i className="fas fa-map-marker-alt" /> {user.location}
        </span>
        <span style={{ display: user.isHireable == false || !user.isHireable ? 'none' : 'flex' }}>
          <i className="fas fa-user-tie" /> Available for hire
        </span>
      </div>
    </div>
  )
}
