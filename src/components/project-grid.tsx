import type { GitHubRepository } from '@/lib/github'
import ProjectCard from './project-card'

interface ProjectGridProps {
  repos: GitHubRepository[]
  includeFork: boolean
}

export default function ProjectGrid({ repos, includeFork }: ProjectGridProps) {
  const workRepos: GitHubRepository[] = []
  const forkRepos: GitHubRepository[] = []

  for (const repo of repos) {
    if (repo.isFork === false) {
      workRepos.push(repo)
    } else if (repo.isFork === true && includeFork === true) {
      forkRepos.push(repo)
    }
  }

  return (
    <div id="display">
      <div id="work">
        <h1>Work.</h1>
        <div className="projects">
          {workRepos.map((repo) => (
            <ProjectCard key={repo.nameWithOwner} repo={repo} />
          ))}
        </div>
      </div>

      {includeFork === true && forkRepos.length > 0 && (
        <div id="forks" style={{ display: 'block' }}>
          <h1>Forks.</h1>
          <div className="projects" id="forks_section">
            {forkRepos.map((repo) => (
              <ProjectCard key={repo.nameWithOwner} repo={repo} />
            ))}
          </div>
        </div>
      )}

      <div id="footer">
        <a href="https://github.com/wangningkai" target="_blank" rel="noopener noreferrer">
          made on earth by a human
        </a>
      </div>
    </div>
  )
}
