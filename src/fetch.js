const { request, logger } = require("./utils");
const retryer = require("./retryer");
require("dotenv").config();

const fetcher = (variables, token) => {
  return request(
    {
      query: `
      fragment RepoInfo on Repository {
        name
        nameWithOwner
        isPrivate
        isArchived
        isTemplate
        stargazers {
          totalCount
        }
        description
        primaryLanguage {
          color
          id
          name
        }
        forkCount
        url
      }

      query userInfo($username: String!) {
        user(login: $username) {
          name
          login
          avatarUrl
          bio
          status {
            emoji
            message
          }
          company
          location
          url
          repositories(first: 10, ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC, orderBy: {
            direction: DESC,
            field: STARGAZERS
          }) {
            totalCount
            nodes {
              ...RepoInfo
            }
          }
          contributionsCollection {
            totalCommitContributions
          }
          repositoriesContributedTo(first: 1, contributionTypes: [COMMIT, ISSUE, PULL_REQUEST, REPOSITORY]) {
            totalCount
          }
          pullRequests(first: 1) {
            totalCount
          }
          issues(first: 1) {
            totalCount
          }
          followers {
            totalCount
          }
        }
      }
      `,
      variables,
    },
    {
      Authorization: `bearer ${token}`,
    }
  );
};

async function fetchInfo(username) {
  if (!username) throw Error("Invalid username");
  let res = await retryer(fetcher, {
    username: username,
  });

  if (res.data.errors) {
    logger.error(res.data.errors);
    throw Error(res.data.errors[0].message || "Could not fetch user");
  }

  const user = res.data.data.user;

  return user;
}

module.exports = fetchInfo;
