# Slack Dark Mojave Theme      
[![npm monthly downloads](https://img.shields.io/npm/dm/install-dark-theme.svg)](https://www.npmjs.com/package/install-dark-theme)

A dark theme inspired by Telegram desktop Dark Mojave theme for Slack      

## Quick overview
```shell  
// install theme
npx install-dark-theme
// rollback original theme
npx install-dark-theme --rollback  
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
 
  
### Option 2  
  Find your Slack's application directory.      
      
* Windows: `%homepath%\AppData\Local\slack\app-3.3.0\resources\app.asar.unpacked\src\static`  
* Mac: `/Applications/Slack.app/Contents/Resources/app.asar.unpacked/src/static`  
* Linux: `/usr/lib/slack/resources/app.asar.unpacked/src/static` (Debian-based)      
      
Open `ssb-interop.js` and add at the very bottom     
     
```js      
document.addEventListener('DOMContentLoaded', function () {
    $.ajax({
        url: 'https://unpkg.com/install-dark-theme',
        success: function (css) {
            $("<style></style>").appendTo('head').html(css);
        }
    });
});  
```      
      
That's it! Restart Slack and see how well it works. 


## Development

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

**2. Replace constant `customTheme`**

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

# Credits    
 Project based on  [slack-black-theme](https://github.com/widget-/slack-black-theme). Thanks to [widget-](https://github.com/widget-) and contributors. 

# License      
 MIT
