Status of GitHub Actions
========================

Status of GitHub Actions display Actions status (pass, fail or running) directly on your Das Keyboard Q:
 Orange when an action starts, green upon successful completion, and red if any action fails.

Installation
------------

1. Install the applet from the Das Keyboard using the Das Keyboard Q desktop application.
1. Create a GitHub personal access token with the minimum required permissions:

* To create a personal access token, go to your [GitHub settings](https://github.com/settings/tokens).
  * On the left sidebar, click on "Developer settings".
  * Click on "Personal access tokens".
  * Click on "Tokens (classic)"
  * Click on "Generate new token" (classic) or "New token" (new UI).
    * Give your token a descriptive name, such as "Das Keyboard Q Applet".
    * Under "Select scopes", grant the token the "repo" permission. This permission provides read-only access to repository metadata, commits, and pull requests, which is sufficient for the applet to function.
    * Click on "Generate token" (classic) or "Create token" (new UI) to create the token.
    * Copy the generated token.

1. Configure the applet with your GitHub personal access token, the repository owner's username, 
and the desired repository name.
1. Watch as your Das Keyboard Q lights up to show the overall status of your GitHub Actions!

Once the applet is installed, it will track the GitHub Actions in the specified repository 
and update the LED color on your Das Keyboard Q accordingly.

Key Features
------------

* Real-time monitoring of GitHub Actions.
* Color-coded key for easy status identification.
* Customizable repository tracking.

Security
--------

Always give the minimum permissions required when creating a personal access token to avoid security issues. In this case, the "repo" permission is sufficient for the applet to function properly.

Credit
------

This applet was originally created by [SoulaymaneK](https://github.com/SoulaymaneK/daskeyboard-applet--action-status-for-github).
