const { Octokit } = require('@octokit/rest');
const q = require('daskeyboard-applet');

const colors = {
  pending: '#FFA500',
  success: '#00FF00',
  failure: '#FF0000',
};

const logger = q.logger;

class GitHubActions extends q.DesktopApp {
  constructor() {
    super();
    this.pollingInterval = 60000;
    this.octokit = new Octokit({ auth: this.authorization.apiKey });
    this.owner = this.options.owner;
    this.repo = this.options.repo;
    logger.info('GitHub Actions Tracker ready to go!');
  }

  async run() {
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
  }

  async getGitHubActions() {
    const { data: actions } = await this.octokit.rest.actions.listRepoWorkflows({
      owner: this.owner,
      repo: this.repo,
    });
    return actions.workflows;
  }

  getStatus(actions) {
    let hasPending = false;
    let hasFailed = false;
    let hasSuccess = false;

    for (const action of actions) {
      switch (action.state) {
        case 'active':
          hasPending = true;
          break;
        case 'completed':
          hasSuccess = true;
          break;
        case 'failed':
          hasFailed = true;
          break;
      }
    }

    if (hasFailed) {
      return 'failure';
    } else if (hasPending) {
      return 'pending';
    } else if (hasSuccess) {
      return 'success';
    } else {
      return 'idle';
    }
  }

  getColor(status) {
    switch (status) {
      case 'pending':
        return colors.pending;
      case 'success':
        return colors.success;
      case 'failure':
        return colors.failure;
      default:
        return '#FFFFFF';
    }
  }

  getSignalName(status, actions) {
    if (status === 'failure') {
      return 'name : Github action failed';
    }
    return 'name : GitHub Actions';
  }

  getSignalMessage(status, actions) {
    if (status === 'failure') {
      const failedAction = actions.find((action) => action.state === 'failed');
      return 'message : Your workflow ${failedAction.name} failed';
    }
    return 'message : Tracking GitHub Actions';
  }

  getSignalLink(status, actions) {
    if (status === 'failure') {
      const failedAction = actions.find((action) => action.state === 'failed');
      return 'Your workflow ${failedAction.name} failed. Link: ${failedAction.html_url}';
    }
    return '';
  }
}

module.exports = {
  GitHubActions: GitHubActions,
};

const githubActions = new GitHubActions();
