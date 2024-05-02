const { GitHubActions } = require('../index.js');
const Status = require('../status');
jest.mock('@octokit/rest', () => {
  return {
    Octokit: jest.fn().mockImplementation(() => {
      return {
        request: jest.fn(),
      };
    }),
  };
});

describe('GitHubActions', () => {
  let githubActions;
  let mockRequest;

  beforeEach(() => {
    githubActions = new GitHubActions();
    mockRequest = githubActions.octokit.request;
  });

  it('should create an instance of GitHubActions', () => {
    expect(githubActions).toBeInstanceOf(GitHubActions);
  });

  describe('getColor', () => {
    it('should return the correct color for a pending action', async () => {
      mockRequest.mockResolvedValueOnce({
        data: {
          workflows: [{ id: 1, state: Status.ACTIVE }],
        },
      });
      githubActions.owner = 'testOwner';
      githubActions.repo = 'testRepo';

      const actions = await githubActions.getGitHubActions();
      const status = githubActions.getStatus(actions);
      const color = githubActions.getColor(status);

      expect(color).toBe('#FFA500');
    });

    it('should return the correct color for a successful action', async () => {
      mockRequest.mockResolvedValueOnce({
        data: {
          workflows: [{ id: 1, state: Status.COMPLETED, conclusion: Status.SUCCESS }],
        },
      });
      githubActions.owner = 'testOwner';
      githubActions.repo = 'testRepo';

      const actions = await githubActions.getGitHubActions();
      const status = githubActions.getStatus(actions);
      const color = githubActions.getColor(status);

      expect(color).toBe('#00FF00');
    });

    it('should return the correct color for a failed action', async () => {
      mockRequest.mockResolvedValueOnce({
        data: {
          workflows: [{ id: 1, state: Status.COMPLETED, conclusion: Status.FAILURE }],
        },
      });
      githubActions.owner = 'testOwner';
      githubActions.repo = 'testRepo';

      const actions = await githubActions.getGitHubActions();
      const status = githubActions.getStatus(actions);
      const color = githubActions.getColor(status);

      expect(color).toBe('#FF0000');
    });

    it('should return the correct color for 3 failure workflows', async () => {
      mockRequest.mockResolvedValueOnce({
        data: {
          workflows: [
            { id: 1, state: Status.COMPLETED, conclusion: Status.FAILURE },
            { id: 2, state: Status.COMPLETED, conclusion: Status.FAILURE },
            { id: 3, state: Status.COMPLETED, conclusion: Status.FAILURE },
          ],
        },
      });
      githubActions.owner = 'testOwner';
      githubActions.repo = 'testRepo';

      const actions = await githubActions.getGitHubActions();
      const status = githubActions.getStatus(actions);
      const color = githubActions.getColor(status);

      expect(color).toBe('#FF0000');
    });
  });

  it('should return the correct status for various workflows', async () => {
    const testCases = [
      { workflows: [{ id: 1, state: Status.ACTIVE }], expectedStatus: Status.PENDING },
      { workflows: [{ id: 1, state: Status.COMPLETED, conclusion: Status.SUCCESS }], expectedStatus: Status.SUCCESS },
      { workflows: [{ id: 1, state: Status.COMPLETED, conclusion: Status.FAILURE }], expectedStatus: Status.FAILURE },
      { workflows: [{ id: 1, state: Status.ACTIVE }, { id: 2, state: Status.COMPLETED, conclusion: Status.SUCCESS }], expectedStatus: Status.PENDING },
      { workflows: [{ id: 1, state: Status.ACTIVE }, { id: 2, state: Status.COMPLETED, conclusion: Status.FAILURE }], expectedStatus: Status.FAILURE },
      { workflows: [{ id: 1, state: Status.COMPLETED, conclusion: Status.SUCCESS }, { id: 2, state: Status.COMPLETED, conclusion: Status.FAILURE }], expectedStatus: Status.FAILURE },
      { workflows: [{ id: 1, state: Status.COMPLETED, conclusion: Status.SUCCESS }, { id: 2, state: Status.COMPLETED, conclusion: Status.SUCCESS }], expectedStatus: Status.SUCCESS },
    ];

    for (const testCase of testCases) {
      mockRequest.mockResolvedValueOnce({ data: { workflows: testCase.workflows } });
      githubActions.owner = 'testOwner';
      githubActions.repo = 'testRepo';

      const actions = await githubActions.getGitHubActions();
      const status = githubActions.getStatus(actions);

      expect(status).toBe(testCase.expectedStatus);
    }
  });
});
