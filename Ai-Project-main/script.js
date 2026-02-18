// Extracted from index.html <script> tag
// All JavaScript logic for the app

const themeToggle = document.getElementById('themeToggle');
let isDarkMode = true;
const imageUpload = document.getElementById('imageUpload');
const imageCanvas = document.getElementById('imageCanvas');
const ctx = imageCanvas.getContext('2d');
let extractedText = "";

themeToggle.addEventListener('click', () => {
  isDarkMode = !isDarkMode;
  updateTheme();
});

function updateTheme() {
  if (isDarkMode) {
    document.body.classList.remove('gradient-bg-light', 'text-gray-900');
    document.body.classList.add('gradient-bg', 'text-white');
    document.querySelectorAll('.card-gradient-light').forEach(el => {
      el.classList.remove('card-gradient-light', 'text-gray-900');
      el.classList.add('card-gradient', 'text-white');
    });
    document.querySelectorAll('.bg-gray-800/50, textarea, #result').forEach(el => {
      el.classList.add('bg-gray-800/50', 'border-gray-700/30');
      el.classList.remove('bg-white/80', 'border-gray-200/50');
    });
    themeToggle.innerHTML = '<i class="fas fa-moon"></i><span>Dark Mode</span>';
  } else {
    document.body.classList.remove('gradient-bg', 'text-white');
    document.body.classList.add('gradient-bg-light', 'text-gray-900');
    document.querySelectorAll('.card-gradient').forEach(el => {
      el.classList.remove('card-gradient', 'text-white');
      el.classList.add('card-gradient-light', 'text-gray-900');
    });
    document.querySelectorAll('.bg-gray-800/50, textarea, #result').forEach(el => {
      el.classList.remove('bg-gray-800/50', 'border-gray-700/30');
      el.classList.add('bg-white/80', 'border-gray-200/50');
    });
    themeToggle.innerHTML = '<i class="fas fa-sun"></i><span>Light Mode</span>';
  }
}

imageUpload.addEventListener('change', handleImageUpload);

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const preview = document.getElementById('imagePreview');
      const container = document.getElementById('imagePreviewContainer');
      const fileName = document.getElementById('imageFileName');
      
      preview.src = e.target.result;
      container.classList.remove('hidden');
      fileName.textContent = file.name;
    };
    reader.readAsDataURL(file);
  }
}

function clearImage() {
  document.getElementById('imageUpload').value = '';
  document.getElementById('imagePreviewContainer').classList.add('hidden');
  document.getElementById('ocrStatus').classList.add('hidden');
}

async function processImage() {
  const file = document.getElementById('imageUpload').files[0];
  if (!file) {
    alert('Please select an image first.');
    return;
  }

  const status = document.getElementById('ocrStatus');
  const progress = document.getElementById('ocrProgress');
  const language = document.getElementById('languageSelect').value;
  
  status.classList.remove('hidden');
  progress.textContent = 'Initializing image processing...';

  try {
    // Show loading animation
    const loadingAnimation = document.createElement('div');
    loadingAnimation.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    loadingAnimation.innerHTML = `
      <div class="bg-gray-800 p-6 rounded-lg flex flex-col items-center">
        <div class="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p class="text-white text-lg">Reading image with AI...</p>
      </div>
    `;
    document.body.appendChild(loadingAnimation);

    // Convert image to base64
    const base64Image = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });

    // Process the image with Gemini API
    const result = await extractTextWithGemini(base64Image, language);
    
    // Remove loading animation
    loadingAnimation.remove();

    if (result.success) {
      // Show the extracted text in the chatbot box
      displayImageText(result.text);
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2';
      notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>Text extracted successfully!</span>
        <button onclick="this.parentElement.remove()" class="ml-2">
          <i class="fas fa-times"></i>
        </button>
      `;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 5000);
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    // Show error notification
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2';
    notification.innerHTML = `
      <i class="fas fa-exclamation-circle"></i>
      <span>Error: ${error.message}</span>
      <button onclick="this.parentElement.remove()" class="ml-2">
        <i class="fas fa-times"></i>
      </button>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
  } finally {
    status.classList.add('hidden');
  }
}

// New function to extract text using Gemini 2.0 API
async function extractTextWithGemini(base64Image, language = 'en') {
  try {
    const apiKey = 'AIzaSyC0cUJVxN2NC303B-LzZo8jXM7FwQe9-bQ';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: `You are an expert at extracting text from images. Extract all the text from this image in ${language}. Format the text exactly as it appears, preserving line breaks, spacing, and structure. If there are multiple sections or paragraphs, maintain their original layout.`
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64Image
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to process image');
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    if (!text) {
      throw new Error('No text found in the image');
    }

    return {
      success: true,
      text: text.trim(),
      error: null
    };
  } catch (error) {
    return {
      success: false,
      text: '',
      error: error.message
    };
  }
}

// Function to display image text in the chatbot box
function displayImageText(text) {
  const resultDiv = document.getElementById('result');
  const resultContent = document.getElementById('resultContent');
  const correctedSentenceDiv = document.getElementById('correctedSentence');
  
  // Show the result section
  resultDiv.classList.remove('hidden');
  
  // Format the extracted text with better styling
  resultContent.innerHTML = `
    <div class="space-y-6">
      <div class="bg-gray-700/30 p-6 rounded-lg border border-gray-600/30">
        <div class="flex items-center justify-between mb-4">
          <h4 class="text-xl font-semibold text-blue-400 flex items-center">
            <i class="fas fa-image text-purple-400 mr-2"></i>
            Extracted Text
          </h4>
          <span class="text-sm text-gray-400">From Image</span>
        </div>
        <div class="bg-gray-800/50 p-4 rounded-lg">
          <p class="text-white text-lg leading-relaxed whitespace-pre-wrap">${text}</p>
        </div>
      </div>
      
      <div class="flex justify-end space-x-4">
        <button onclick="copyToClipboard('resultContent')" 
                class="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition-all flex items-center space-x-2">
          <i class="fas fa-copy"></i>
          <span>Copy Text</span>
        </button>
        <button onclick="enhanceExtractedText()" 
                class="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-lg transition-all flex items-center space-x-2">
          <i class="fas fa-magic"></i>
          <span>Enhance Text</span>
        </button>
      </div>
    </div>
  `;
  
  // Clear the corrected sentence section
  correctedSentenceDiv.innerHTML = '';
  
  // Scroll to the result
  resultDiv.scrollIntoView({ behavior: 'smooth' });
}

// New function to enhance the extracted text using Gemini 2.0
async function enhanceExtractedText() {
  const resultContent = document.getElementById('resultContent');
  const textElement = resultContent.querySelector('p.text-white');
  if (!textElement) return;

  const text = textElement.textContent;
  const language = document.getElementById('languageSelect').value;

  try {
    // Show loading state
    resultContent.innerHTML = `
      <div class="flex flex-col items-center justify-center py-8">
        <div class="relative mb-4">
          <div class="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
            <i class="fas fa-cog fa-spin text-blue-400 text-2xl"></i>
          </div>
          <div class="absolute -inset-2 border-4 border-blue-500/30 rounded-full animate-ping"></div>
        </div>
        <p class="text-gray-400">Enhancing text...</p>
      </div>
    `;

    const apiKey = 'AIzaSyC0cUJVxN2NC303B-LzZo8jXM7FwQe9-bQ';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Enhance and improve the following text in ${language}. Make it more readable while preserving its meaning. Fix any grammatical errors and improve the flow. Here's the text: ${text}`
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    const data = await response.json();
    const enhancedText = data?.candidates?.[0]?.content?.parts?.[0]?.text || text;

    // Display the enhanced text
    displayImageText(enhancedText);
  } catch (error) {
    resultContent.innerHTML = `
      <div class="bg-red-500/20 p-4 rounded-lg">
        <p class="text-red-400">Error enhancing text: ${error.message}</p>
      </div>
    `;
  }
}

// Modify the copyToClipboard function to handle the new format
function copyToClipboard(elementId) {
  const element = document.getElementById(elementId);
  let textToCopy = '';
  
  if (elementId === 'resultContent') {
    // Extract the actual text content from the formatted div
    const textElement = element.querySelector('p.text-white');
    textToCopy = textElement ? textElement.textContent : '';
  } else {
    textToCopy = element.textContent;
  }
  
  navigator.clipboard.writeText(textToCopy).then(() => {
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2';
    notification.innerHTML = `
      <i class="fas fa-check-circle"></i>
      <span>Copied to clipboard!</span>
      <button onclick="this.parentElement.remove()" class="ml-2">
        <i class="fas fa-times"></i>
      </button>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }).catch(err => {
    console.error('Failed to copy text: ', err);
  });
}

async function correctText() {
  const inputText = document.getElementById('inputText').value;
  const language = document.getElementById('languageSelect').value;
  
  if (!inputText.trim()) {
    alert('Please enter some text to enhance.');
    return;
  }

  const resultDiv = document.getElementById('result');
  const resultContent = document.getElementById('resultContent');
  const correctedSentenceDiv = document.getElementById('correctedSentence');
  
  resultContent.innerHTML = `
    <div class="flex flex-col items-center justify-center py-8">
      <div class="relative mb-4">
        <div class="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
          <i class="fas fa-cog fa-spin text-blue-400 text-2xl"></i>
        </div>
        <div class="absolute -inset-2 border-4 border-blue-500/30 rounded-full animate-ping"></div>
      </div>
      <p class="text-gray-400">Enhancing your text...</p>
    </div>
  `;
  resultDiv.classList.remove('hidden');

  const apiKey = 'AIzaSyC0cUJVxN2NC303B-LzZo8jXM7FwQe9-bQ';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Correct the following text in ${language}, underline the wrong words with red, make them bold and provide the meaning of the wrong word in the corner. Provide a corrected sentence at the end. ${inputText}` }] }],
      }),
    });

    const data = await response.json();
    let correctedText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '<p class="text-red-400">No enhancement available.</p>';

    const sentenceRegex = /Corrected Sentence:\s*(.+)/s;
    const sentenceMatch = correctedText.match(sentenceRegex);

    if (sentenceMatch && sentenceMatch[1]) {
      correctedSentenceDiv.innerHTML = `Corrected Sentence: ${sentenceMatch[1].trim()}`;
      correctedText = correctedText.replace(sentenceRegex, '').trim(); 
    } else {
      correctedSentenceDiv.innerHTML = '';
    }

    correctedText = correctedText.replace(/(\w+)\s*\[meaning:\s*([^\]]+)\]/g, '<span class="wrong-word" data-meaning="$2">$1</span>');

    resultContent.innerHTML = correctedText;
  } catch (error) {
    resultContent.innerHTML = `<p class="text-red-400">Error: ${error.message}</p>`;
  }
}

async function pasteFromClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    document.getElementById('inputText').value = text;
  } catch (err) {
    alert('Failed to paste from clipboard. Please paste manually.');
  }
}

function toggleSidebar() {
  document.querySelector('.sidebar').classList.toggle('active');
}

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
  if (window.innerWidth <= 768) {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    if (!sidebar.contains(e.target) && !mainContent.querySelector('button').contains(e.target)) {
      sidebar.classList.remove('active');
    }
  }
});

// Text formatting functions
function formatText(type) {
  const textarea = document.getElementById('inputText');
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;
  let selectedText = text.substring(start, end);
  
  switch(type) {
    case 'bold':
      selectedText = `**${selectedText}**`;
      break;
    case 'italic':
      selectedText = `*${selectedText}*`;
      break;
    case 'underline':
      selectedText = `__${selectedText}__`;
      break;
  }
  
  textarea.value = text.substring(0, start) + selectedText + text.substring(end);
  textarea.focus();
  textarea.setSelectionRange(start + 2, end + 2);
}

// Text processing functions
async function processText(type) {
  const inputText = document.getElementById('inputText').value;
  const language = document.getElementById('languageSelect').value;
  
  if (!inputText.trim()) {
    alert('Please enter some text to process.');
    return;
  }

  const resultDiv = document.getElementById('result');
  const resultContent = document.getElementById('resultContent');
  const correctedSentenceDiv = document.getElementById('correctedSentence');
  
  resultContent.innerHTML = `
    <div class="flex flex-col items-center justify-center py-8">
      <div class="relative mb-4">
        <div class="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
          <i class="fas fa-cog fa-spin text-blue-400 text-2xl"></i>
        </div>
        <div class="absolute -inset-2 border-4 border-blue-500/30 rounded-full animate-ping"></div>
      </div>
      <p class="text-gray-400">Processing your text...</p>
    </div>
  `;
  resultDiv.classList.remove('hidden');

  const apiKey = 'AIzaSyC0cUJVxN2NC303B-LzZo8jXM7FwQe9-bQ';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  let prompt = '';
  switch(type) {
    case 'summarize':
      prompt = `Summarize the following text in ${language}: ${inputText}`;
      break;
    case 'expand':
      prompt = `Expand and elaborate on the following text in ${language}: ${inputText}`;
      break;
    case 'formal':
      prompt = `Make the following text more formal in ${language}: ${inputText}`;
      break;
    case 'casual':
      prompt = `Make the following text more casual in ${language}: ${inputText}`;
      break;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await response.json();
    let processedText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '<p class="text-red-400">Processing failed.</p>';
    
    resultContent.innerHTML = processedText;
    correctedSentenceDiv.innerHTML = '';
  } catch (error) {
    resultContent.innerHTML = `<p class="text-red-400">Error: ${error.message}</p>`;
  }
}

// Add drag and drop support
const dropZone = document.querySelector('label[for="imageUpload"]');
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
  dropZone.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
  dropZone.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
  dropZone.classList.add('border-blue-400/50', 'bg-blue-500/10');
}

function unhighlight(e) {
  dropZone.classList.remove('border-blue-400/50', 'bg-blue-500/10');
}

dropZone.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
  const dt = e.dataTransfer;
  const files = dt.files;
  document.getElementById('imageUpload').files = files;
  handleImageUpload({ target: { files: files } });
}

updateTheme(); 