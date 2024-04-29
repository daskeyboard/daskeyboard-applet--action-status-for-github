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

  describe('getColor', () => {
    it('should return the correct color for a pending action', async () => {
      mockListRepoWorkflows.mockResolvedValueOnce({
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
      mockListRepoWorkflows.mockResolvedValueOnce({
        data: {
          workflows: [{ id: 1, state: 'completed', conclusion: 'success' }],
        },
      });

      const actions = await githubActions.getGitHubActions();
      const status = githubActions.getStatus(actions);
      const color = githubActions.getColor(status);

      expect(color).toBe('#00FF00');
    });

    it('should return the correct color for a failed action', async () => {
      mockListRepoWorkflows.mockResolvedValueOnce({
        data: {
          workflows: [{ id: 1, state: 'completed', conclusion: 'failure' }],
        },
      });

      const actions = await githubActions.getGitHubActions();
      const status = githubActions.getStatus(actions);
      const color = githubActions.getColor(status);

      expect(color).toBe('#FF0000');
    });

    it('should return the correct color for 3 failure workflows', async () => {
      mockListRepoWorkflows.mockResolvedValueOnce({
        data: {
          workflows: [
            { id: 1, state: 'completed', conclusion: 'failure' },
            { id: 2, state: 'completed', conclusion: 'failure' },
            { id: 3, state: 'completed', conclusion: 'failure' },
          ],
        },
      });

      const actions = await githubActions.getGitHubActions();
      const status = githubActions.getStatus(actions);
      const color = githubActions.getColor(status);

      expect(color).toBe('#FF0000');
    });
  });

  it('should return the correct status for various workflows', async () => {
    const testCases = [
      { workflows: [{ id: 1, state: 'active' }], expectedStatus: 'pending' },
      { workflows: [{ id: 1, state: 'completed', conclusion: 'success' }], expectedStatus: 'success' },
      { workflows: [{ id: 1, state: 'completed', conclusion: 'failure' }], expectedStatus: 'failure' },
      { workflows: [{ id: 1, state: 'active' }, { id: 2, state: 'completed', conclusion: 'success' }], expectedStatus: 'pending' },
      { workflows: [{ id: 1, state: 'active' }, { id: 2, state: 'completed', conclusion: 'failure' }], expectedStatus: 'failure' },
      { workflows: [{ id: 1, state: 'completed', conclusion: 'success' }, { id: 2, state: 'completed', conclusion: 'failure' }], expectedStatus: 'failure' },
      { workflows: [{ id: 1, state: 'completed', conclusion: 'success' }, { id: 2, state: 'completed', conclusion: 'success' }], expectedStatus: 'success' },
    ];
  
    for (const testCase of testCases) {
      mockListRepoWorkflows.mockResolvedValueOnce({ data: { workflows: testCase.workflows } });
  
      const actions = await githubActions.getGitHubActions();
      const status = githubActions.getStatus(actions);
  
      expect(status).toBe(testCase.expectedStatus);
    }
  });
});
