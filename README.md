GitHub Actions Das Keyboard Q Applet
===================================

This applet allows you to track the progress of GitHub Actions within a repository directly on your Das Keyboard Q. Each key represents an action and changes color based on its status: orange when an action starts, green upon successful completion, and red if the action fails.

Installation
------------
Requires a Das Keyboard Q Series: www.daskeyboard.com

Installation, configuration and uninstallation of applets is done within the Q Desktop application (https://www.daskeyboard.com/q)

1. Clone this repository and Install the dependencies:

yarn install

2. Create a .env file in the root directory of the project and add your GitHub personal access token:

GITHUB_TOKEN=your_personal_access_token

3. Run the applet:

node index.js


Usage
-----

Once the applet is running, it will automatically track the GitHub Actions in the specified repository and update the LEDs on your Das Keyboard Q accordingly.

Configuration
-------------

To change the repository being tracked, update the owner and repo variables in the getGitHubActions method in the index.js file.

Testing
-------

This applet includes a test suite using Jest. To run the tests, use the following command:

yarn test
