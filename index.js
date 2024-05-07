const {Octokit} = require('@octokit/rest');
const q = require('daskeyboard-applet');
const logger = q.logger;
const Status = require('./status');

const colors = {
    [Status.PENDING]: '#FFA500',
    [Status.SUCCESS]: '#00FF00',
    [Status.FAILURE]: '#FF0000',
};


class ActionStatusForGithub extends q.DesktopApp {
    constructor() {
        super();
        // Run every 30 seconds
        this.pollingInterval = 0.5 * 60 * 1000;
    }

    async applyConfig() {
        this.octokit = new Octokit({auth: this.config.apiKey});
    }

    isConfigured() {
        return this.octokit && this.config.owner?.length > 0 && this.config.repo?.length > 0;
    }

    async run() {
        if (!this.isConfigured()) {
            logger.warn('Applet not configured yet. Waiting for configuration.');
            return;
        }
        try {
            const actions = await this.fetchWorkflowRuns(this.config.owner, this.config.repo);
            const status = this.getStatus(actions);
            const color = this.getColor(status);
        } catch (error) {
            logger.error(
                `Got error sending request to service: ${JSON.stringify(error)}`);
            if (`${error.message}`.includes("getaddrinfo")) {
                // Do not send signal when getting internet connection error
                // return q.Signal.error(
                //   'The Montastic service returned an error. <b>Please check your internet connection</b>.'
                // );
            } else {
                return q.Signal.error([
                    'The Github service returned an error. <b>Please check your Github token and its permissions</b>.',
                    `Detail: ${error.message}`
                ]);
            }

        }

        // try {
        //     const actions = await this.getGitHubActions();
        //     const status = this.getStatus(actions);
        //     const color = this.getColor(status);
        //
        //     return new q.Signal({
        //         points: [new q.Point(color)],
        //         name: this.getSignalName(status, actions),
        //         message: this.getSignalMessage(status, actions),
        //         link: this.getSignalLink(status, actions),
        //         isMuted: true,
        //     });
        // } catch (error) {
        //     logger.error('Error fetching GitHub Actions:', error);
        //     return new q.Signal({
        //         points: [new q.Point('#FF0000')],
        //         name: 'GitHub Actions',
        //         message: 'Error fetching GitHub Actions. Please check your configuration and API key.',
        //         isMuted: false,
        //     });
        // }
    }

    async fetchWorkflowRuns(owner, repo) {
        const response = await this.octokit.actions.listWorkflowRunsForRepo(
            {
                owner,
                repo,
            }
        )
        console.log('response', response.data);
        return []
    }

    // async getGitHubActions() {
    //   const response = await this.octokit.request(`GET /repos/${this.owner}/${this.repo}/actions/workflows`, {
    //     headers: this.serviceHeaders,
    //   });
    //   console.log('response data', response.data)
    //   return response.data.workflows.map((workflow) => [workflow.name, workflow.state, workflow.conclusion]);
    // }

    getStatus(actions) {
        let hasPending = false;
        let hasFailed = false;
        let hasSuccess = false;
        const Default = Status.DEFAULT;

        for (const action of actions) {
            switch (action[1]) {
                case Status.ACTIVE:
                    hasPending = true;
                    break;
                case Status.COMPLETED:
                    if (action[2] === Status.SUCCESS) {
                        hasSuccess = true;
                    } else if (action[2] === Status.FAILURE) {
                        hasFailed = true;
                    }
                    break;
            }
        }

        if (hasFailed) {
            return Status.FAILURE;
        } else if (hasPending) {
            return Status.PENDING;
        } else if (hasSuccess) {
            return Status.SUCCESS;
        } else {
            return Default;
        }
    }

    getColor(status) {
        return colors[status] || '#FFFFFF';
    }

    getSignalName(status, actions) {
        if (status === Status.FAILURE) {
            return 'name : Github action failed';
        }
        return 'name : GitHub Actions';
    }

    getSignalMessage(status, actions) {
        if (status === Status.FAILURE) {
            const failedAction = actions.find((action) => action[1] === Status.FAILED);
            return `message : Your workflow ${failedAction[0]} failed`;
        }
        return 'message : Tracking GitHub Actions';
    }

    getSignalLink(status, actions) {
        if (status === Status.FAILURE) {
            const failedAction = actions.find((action) => action[1] === Status.FAILED);
            return `Your workflow ${failedAction[0]} failed. Link: ${failedAction[3]}`;
        }
        return `Link: https://github.com/${this.config.owner}/${this.config.repo}/actions`;
    }
}

const githubActions = new ActionStatusForGithub();


module.exports = {
    GitHubActions: ActionStatusForGithub,
};
