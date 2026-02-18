# AI-Powered Text Enhancer

A modern web application that uses AI to enhance text by correcting grammar, spelling, and improving readability. The application also features OCR capabilities to extract text from images.

## Features

- 🔍 Grammar and spelling correction
- 📝 Text clarity and readability improvement
- 🖼️ OCR (Optical Character Recognition) for text extraction from images
- 💡 Word meaning suggestions for incorrect words
- 🌓 Dark/Light mode toggle
- 📋 Clipboard integration (copy/paste)
- 🎨 Modern, responsive UI with beautiful gradients

## Prerequisites

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- An API key for Google's Gemini AI (replace 'YOUR_API_KEY' in the code)

## Setup

1. Clone this repository
2. Replace 'YOUR_API_KEY' in `index.html` with your actual Gemini AI API key
3. Open `index.html` in a web browser

## How to Use

1. **Enter Text**:
   - Type or paste text directly into the text area
   - OR upload an image containing text (OCR will extract the text)

2. **Enhance Text**:
   - Click the "Enhance Text" button
   - Wait for the AI to process your text

3. **View Results**:
   - Incorrect words will be highlighted in red
   - Hover over highlighted words to see their meanings
   - View the corrected sentence at the bottom
   - Copy the enhanced text using the copy button

4. **Additional Features**:
   - Toggle between dark and light modes using the theme button
   - Clear text using the trash icon
   - Paste from clipboard using the paste icon

## Technologies Used

- HTML5
- CSS3 (with Tailwind CSS)
- JavaScript (ES6+)
- Tesseract.js for OCR
- Google's Gemini AI for text enhancement
- Font Awesome for icons

## Note

Make sure to replace the API key in the code before using the application. The API key in the code is a placeholder and won't work without replacement.

## License

MIT License - feel free to use this project for any purpose.

## Contributing

Feel free to submit issues and enhancement requests! 