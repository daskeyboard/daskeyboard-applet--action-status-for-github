const { Octokit } = require('@octokit/rest');
const q = require('daskeyboard-applet');
const Status = require('./status');

const colors = {
  [Status.PENDING]: '#FFA500',
  [Status.SUCCESS]: '#00FF00',
  [Status.FAILURE]: '#FF0000',
};

const logger = q.logger;

class GitHubActions extends q.DesktopApp {
  constructor() {
    super();
    this.pollingInterval = 60000;
    this.octokit = new Octokit();
  }

  async applyConfig() {
    this.serviceHeaders = {
      "Content-Type": "application/json",
      "X-API-KEY": this.authorization.apiKey,
    };
    this.owner = this.config.owner;
    this.repo = this.config.repo;
    if (!this.owner || !this.repo) {
      logger.warn('Owner or repository is not set. Please configure the applet.');
      return false;
    }
    logger.info('GitHub Actions Tracker ready to go!');
    return true;
  }

  async getGitHubActions() {
    const response = await this.octokit.request(`GET /repos/${this.owner}/${this.repo}/actions/workflows`, {
      headers: this.serviceHeaders,
    });
    return response.data.workflows.map((workflow) => [workflow.name, workflow.state, workflow.conclusion]);
  }

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

  async run() {
    if (!this.configured) {
      logger.warn('Applet not configured yet. Waiting for configuration.');
      return;
    }

    try {
      const actions = await this.getGitHubActions();
      const status = this.getStatus(actions);
      const color = this.getColor(status);

      return new q.Signal({
        points: [new q.Point(color)],
        name: this.getSignalName(status, actions),
        message: this.getSignalMessage(status, actions),
        link: this.getSignalLink(status, actions),
        isMuted: true,
      });
    } catch (error) {
      logger.error('Error fetching GitHub Actions:', error);
      return new q.Signal({
        points: [new q.Point('#FF0000')],
        name: 'GitHub Actions',
        message: 'Error fetching GitHub Actions. Please check your configuration and API key.',
        isMuted: false,
      });
    }
  }
}

const githubActions = new GitHubActions();

(async () => {
  await githubActions.applyConfig();
  githubActions.run();
})();


module.exports = {
  GitHubActions: GitHubActions,
};
