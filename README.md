# 🚀 GitHub Actions Status Applet for Das Keyboard Q

![Status of GitHub Actions](assets/colors.png)

> 💡 **Real-time GitHub Actions monitoring directly on your Das Keyboard Q Series**

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/daskeyboard/daskeyboard-applet--action-status-for-github)

## 🎯 Overview

This applet transforms your Das Keyboard Q into a **live GitHub Actions dashboard**! 🎹✨ Monitor your repository's CI/CD pipeline status with instant visual feedback through dynamic LED colors.

## ✨ Key Features

🔥 **Real-time Monitoring**: Instant updates on GitHub Actions status
🔄 **Multi-Repository Support**: Track multiple repos by adding the applet multiple times
🎨 **Color-Coded Status Indicators**:

- 🟢 **Green**: All actions successful ✅
- 🔴 **Red**: Actions failed ❌
- 🟠 **Blinking Orange**: Actions running ⏳

## 🛠️ Developer Quick Start

### 📋 Prerequisites

- 🎹 **Das Keyboard Q Series** - [Get yours here](http://www.daskeyboard.com)
- 🖥️ **Q Desktop Application** - [Download here](https://www.daskeyboard.com/q)
- 🔑 **GitHub API Token** - [Create one here](https://github.com/settings/tokens)

### 🚀 Installation

1. **Install dependencies**:

   ```bash
   yarn install
   ```

2. **Configure your GitHub token**:
   - Generate a personal access token with `repo` scope
   - Configure during applet installation in Q Desktop

3. **Select your repository**:
   - Choose the repository you want to monitor
   - The applet will automatically start tracking

### 🧪 Testing

Run the comprehensive test suite:

```bash
yarn test
```

**Test Coverage**:

- ✅ Pending actions scenarios
- ✅ Successful actions validation
- ✅ Failed actions handling
- ✅ API response parsing
- ✅ Error handling and edge cases

### 🔧 Configuration Options

| Parameter | Description | Required |
|-----------|-------------|----------|
| **Repository** | Target GitHub repository (owner/repo) | ✅ |
| **API Token** | GitHub personal access token | ✅ |
| **Polling Interval** | How often to check status (default: 60s) | ❌ |
| **Key Position** | Which key to illuminate | ❌ |

### 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub API    │◄──►│   Das Keyboard  │◄──►│   Q Desktop     │
│   (Actions)     │    │   Q Applet      │    │   Application   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 📡 API Integration

The applet uses the [GitHub Actions API](https://docs.github.com/en/rest/actions) to:
- 🔍 Fetch workflow runs
- 📊 Aggregate status across all workflows
- ⚡ Provide real-time updates

### 🐛 Troubleshooting

**Common Issues**:

🔴 **Red Key Not Clearing**:

- Check if failed actions have been re-run
- Verify API token permissions

🟠 **Orange Key Stuck**:

- Ensure workflows aren't stuck in pending state
- Check repository webhook configuration

🔑 **API Authentication**:

- Verify token has correct scopes (`repo` minimum)
- Check token expiration date

### 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Run tests**: `yarn test`
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### 📚 Documentation

- 📖 **End-User Guide**: [README_ENDUSER.md](README_ENDUSER.md)
- 🔧 **API Documentation**: [GitHub Actions API](https://docs.github.com/en/rest/actions)
- 🎹 **Das Keyboard Q SDK**: [Q Desktop Developer Guide](https://www.daskeyboard.com/q)

### 🏆 Credits

Originally created by [SoulaymaneK](https://github.com/SoulaymaneK/daskeyboard-applet--action-status-for-github) 👨‍💻

### 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**🎹 Happy Coding with Das Keyboard Q!** ✨
