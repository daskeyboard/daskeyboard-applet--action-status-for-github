GitHub Actions Das Keyboard Q Applet
===================================

Track GitHub Actions progress directly on your Das Keyboard Q!

Overview
--------

This applet allows you to monitor the status of GitHub Actions in a repository right from your Das Keyboard Q. A single key represents the overall status of the actions and changes color based on its status: orange when an action starts, green upon successful completion, and red if any action fails.

Easy Installation
-----------------

1. Download and install the applet from the Das Keyboard Q Applet Marketplace.
2. Create a GitHub personal access token with the minimum required permissions:
	* To create a personal access token, go to your [GitHub settings](https://github.com/settings/tokens).
	* Click on "New SSH key or token" (classic) or "Generate new token" (new UI).
	* Give your token a descriptive name, such as "Das Keyboard Q Applet".
	* Under "Select scopes", grant the token the "repo" permission. This permission provides read-only access to repository metadata, commits, and pull requests, which is sufficient for the applet to function.
	* Click on "Generate token" (classic) or "Create token" (new UI) to create the token.
	* Copy the generated token.
3. Configure the applet with your GitHub personal access token, the repository owner's username, and the desired repository name.
4. Watch as your Das Keyboard Q lights up to show the overall status of your GitHub Actions!

Simple Usage
------------

Once the applet is installed and configured, it will automatically track the GitHub Actions in the specified repository and update the LED on your Das Keyboard Q accordingly.

Key Features
------------

* Real-time monitoring of GitHub Actions.
* Color-coded key for easy status identification.
* Customizable repository tracking.

Security
--------

Always give the minimum permissions required when creating a personal access token to avoid security issues. In this case, the "repo" permission is sufficient for the applet to function properly.
