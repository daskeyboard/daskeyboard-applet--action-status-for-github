# Status of GitHub Actions

# insert image here
![Status of GitHub Actions](assets/icon.png)

Status of GitHub Actions applet tracks the status of a repository GitHub Actions and change the 
color of a keyboard key accordingly: green when all actions are successful, red if any action fails, 
and orange when an action is running.

## Developer Documentation

### Github repo

The GitHub repository for this applet is available at: 
<https://github.com/supercobra/daskeyboard-applet--action-status-for-github>

### Installation

Requires a Das Keyboard Q Series: [www.daskeyboard.com](http://www.daskeyboard.com)

Installation, configuration, and uninstallation of applets are done within the Q Desktop application: <https://www.daskeyboard.com/q>

1. Install the dependencies:

<kbd>yarn install</kbd>

1. During the installation process, you will be asked to provide authentication information (API key) and select the repository you want to track.

### Usage

Once the applet is running, it will automatically track the GitHub Actions in the specified repository and update the LED on your Das Keyboard Q accordingly.

### Configuration

You can change the repository being tracked by reinstalling the applet and selecting a different repository during the installation process.

### Testing

This applet includes a test suite using Jest. To run the tests, use the following command:

<kbd>yarn test</kbd>

The test suite covers the different scenarios for GitHub Actions statuses (pending, successful, and failed) and ensures the applet behaves correctly.

## End-User Documentation

For end-user documentation, please refer to the [README_ENDUSER.md](README_ENDUSER.md) file.

## Credits

This applet was originally created by [SoulaymaneK](https://github.com/SoulaymaneK/daskeyboard-applet--action-status-for-github).
