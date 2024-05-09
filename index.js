const {Octokit} = require('@octokit/rest');
const q = require('daskeyboard-applet');
const yaml = require('js-yaml');
const logger = q.logger;


const APPLET_STATUSES = {
    NOTHING_YET: 'NOTHING_YET', // No runs
    RUNNING: 'RUNNING', // All workflows are pending or in_progress
    PASS: 'PASS',       // All workflows succeeded
    FAIL: 'FAIL'        // At least one workflow failed
};

const GITHUB_STATUSES = {
    COMPLETED: 'completed',
    ACTION_REQUIRED: 'action_required',
    CANCELLED: 'cancelled',
    FAILURE: 'failure',
    NEUTRAL: 'neutral',
    SKIPPED: 'skipped',
    STALE: 'stale',
    SUCCESS: 'success',
    TIMED_OUT: 'timed_out',
    IN_PROGRESS: 'in_progress',
    QUEUED: 'queued',
    REQUESTED: 'requested',
    WAITING: 'waiting',
    PENDING: 'pending'
};

const COLORS = {
    [APPLET_STATUSES.RUNNING]: '#FFA500',
    [APPLET_STATUSES.PASS]: '#00FF00',
    [APPLET_STATUSES.FAIL]: '#FF0000',
};

const EFFECTS = {
    [APPLET_STATUSES.RUNNING]: q.Effects.BLINK,
    [APPLET_STATUSES.PASS]: q.Effects.SET_COLOR,
    [APPLET_STATUSES.FAIL]: q.Effects.SET_COLOR
}


class ActionStatusForGithub extends q.DesktopApp {
    constructor() {
        super();
        // Run every 30 seconds
        this.pollingInterval = 0.5 * 60 * 1000;
    }

    async applyConfig() {
        this.octokit = new Octokit({auth: this.authorization.apiKey});
    }

    isConfigured() {
        return this.octokit && this.config.owner?.length > 0 && this.config.repo?.length > 0 && this.config.branch?.length > 0;
    }

    async run() {
        if (!this.isConfigured()) {
            logger.warn('Applet not configured yet. Waiting for configuration.');
            return;
        }
        try {
            const workflowRuns = await this.fetchWorkflowRuns(this.config.owner,
                this.config.repo,
                this.config.branch);
            const appletStatus = this.getAppletStatusFromListOfWorkflows(workflowRuns)
            return new q.Signal({
                points: [[new q.Point(COLORS[appletStatus.status], EFFECTS[appletStatus.status])]],
                name: `Action Status for ${this.config.owner}/${this.config.repo}/${this.config.branch}`,
                message: appletStatus.message,
                link: {
                    url: appletStatus.url,
                    label: 'View on Github'
                }
            })
        } catch (error) {
            logger.error(
                `Got error sending request to service: ${error}`);
            if (`${error.message}`.includes("getaddrinfo")) {
                // Do not send signal when getting internet connection error
            } else {
                return q.Signal.error([
                    'The Github service returned an error. <b>Please check your Github token and its permissions</b>.',
                    `Detail: ${error.message}`
                ]);
            }

        }

    }


    async fetchCurrentWorkflowFiles(owner, repo) {
        try {
            const {data} = await this.octokit.repos.getContent({
                owner,
                repo,
                path: ".github/workflows"
            });
            const files = await Promise.all(data.map(async file => {
                const fileData = await this.octokit.repos.getContent({
                    owner,
                    repo,
                    path: file.path
                });
                return {
                    path: file.path,
                    content: Buffer.from(fileData.data.content, 'base64').toString('utf8') // Decoding from Base64
                };
            }));
            return files;
        } catch (error) {
            logger.error(`Error fetching workflow files: ${error}`);
            return [];
        }
    }

    /**
     * Fetches workflow runs for a specified GitHub repository branch and filters them
     * based on currently active workflow files in the repository. This ensures that only
     * relevant workflows (those defined in the `.github/workflows` directory) are considered.
     *
     * @param {string} owner - The GitHub username or organization name that owns the repository.
     * @param {string} repo - The name of the repository from which to fetch workflow runs.
     * @param {string} branch - The branch name for which to fetch workflow runs.
     * @returns {Promise<Array>} - A promise that resolves to an array of workflow runs that are active,
     *                              filtering out any that correspond to deleted or inactive workflows.
     */

    async fetchWorkflowRuns(owner, repo, branch) {
        const currentWorkflows = await this.fetchCurrentWorkflowFiles(owner, repo);
        const {data} = await this.octokit.actions.listWorkflowRunsForRepo({
            owner,
            repo,
            branch
        });

        // Map each run to a promise that resolves whether the run is active
        const runs = await Promise.all(data.workflow_runs.map(async run => {
            const jobs = await this.fetchJobsForRun(run.jobs_url);
            const workflowFile = currentWorkflows.find(wf => wf.path === run.path);
            if (workflowFile && await this.isRunJobActive(jobs, workflowFile.content)) {
                return run; // Keep this run as it's still active
            }
            return null; // Filter out this run as it's not active anymore
        }));

        // Filter out null values from runs array
        return runs.filter(run => run !== null);
    }


    async fetchJobsForRun(jobsUrl) {
        try {
            const {data} = await this.octokit.request(jobsUrl);
            return data.jobs.map(job => job.name);  // Assuming the job details are in `data.jobs`
        } catch (error) {
            logger.error(`Error fetching job details: ${error}`);
            return [];
        }
    }

    async isRunJobActive(runJobs, workflowContent) {
        try {
            const workflowData = yaml.load(workflowContent);
            const activeJobs = workflowData.jobs ? Object.keys(workflowData.jobs) : [];

            // Check if any of the jobs in the run still exists in the active job list from the YAML
            return runJobs.some(jobName => activeJobs.includes(jobName));
        } catch (error) {
            logger.error(`Error parsing workflow YAML: ${error}`)
            return false;
        }
    }

    /**
     * Analyzes a list of GitHub workflow runs and determines the overall status of these workflows.
     * This method groups workflows by name to select the most recent run for each workflow, then
     * evaluates their status to provide a summarized status of RUNNING, PASS, or FAIL. Additionally,
     * it determines the most relevant URL to view the details of the workflow state in the GitHub UI.
     *
     * @param {Array} workflows - An array of workflow run objects from GitHub, where each object
     *                            includes properties like name, created_at, status, conclusion, and html_url.
     * @returns {Object} - An object containing:
     *                     - status: A string representing the overall status (RUNNING, PASS, or FAIL).
     *                     - url: A string URL pointing to the most relevant workflow run for further details.
     *                     - message: A descriptive message about the overall workflow status.
     */
    getAppletStatusFromListOfWorkflows(workflows) {
        if (workflows.length === 0) {
            return {
                status: APPLET_STATUSES.NOTHING_YET,
                url: '',
                message: 'No workflows have run yet.'
            };
        }

        // Group workflows by name and select the most recent run of each
        const latestWorkflows = {};
        workflows.forEach(workflow => {
            if (!latestWorkflows[workflow.name] || new Date(latestWorkflows[workflow.name].created_at) < new Date(workflow.created_at)) {
                latestWorkflows[workflow.name] = workflow;
            }
        });


        const latestRuns = Object.values(latestWorkflows);
        const hasRunning = latestRuns.some(run => run.status !== GITHUB_STATUSES.COMPLETED);
        const hasFailures = latestRuns.some(run => run.status === GITHUB_STATUSES.COMPLETED && run.conclusion === GITHUB_STATUSES.FAILURE);

        // Default to the most recent run's URL
        let mostRelevantUrl = latestRuns[latestRuns.length - 1].html_url;

        if (hasRunning) {
            const firstRunning = latestRuns.find(run => run.status !== GITHUB_STATUSES.COMPLETED);
            return {
                status: APPLET_STATUSES.RUNNING,
                url: firstRunning ? firstRunning.html_url : mostRelevantUrl,
                message: 'Workflows are still running.'
            };
        } else if (hasFailures) {
            // Find the first failed workflow for the URL
            const firstFailed = latestRuns.find(run => run.conclusion === GITHUB_STATUSES.FAILURE);
            mostRelevantUrl = firstFailed ? firstFailed.html_url : mostRelevantUrl;
            return {
                status: APPLET_STATUSES.FAIL,
                url: mostRelevantUrl,
                message: 'At least one workflow has failed. Check details.'
            };
        } else {
            return {
                status: APPLET_STATUSES.PASS,
                url: mostRelevantUrl,
                message: 'All workflows have passed successfully.'
            };
        }
    }

}

const githubActions = new ActionStatusForGithub();


module.exports = {
    GitHubActions: ActionStatusForGithub,
};
