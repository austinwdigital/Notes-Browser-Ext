# Contributing to Quick Note Browser Extension

Thank you for your interest in contributing to Quick Note! This document provides guidelines and instructions for contributing to this project.

## Getting Started

### Prerequisites

- Node.js 16 or higher
- npm (comes with Node.js)
- A modern web browser (Chrome, Firefox, Safari, or Edge)
- Git
- A code editor (VS Code recommended)

### Setting Up the Development Environment

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/your-username/quick-note-browser-extension.git
   cd quick-note-browser-extension
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Build the extension**

   ```bash
   npm run build
   ```

4. **Start development mode**

   ```bash
   npm run dev
   ```

### Loading the Extension for Testing

#### Chrome/Edge

1. Open `chrome://extensions/` in your browser
2. Enable "Developer mode" in the top-right corner
3. Click "Load unpacked"
4. Select the `dist/` directory from the project

#### Firefox

1. Open `about:debugging` in Firefox
2. Click "This Firefox"
3. Click "Load Temporary Add-on"
4. Select any file in the `dist/` directory

## Development Workflow

### File Structure

```
├── src/                 # Source code
│   ├── popup.html      # Main popup interface
│   ├── popup.js        # JavaScript functionality
│   └── styles.css      # Stylesheet
├── public/             # Static assets
│   ├── manifest.json   # Extension manifest
│   ├── icon.png        # Extension icon
│   └── markdown-it.min.js # External library
├── dist/               # Build output (auto-generated)
├── .vscode/            # VS Code settings
└── docs/               # Documentation
```

### Available Scripts

- `npm run dev` - Start development with file watching
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run package` - Create distribution zip file

### Code Style

This project uses ESLint and Prettier to maintain consistent code style:

- **JavaScript**: ES2022 features, prefer const/let over var
- **CSS**: Modern CSS with custom properties, BEM-like naming
- **HTML**: Semantic HTML5, accessible markup
- **Indentation**: 2 spaces
- **Line endings**: LF (Unix-style)
- **Max line length**: 100 characters

### Making Changes

1. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**

   - Write clean, readable code
   - Follow the existing code style
   - Add comments for complex logic
   - Test your changes thoroughly

3. **Run quality checks**

   ```bash
   npm run lint
   npm run format
   npm run build
   ```

4. **Test the extension**
   - Load the extension in your browser
   - Test all functionality
   - Check both light and dark modes
   - Verify responsive behavior

## Types of Contributions

### Bug Reports

When reporting bugs, please include:

- Browser and version
- Extension version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Console errors (if any)

### Feature Requests

For new features, please:

- Check if the feature already exists
- Describe the problem it solves
- Provide implementation ideas if possible
- Consider backward compatibility

### Code Contributions

We welcome contributions for:

- Bug fixes
- New features
- Performance improvements
- Documentation updates
- UI/UX enhancements
- Accessibility improvements

## Pull Request Process

1. **Ensure your PR addresses an issue**

   - Link existing issues or create a new one
   - Describe what problem you're solving

2. **Write a clear PR description**

   - What changes were made
   - Why they were necessary
   - How to test the changes

3. **Follow the checklist**

   - [ ] Code follows the style guidelines
   - [ ] Self-review completed
   - [ ] Comments added for complex code
   - [ ] Tests pass (if applicable)
   - [ ] Documentation updated
   - [ ] No breaking changes (or clearly documented)

4. **Keep PRs focused**
   - One feature or fix per PR
   - Avoid unrelated changes
   - Keep commits atomic and well-named

## Architecture Guidelines

### JavaScript Structure

- Use modern ES2022 features
- Organize code into logical modules/controllers
- Handle errors gracefully
- Use async/await for asynchronous operations
- Minimize global variables
- Add JSDoc comments for functions

### CSS Organization

- Use CSS custom properties for theming
- Follow a mobile-first approach
- Use semantic class names
- Group related styles together
- Maintain consistent spacing scale
- Optimize for performance

### HTML Best Practices

- Use semantic HTML elements
- Ensure accessibility (ARIA labels, keyboard navigation)
- Validate markup
- Optimize for screen readers
- Use proper heading hierarchy

## Browser Compatibility

The extension should work on:

- Chrome 88+
- Firefox 78+
- Safari 14+
- Edge 88+

Test changes across different browsers when possible.

## Performance Considerations

- Minimize DOM manipulation
- Use efficient CSS selectors
- Debounce user input
- Optimize image assets
- Keep bundle size small
- Test with large amounts of data

## Security Guidelines

- Follow CSP (Content Security Policy) rules
- Sanitize user input
- Use minimal permissions
- Avoid eval() and similar unsafe functions
- Validate all data from storage

## Documentation

When adding features:

- Update the README if needed
- Add inline code comments
- Update CHANGELOG.md
- Consider adding examples

## Getting Help

- Check existing issues and discussions
- Read the documentation thoroughly
- Ask questions in issues (tag with "question")
- Be respectful and patient

## Recognition

Contributors will be recognized in:

- README.md contributors section
- Release notes
- Git commit history

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Quick Note! Your efforts help make this extension better for everyone. 🎉
