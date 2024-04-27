const { GitHubActions } = require('../index.js');
jest.mock('@octokit/rest', () => {
  return {
    Octokit: jest.fn().mockImplementation(() => {
      return {
        rest: {
          actions: {
            listRepoWorkflows: jest.fn(),
          },
        },
      };
    }),
  };
});

describe('GitHubActions', () => {
  let githubActions;
  let mockListRepoWorkflows;

  beforeEach(() => {
    githubActions = new GitHubActions();
    mockListRepoWorkflows = githubActions.octokit.rest.actions.listRepoWorkflows;
  });

  it('should create an instance of GitHubActions', () => {
    expect(githubActions).toBeInstanceOf(GitHubActions);
  });

  it('should return the correct color for a pending action', async () => {
    githubActions.octokit.rest.actions.listRepoWorkflows.mockResolvedValueOnce({
      data: {
        workflows: [{ id: 1, state: 'active' }],
      },
    });

    const actions = await githubActions.getGitHubActions();
    const status = githubActions.getStatus(actions);
    const color = githubActions.getColor(status);

    expect(color).toBe('#FFA500');
  });

  it('should return the correct color for a successful action', async () => {
    githubActions.octokit.rest.actions.listRepoWorkflows.mockResolvedValueOnce({
      data: {
        workflows: [{ id: 1, state: 'completed' }],
      },
    });

    const actions = await githubActions.getGitHubActions();
    const status = githubActions.getStatus(actions);
    const color = githubActions.getColor(status);

    expect(color).toBe('#00FF00');
  });

  it('should return the correct color for a failed action', async () => {
    githubActions.octokit.rest.actions.listRepoWorkflows.mockResolvedValueOnce({
      data: {
        workflows: [{ id: 1, state: 'failed' }],
      },
    });

    const actions = await githubActions.getGitHubActions();
    const status = githubActions.getStatus(actions);
    const color = githubActions.getColor(status);

    expect(color).toBe('#FF0000');
  });

});
