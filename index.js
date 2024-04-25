const { Octokit } = require('@octokit/rest');
const q = require('daskeyboard-applet');
const dotenv = require('dotenv');

dotenv.config();

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
        this.octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
        logger.info('GitHub Actions Tracker ready to go!');
    }
    async run() {
        const actions = await this.getGitHubActions();
        const points = this.generatePoints(actions);

        return new q.Signal({
            points: [points],
            name: 'GitHub Actions',
            message: 'Tracking GitHub Actions',
            isMuted: true,
        });
    }
    async getGitHubActions() {
        const { data: actions } = await this.octokit.rest.actions.listRepoWorkflows({
            owner: 'SoulaymaneK',
            repo: 'daskeyboard-applet-github-actions',
        });
        return actions.workflows;
    }
    generatePoints(actions) {
        const numberOfKeys = 10;
        let points = [];

        for (let i = 0; i < numberOfKeys; i++) {
            const action = actions[i];
            const color = action ? this.getColor(action.state) : '#000000';
            points.push(new q.Point(color));
        }

        return points;
    }
    
    getColor(state) {
        switch (state) {
            case 'active':
                return colors.pending;
            case 'completed':
                return colors.success;
            case 'failed':
                return colors.failure;
            default:
                return '#FFFFFF';
        }
    }
}

module.exports = {
    GitHubActions: GitHubActions,
};

const githubActions = new GitHubActions();
