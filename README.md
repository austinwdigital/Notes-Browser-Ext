# Quick Note Browser Extension

> **Note:** This is a work in progress. Please feel free to contribute!

This extension provides a simple yet powerful note-taking experience right in your browser with:

- Clean, modern interface with dark/light mode support
- Full markdown support with live preview
- Multiple notes management with easy switching
- Auto-save functionality
- Export capabilities
- Responsive design that works across different screen sizes

## Features

- **Modern UI**: Clean interface with smooth animations and transitions
- **Markdown Support**: Write in markdown with live preview functionality
- **Multiple Notes**: Create, manage, and switch between multiple notes
- **Auto-Save**: Your notes are automatically saved as you type
- **Dark/Light Mode**: Toggle between themes based on your preference
- **Export**: Export your notes for backup or sharing
- **Responsive**: Works great on different screen sizes
- **Fast & Lightweight**: Built with vanilla JavaScript for optimal performance

## Usage

1. Install the extension in your browser (see installation instructions below)
2. Click the extension icon in your browser toolbar to open the note-taking interface
3. Start writing your notes - they'll be automatically saved
4. Use the toolbar buttons to:
   - Create new notes
   - Switch between existing notes
   - Edit note titles
   - Delete notes
   - Export notes
   - Toggle between edit and preview modes
   - Switch between light and dark themes

## Installation

### Chrome

1. Clone this repository:

   ```bash
   git clone https://github.com/austinwdigital/quick-note-browser-extension.git
   cd quick-note-browser-extension
   ```

2. Install dependencies and build:

   ```bash
   npm install
   npm run build
   ```

3. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top-right corner
   - Click "Load unpacked" and select the `dist/` directory

### Firefox

1. Complete the build steps above
2. Open Firefox and go to `about:debugging`
3. Click "This Firefox"
4. Click "Load Temporary Add-on"
5. Select any file from the `dist/` directory

### Safari

1. Complete the Chrome installation steps above
2. Install Xcode from the Mac App Store
3. Use Safari's web extension converter or create a new Safari extension project
4. Copy the built files from `dist/` to your Safari extension project
5. Configure permissions and build through Xcode

## Contributing

Contributions are welcome! This project is perfect for developers looking to contribute to browser extension development.

Ways to contribute:

- **Bug Reports**: Found a bug? Open an issue with details
- **Feature Requests**: Have an idea? Share it in the issues
- **Code Contributions**: Submit PRs for bug fixes or new features
- **Documentation**: Help improve the README or add code comments
- **Testing**: Test the extension on different browsers and report issues

### Development Setup

1. Fork and clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start development mode:

   ```bash
   npm run dev
   ```

4. Make your changes in the `src/` directory
5. Test your changes by loading the extension in your browser
6. Submit a pull request with your improvements

### Contributing Guidelines

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the existing code style
4. Test your changes thoroughly
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Development

```bash
# Install dependencies
npm install

# Generate icons (if modifying the icon)
npm run icons

# Start development with file watching
npm run dev

# Build for production
npm run build

# Package for distribution
npm run package

# Run linting
npm run lint

# Format code
npm run format
```

## Project Structure

```
├── src/                 # Source code
│   ├── popup.html      # Main popup interface
│   ├── popup.js        # Main JavaScript functionality
│   └── styles.css      # Stylesheet with CSS custom properties
├── public/             # Static assets
│   ├── manifest.json   # Extension manifest
│   ├── icon.png        # Extension icon
│   └── markdown-it.min.js # Markdown parser library
├── dist/               # Build output (generated)
└── package.json        # Node.js dependencies and scripts
```

## Technologies Used

- **Vanilla JavaScript**: Core functionality without frameworks
- **CSS Custom Properties**: Modern CSS with design tokens
- **Markdown-it**: Markdown parsing and rendering
- **Manifest V3**: Latest Chrome extension standards
- **LocalStorage**: Client-side data persistence

## Browser Compatibility

- ✅ Chrome (Manifest V3)
- ✅ Firefox (Manifest V2/V3)
- ✅ Safari (with additional setup)
- ✅ Edge (Chromium-based)

## Recent Updates

- Modernized project structure with npm scripts
- Added development workflow with file watching
- Improved code organization and documentation
- Added linting and formatting tools
- Enhanced CSS with custom properties and modern features
- Improved accessibility and responsive design
- Added comprehensive build and packaging scripts

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Created by **austinwdigital**

---

_This extension is built with ❤️ for the developer community. Star the repo if you find it useful!_
