const { GitHubActions } = require('../index');

jest.mock('@octokit/rest', () => {
  return {
    Octokit: jest.fn().mockImplementation(() => {
      return {
        rest: {
          actions: {
            listRepoWorkflows: jest.fn().mockResolvedValue({
              data: {
                workflows: [
                  { id: 1, state: 'active' },
                  { id: 2, state: 'completed' },
                  { id: 3, state: 'failed' },
                ],
              },
            }),
          },
        },
      };
    }),
  };
});

describe('GitHubActions', () => {
  let githubActions;

  beforeEach(() => {
    githubActions = new GitHubActions();
  });

  it('should create an instance of GitHubActions', () => {
    expect(githubActions).toBeInstanceOf(GitHubActions);
  });

  it('should return correct colors for GitHub Actions states', async () => {
    const actions = await githubActions.getGitHubActions();
    const points = githubActions.generatePoints(actions);

    expect(points[0].color).toBe('#FFA500'); // pending
    expect(points[1].color).toBe('#00FF00'); // success
    expect(points[2].color).toBe('#FF0000'); // failure
  });
});
