# ShrinkSuite

**Fast, offline file compression directly in your browser**

ShrinkSuite is a Chrome extension that allows you to compress images, videos, and PDFs without uploading files to external servers. All processing happens locally in your browser using WebAssembly for maximum privacy and speed.

![ShrinkSuite Logo](https://img.shields.io/badge/ShrinkSuite-v1.0-blue)
![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-green)
![MIT License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

- **🖼️ Image Compression**: Compress JPEG, PNG, and other image formats with adjustable quality
- **🎥 Video Compression**: Reduce video file sizes using FFmpeg with CRF and bitrate controls
- **📄 PDF Compression**: Compress PDF documents using Ghostscript with multiple quality levels
- **🔒 Privacy-First**: All processing happens locally - no files are uploaded to servers
- **⚡ Fast Processing**: WebAssembly-powered compression for optimal performance
- **🎯 Target Size Control**: Set specific target file sizes for precise compression
- **📱 Side Panel UI**: Convenient side panel interface integrated into Chrome

## 🚀 Installation

### For Users

1. **Chrome Web Store** (Recommended):
   - Visit the Chrome Web Store (coming soon)
   - Click "Add to Chrome"
   - The extension will appear in your browser toolbar

2. **Manual Installation** (Developer Mode):
   - Download the latest release
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the extension folder

### For Developers

```bash
# Clone the repository
git clone https://github.com/yourusername/shrinksuite.git
cd shrinksuite

# Install dependencies
npm install

# Build the extension
npm run build

# For development
npm run dev
```

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+ and npm
- Chrome browser for testing

### Project Structure

```
shrinksuite/
├── public/
│   ├── manifest.json          # Extension manifest
│   ├── background.js          # Service worker
│   └── gs.wasm               # Ghostscript WebAssembly
├── src/
│   ├── components/           # React components
│   ├── sidepanel/           # Side panel implementation
│   └── utils/               # Compression utilities
├── scripts/
│   └── copy-wasm.js         # WASM file copying script
└── package.json
```

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

### Loading in Chrome

1. Run `npm run build`
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `dist` folder

## 💻 Technology Stack

- **Frontend**: React 19, TypeScript, TailwindCSS
- **Build Tool**: Vite with custom configuration
- **Image Compression**: browser-image-compression
- **Video Compression**: FFmpeg.wasm
- **PDF Compression**: Ghostscript WASM (@zfanta/ghostscript-wasm)
- **PDF Manipulation**: pdf-lib

## 🔧 Usage

1. **Open ShrinkSuite**: Click on the extension icon to open the side panel
2. **Select File**: Drag and drop or click to browse for your file
3. **Set Target Size**: Enter desired file size in KB, MB, or GB
4. **Compress**: Click "Compress File" to start processing
5. **Download**: Once complete, download your compressed file

### Supported File Types

- **Images**: JPEG, PNG, WebP, and other formats supported by the browser
- **Videos**: MP4, WebM, AVI, MOV, and other formats supported by FFmpeg
- **Documents**: PDF files

## 🌐 Browser Compatibility

### Full Support
- ✅ **Google Chrome** (recommended)
- ✅ **Microsoft Edge** (Chromium-based)
- ✅ **Opera** (Chromium-based)

### Limited Support
- ⚠️ **Firefox**: Requires modifications for sidebar API compatibility
- ⚠️ **Safari**: Requires significant architecture changes

## 📦 Publishing

### Chrome Web Store

1. **Developer Registration**: 
   - Register at [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard)
   - Pay $5 one-time registration fee

2. **Prepare Extension**:
   ```bash
   npm run build
   # Create ZIP file from dist/ folder
   ```

3. **Submit**: Upload ZIP file and complete store listing

### Microsoft Edge Add-ons

1. Register at [Microsoft Edge Add-ons Developer Portal](https://partner.microsoft.com/dashboard/microsoftedge)
2. Use the same build as Chrome (fully compatible)

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests if applicable
4. Commit your changes: `git commit -am 'Add new feature'`
5. Push to the branch: `git push origin feature-name`
6. Create a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

## 🐛 Known Issues

- Large video files (>500MB) may cause memory issues
- Some PDF files with complex formatting may not compress effectively
- Video compression requires significant processing time for large files

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Simanta Raj Deb**

## 🔗 Links

- [Chrome Web Store](https://chrome.google.com/webstore) (coming soon)
- [Report Issues](https://github.com/yourusername/shrinksuite/issues)
- [Feature Requests](https://github.com/yourusername/shrinksuite/issues)

## 📊 Performance Notes

- **Image Compression**: Uses binary search algorithm for optimal quality/size ratio
- **Video Compression**: Implements CRF and bitrate-based compression with fallbacks
- **PDF Compression**: Uses Ghostscript's multiple quality levels (screen, ebook, printer, prepress)
- **Memory Usage**: WebAssembly operations are memory-intensive; close other browser tabs for large files

## 🔄 Version History

- **v1.0.0**: Initial release with image, video, and PDF compression support

---

**Made with ❤️ for privacy-conscious users who need fast, offline file compression**
