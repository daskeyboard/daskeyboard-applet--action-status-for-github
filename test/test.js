const {GitHubActions} = require('../index'); // Adjust the path accordingly
const yaml = require('js-yaml');

jest.mock('js-yaml', () => ({
    load: jest.fn()
}));

describe('GitHubActions Applet', () => {
    let applet;

    beforeEach(() => {
        applet = new GitHubActions();
        applet.config = {owner: 'example', repo: 'exampleRepo', branch: 'main'};
        applet.authorization = {apiKey: 'fake-api-key'};
        // Mocking Octokit's methods
        applet.octokit = {
            repos: {
                getContent: jest.fn()
            },
            actions: {
                listWorkflowRunsForRepo: jest.fn().mockResolvedValue({
                    data: {
                        workflow_runs: [
                            {
                                id: 1,
                                name: "Build",
                                created_at: "2022-09-01T12:30:00Z",
                                status: "completed",
                                conclusion: "success",
                                html_url: "http://example.com/build",
                                path: ".github/workflows/main.yml",
                                jobs_url: "http://example.com/jobs"
                            }
                        ]
                    }
                })
            },
            request: jest.fn().mockResolvedValue({
                data: {
                    jobs: [{name: "Build"}]
                }
            })
        };
        applet.fetchJobsForRun = jest.fn().mockResolvedValue(['Build']);
        yaml.load.mockReturnValue({jobs: {Build: {}}});
        applet.octokit.repos.getContent.mockImplementation((params) => {
            if (params.path === ".github/workflows") {
                return {
                    data: [{path: '.github/workflows/main.yml', type: 'file'}]
                }
            } else {
                return {
                    // Encode the string 'encoded_content' to Base64
                    data: {
                        content: Buffer.from('encoded_content').toString('base64')
                    }
                }
            }
        })
    });


    test('fetchCurrentWorkflowFiles should fetch and decode workflow files', async () => {
        const files = await applet.fetchCurrentWorkflowFiles('example', 'exampleRepo');
        expect(files).toEqual([{path: '.github/workflows/main.yml', content: 'encoded_content'}]);
        expect(applet.octokit.repos.getContent).toHaveBeenCalledWith({
            owner: 'example',
            repo: 'exampleRepo',
            path: ".github/workflows"
        });
    });

    test('fetchWorkflowRuns should return active workflow runs based on current job configurations', async () => {
        const runs = await applet.fetchWorkflowRuns('example', 'exampleRepo', 'main');
        expect(runs.length).toBe(1);
        expect(runs[0].id).toBe(1);
        expect(applet.fetchJobsForRun).toHaveBeenCalled();
        expect(yaml.load).toHaveBeenCalled();
    });

    test('getAppletStatusFromListOfWorkflows should handle different workflow states correctly', () => {
        const workflows = [
            {
                name: "Build",
                created_at: "2022-09-01T12:30:00Z",
                status: "completed",
                conclusion: "success",
                html_url: "http://example.com/build"
            }
        ];
        const status = applet.getAppletStatusFromListOfWorkflows(workflows);
        expect(status.status).toBe('PASS');
        expect(status.url).toBe('http://example.com/build');
        expect(status.message).toBe('All workflows have passed successfully.');
    });

    test('getAppletStatusFromListOfWorkflows should account for running and failed states', () => {
        const workflows = [
            {
                name: "Deploy",
                created_at: "2022-09-02T12:30:00Z",
                status: "in_progress",
                html_url: "http://example.com/deploy"
            },
            {
                name: "Build",
                created_at: "2022-09-01T12:30:00Z",
                status: "completed",
                conclusion: "failure",
                html_url: "http://example.com/build"
            }
        ];
        const status = applet.getAppletStatusFromListOfWorkflows(workflows);
        expect(status.status).toBe('RUNNING');
        expect(status.url).toBe('http://example.com/deploy');
        expect(status.message).toBe('Workflows are still running.');
    });

    test('getAppletStatusFromListOfWorkflows should account for passed and failed states', () => {
        const workflows = [
            {
                name: "Deploy",
                created_at: "2022-09-02T12:30:00Z",
                status: "completed",
                conclusion: "success",
                html_url: "http://example.com/deploy"
            },
            {
                name: "Build",
                created_at: "2022-09-01T12:30:00Z",
                status: "completed",
                conclusion: "failure",
                html_url: "http://example.com/build"
            }
        ];
        const status = applet.getAppletStatusFromListOfWorkflows(workflows);
        expect(status.status).toBe('FAIL');
        expect(status.url).toBe('http://example.com/build');
        expect(status.message).toBe('At least one workflow has failed. Check details.');
    });

    // Additional tests can be added here for error handling and edge cases
});

