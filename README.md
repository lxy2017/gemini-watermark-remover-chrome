# Gemini Watermark Remover - Chrome Extension

**English** | [中文](README_zh.md)

A Chrome extension that automatically removes watermarks from Gemini AI generated images when downloading.

<p align="center">
  <img src="docs/Gemini_Generated_Image_vvtju3vvtju3vvtj.png" width="600">
</p>

## Features

- 🚀 **Automatic Processing** - Watermarks are removed automatically when you download images
- 🔒 **Privacy First** - All processing happens locally in your browser
- ⚡ **Fast** - Uses efficient canvas-based image processing
- 🎯 **Precise** - Uses reverse alpha blending algorithm for accurate watermark removal

## Examples

<details open>
<summary>Click to Expand/Collapse Examples</summary>

**Lossless diff example**

<img src="docs/lossless_diff.webp">

**Before & After**

| Original Image | Watermark Removed |
| :---: | :----: |
| <img src="docs/1.webp" width="400"> | <img src="docs/unwatermarked_1.webp" width="400"> |
| <img src="docs/2.webp" width="400"> | <img src="docs/unwatermarked_2.webp" width="400"> |
| <img src="docs/3.webp" width="400"> | <img src="docs/unwatermarked_3.webp" width="400"> |

</details>

## Installation

### Option 1: Download .crx (Quickest)

1. Download [chrome-extension.crx](releases/chrome-extension.crx)
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (top right toggle)
4. Drag the `.crx` file onto the extensions page
5. Click "Add extension" when prompted

> ⚠️ Chrome may warn about extensions from outside the Web Store. This is normal for self-distributed extensions.

### Option 2: Load from Source (Developer Mode)

1. Clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (top right toggle)
4. Click "Load unpacked"
5. Select the `chrome-extension` folder

### Build from Template

If you modify the source code, rebuild `content.js`:

```bash
node build-extension.js
```

## Usage

1. Install the extension
2. Visit https://gemini.google.com/
3. Generate an image using Gemini
4. Click the download button
5. The downloaded image will have the watermark removed automatically ✨

## How It Works

The extension uses **reverse alpha blending** to remove the watermark:

```
Original Formula: watermarked = α × logo + (1 - α) × original
Reverse Solve:    original = (watermarked - α × logo) / (1 - α)
```

The alpha map is pre-calculated from reference watermark images (`bg_48.png` and `bg_96.png`).

## Project Structure

```
chrome-extension/
├── manifest.json       # Extension manifest (Manifest V3)
├── content.js          # Main script (injected into Gemini page)
├── background.js       # Service worker
├── assets/             # Watermark reference images
│   ├── bg_48.png
│   └── bg_96.png
└── icons/              # Extension icons
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## Technical Details

- **Manifest Version**: V3
- **Content Script World**: MAIN (to intercept fetch requests)
- **Permissions**: Minimal (only active tab and offscreen)

## License

MIT License - See [LICENSE](./LICENSE) for details.

## Credits

- Based on [gemini-watermark-remover](https://github.com/journey-ad/gemini-watermark-remover) by journey-ad
- Algorithm reference: [GeminiWatermarkTool](https://github.com/allenk/GeminiWatermarkTool) by allenk
