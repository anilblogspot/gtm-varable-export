# 🚀 GTM GA4 Extractor

A powerful React-based web application that extracts Google Analytics 4 (GA4) event data and parameters from Google Tag Manager (GTM) export files. Convert your GTM JSON exports into clean, organized CSV files for analysis and reporting.

## ✨ Features

- **📁 Drag & Drop Interface**: Easy file upload with visual feedback
- **🔍 Smart Parsing**: Automatically detects GA4 tags (`gaawe` type) and config tags (`googtag` type)
- **📊 CSV Export**: Generate clean CSV files with event names and parameters
- **🎯 Deduplication**: Automatically removes duplicate entries
- **📝 Console Logging**: Detailed processing information with verbose mode
- **🧪 Built-in Testing**: Comprehensive test suite for data integrity
- **🎨 Modern UI**: Beautiful, responsive design with dark theme
- **📱 Mobile Friendly**: Works seamlessly on all devices

## 🎯 What It Extracts

- **GA4 Event Tags**: Extracts parameters from `gaawe` type tags
- **GA4 Config Tags**: Processes `googtag` type configuration tags
- **Event Settings**: Pulls data from `eventSettingsTable`
- **Config Settings**: Extracts from `configSettingsTable`
- **Parameter Values**: All custom parameters and their values

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/anilblogspot/gtm-varable-export.git
   cd gtm-varable-export
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 How to Use

### 1. Export from GTM
- Go to your Google Tag Manager account
- Select your container
- Click the **Admin** tab
- Click **Export Container**
- Choose **Download** to get your `.json` file

### 2. Upload to GTM GA4 Extractor
- Drag and drop your GTM JSON file onto the upload area
- Or click to browse and select your file
- The app will automatically process and extract GA4 data

### 3. Download Results
- Review the extracted data in the console
- Click **Download CSV** to get your results
- Use the **Clear** button to reset for a new file

## 🏗️ Project Structure

```
gtm-varable-export/
├── public/
│   └── index.html          # Main HTML template
├── src/
│   ├── GTMGA4Extractor.jsx # Main React component
│   └── index.js            # React app entry point
├── package.json            # Dependencies and scripts
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

## 🔧 Development

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run test suite
- `npm run eject` - Eject from Create React App

### Key Functions

- `resolveTags()` - Extracts tags from GTM JSON structure
- `extractGA4Rows()` - Processes GA4-specific tag data
- `deduplicateRows()` - Removes duplicate entries
- `toCSV()` - Converts data to CSV format
- `runTests()` - Executes built-in test suite

## 🌐 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Web Hosting
1. Run `npm run build`
2. Upload the `build/` folder contents to your web hosting
3. Ensure your hosting supports static file serving

### Deploy to GitHub Pages
1. Add `"homepage": "https://yourusername.github.io/repo-name"` to package.json
2. Install gh-pages: `npm install --save-dev gh-pages`
3. Add deploy script: `"deploy": "gh-pages -d build"`
4. Run `npm run deploy`

## 🧪 Testing

The application includes a comprehensive test suite that validates:
- JSON parsing accuracy
- Tag resolution logic
- Data deduplication
- CSV generation
- Error handling

Click the **Run Tests** button to execute all tests and verify data integrity.

## 🔍 Technical Details

### Supported GTM Structures
- Standard container export format
- Alternative container version paths
- Nested tag configurations
- Multiple container formats

### Data Processing
- Automatic tag type detection
- Parameter extraction and normalization
- Event name resolution
- Duplicate row removal
- CSV formatting with proper escaping

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

If you encounter any issues or have questions:
- Check the console output for detailed error messages
- Ensure your GTM export file is valid JSON
- Verify the file contains GA4 tags
- Run the built-in tests to validate functionality

## 🔮 Future Enhancements

- Additional column options (Tag ID, Triggers, Measurement ID)
- Batch processing for multiple files
- Advanced filtering and search
- Data visualization charts
- Export to other formats (Excel, JSON)

---

**Built with ❤️ using React and modern web technologies**
