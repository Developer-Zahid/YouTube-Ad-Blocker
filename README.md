# YouTube Ad Blocker Extension

A lightweight, elegant browser extension to block YouTube ads.

## Features

- Blocks pre-roll and mid-roll video ads
- Removes banner and overlay ads
- Simple toggle to enable/disable ad blocking
- Statistics tracking to see how many ads have been blocked
- Works on both Chrome and Firefox browsers
- Minimal resource usage

## Installation

### Chrome Installation

1. Download this extension folder
2. Open Chrome and navigate to `chrome://extensions`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension is now installed and active

### Firefox Installation

1. Download this extension folder
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on"
4. Select any file from the extension folder. Like: `manifest.json`
5. The extension is now installed and active

## Usage

1. Click on the extension icon in your browser toolbar to open the popup
2. Use the main toggle to enable or disable ad blocking
3. Configure specific settings using the options provided
4. View statistics about how many ads have been blocked

## How It Works

The extension uses content scripts to detect and remove ads on YouTube:

1. When a video ad is detected, it either skips it or fast-forwards to the end
2. Banner ads and overlays are hidden using CSS
3. The extension works without interfering with regular YouTube functionality

## Privacy

This extension:
- Does not collect any user data
- Does not communicate with any external servers
- All processing happens locally in your browser

## License

MIT License