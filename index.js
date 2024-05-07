const {Octokit} = require('@octokit/rest');
const q = require('daskeyboard-applet');
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
            console.log(appletStatus);
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
            const { data } = await this.octokit.repos.getContent({
                owner,
                repo,
                path: ".github/workflows"
            });
            return data.map(file => file.path);
        } catch (error) {
            console.error('Error fetching workflow files:', error);
            return [];
        }
    }

    async fetchWorkflowRuns(owner, repo, branch) {
        const currentFiles = await this.fetchCurrentWorkflowFiles(owner, repo);
        const { data } = await this.octokit.actions.listWorkflowRunsForRepo({
            owner,
            repo,
            branch
        });
        return data.workflow_runs.filter(run => currentFiles.includes(run.path));
    }
    getAppletStatusFromListOfWorkflows(workflows) {
        if (workflows.length === 0) {
            return {
                status: APPLET_STATUSES.NOTHING_YET,
                url: '',
                message: 'No workflows has run yet.'
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
