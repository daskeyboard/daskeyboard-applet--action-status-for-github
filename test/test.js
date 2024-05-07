const { GitHubActions } = require('../index'); // Adjust the path accordingly

describe('GitHubActions Applet', () => {
  let applet;

  beforeEach(() => {
    applet = new GitHubActions();
    applet.config = { owner: 'example', repo: 'exampleRepo', branch: 'main' };
    applet.authorization = { apiKey: 'fake-api-key' };
    // Mocking Octokit's methods
    applet.octokit = {
      repos: {
        getContent: jest.fn().mockResolvedValue({
          data: [{ path: '.github/workflows/main.yml' }]
        })
      },
      actions: {
        listWorkflowRunsForRepo: jest.fn().mockResolvedValue({
          data: {
            workflow_runs: [
              { name: "Build", created_at: "2022-09-01T12:30:00Z", status: "completed", conclusion: "success", html_url: "http://example.com/build", path: ".github/workflows/main.yml" },
              { name: "Deploy", created_at: "2022-09-01T12:50:00Z", status: "in_progress", html_url: "http://example.com/deploy", path: ".github/workflows/deploy.yml" }
            ]
          }
        })
      }
    };
  });

  test('fetchCurrentWorkflowFiles should fetch workflow file paths', async () => {
    const files = await applet.fetchCurrentWorkflowFiles('example', 'exampleRepo');
    expect(files).toEqual(['.github/workflows/main.yml']);
    expect(applet.octokit.repos.getContent).toHaveBeenCalledWith({
      owner: 'example',
      repo: 'exampleRepo',
      path: '.github/workflows'
    });
  });

  test('fetchWorkflowRuns should return filtered runs by active workflow files', async () => {
    const runs = await applet.fetchWorkflowRuns('example', 'exampleRepo', 'main');
    expect(runs.length).toBe(1);
    expect(runs[0].name).toBe('Build');
  });

  test('getAppletStatusFromListOfWorkflows should determine applet status correctly', () => {
    const workflows = [
      { name: "Build", created_at: "2022-09-01T12:30:00Z", status: "completed", conclusion: "success", html_url: "http://example.com/build" }
    ];
    const status = applet.getAppletStatusFromListOfWorkflows(workflows);
    expect(status.status).toBe('PASS');
    expect(status.url).toBe('http://example.com/build');
    expect(status.message).toBe('All workflows have passed successfully.');
  });

  test('getAppletStatusFromListOfWorkflows should handle failures', () => {
    const workflows = [
      { name: "Build", created_at: "2022-09-01T12:30:00Z", status: "completed", conclusion: "failure", html_url: "http://example.com/build" }
    ];
    const status = applet.getAppletStatusFromListOfWorkflows(workflows);
    expect(status.status).toBe('FAIL');
    expect(status.url).toBe('http://example.com/build');
    expect(status.message).toBe('At least one workflow has failed. Check details.');
  });

  // Additional tests can be added here for running status and empty workflow list
});

