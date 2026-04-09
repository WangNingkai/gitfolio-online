import { kFormatter } from '@/lib/utils'
import { getLanguageColor } from '@/lib/colors'
import type { GitHubRepository } from '@/lib/github'

interface ProjectCardProps {
  repo: GitHubRepository
}

export default function ProjectCard({ repo }: ProjectCardProps) {
  const languageColor = repo.primaryLanguage ? getLanguageColor(repo.primaryLanguage.name) : null

  return (
    <a href={repo.url} target="_blank" rel="noopener noreferrer">
      <section>
        <div className="section_title">{repo.name}</div>
        <div className="about_section">
          <span
            style={{
              display: repo.shortDescriptionHTML === undefined || !repo.shortDescriptionHTML ? 'none' : 'block',
            }}
            dangerouslySetInnerHTML={{ __html: repo.shortDescriptionHTML || '' }}
          />
        </div>
        <div className="bottom_section">
          <span className="lang-tag" style={{ display: repo.primaryLanguage == null ? 'none' : 'inline-flex' }}>
            <span className="lang-dot" style={{ background: languageColor ?? undefined }} />
            {repo.primaryLanguage?.name ?? ''}
          </span>
          <span>
            <i className="fas fa-star" /> {kFormatter(repo.stargazers.totalCount)}
          </span>
          <span>
            <i className="fas fa-code-branch" /> {kFormatter(repo.forkCount)}
          </span>
        </div>
      </section>
    </a>
  )
}
