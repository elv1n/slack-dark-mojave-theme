### [Dark mode is now available in Slack 4](https://slackhq.com/dark-mode-for-slack-desktop)




## Slack Dark Mojave Theme      
[![npm monthly downloads](https://img.shields.io/npm/dm/install-dark-theme.svg)](https://www.npmjs.com/package/install-dark-theme) [![Netlify Status](https://api.netlify.com/api/v1/badges/c39c1370-0a3e-45c0-89c7-d5dc594c4285/deploy-status)](https://app.netlify.com/sites/dark-theme/deploys)

A dark theme inspired by Telegram desktop Dark Mojave theme for Slack 3+ and 4+      

## Quick overview

**Slack 4**

```shell  
npx install-dark-theme
// rollback to the original theme.
npx install-dark-theme --rollback
```

**Slack 3**

```shell  
npx install-dark-theme@1.0.1
// rollback to the original theme.
npx install-dark-theme@1.0.1 --rollback
```

# Preview    
![Screenshot](https://raw.githubusercontent.com/elv1n/slack-dark-mojave-theme/master/preview.png)
    
# Installing into Slack      
 **NB:** You'll have to do this every time Slack updates.      

### Option 1  
```shell  
npx install-dark-theme  
```  
Arguments  
`npx install-dark-theme --rollback`  restore original theme 
`npx install-dark-theme --force` force theme installing
  
### Option 2: Manual installation
* Look at `scripts/injectTheme` to inject theme manually*

### Getting updates for the theme
To load the latest updates for the theme you need just press `⌘+R` (Mac), `ctrl+R` (Windows) or reload Slack.


## Development Slack 4

Clone the repo and run commands using yarn/npm

**Open slack with developer tools**

Mac: `export SLACK_DEVELOPER_MENU=true; open -a /Applications/Slack.app`

Windows: `C:\Windows\System32\cmd.exe /c " SET SLACK_DEVELOPER_MENU=TRUE && start C:\Users\CHANG_USER\AppData\Local\slack\slack.exe`


```bash
yarn

// install theme with watcher
yarn start

// restore theme on default url after development

yarn restore

```

## Development Slack 3

Clone the repo and run commands using yarn/npm

```bash
yarn
yarn start
```

Find your Slack's application directory.      
      
* Windows: `%homepath%\AppData\Local\slack\app-3.3.0\resources\app.asar.unpacked\src\static`  
* Mac: `/Applications/Slack.app/Contents/Resources/app.asar.unpacked/src/static`  
* Linux: `/usr/lib/slack/resources/app.asar.unpacked/src/static` (Debian-based)      
      
Open `ssb-interop.js` and add at the very bottom    

**1. Comment the part related to installation from section above!**

**2. Copy text and replace constant `customTheme`**

```js
// Change to path to style.css in repository
const customTheme = '/Users/YOUR_USER/REPOSITORY_PATH/style.css';

const URL = 'http://localhost:8080/style.css';
const createStyle = () => {
  const el = document.getElementById('custom');
  if (el) {
    el.parentNode.removeChild(el);
  }
  const style = document.createElement('link')
  style.setAttribute('type', 'text/css');
  style.setAttribute('rel', 'stylesheet');
  style.href = URL + '?zz=' + Date.now();
  style.id = 'custom';
  document.head.appendChild(style)
}
require('fs').watchFile(customTheme, createStyle);
document.addEventListener('DOMContentLoaded', createStyle);
```

**3. Run command "yarn start" in repo**

*Change windows user!*

# Credits    
 Project based on  [slack-black-theme](https://github.com/widget-/slack-black-theme). Thanks to [widget-](https://github.com/widget-) and contributors. 

# License      
 MIT
