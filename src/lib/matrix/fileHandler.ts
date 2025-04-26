/**
 * File handler for uploading HTML files and pasted content
 */

interface UploadResult {
  success: boolean;
  fileName?: string;
  url?: string;
  error?: string;
}

/**
 * Initialize the file upload handlers
 */
export function initFileHandlers(onFileUploaded: (url: string) => void, onStatusUpdate: (message: string) => void) {
  const fileInput = document.getElementById('html-file-input') as HTMLInputElement;
  const uploadBtn = document.getElementById('upload-html-btn') as HTMLButtonElement;
  const htmlContentInput = document.getElementById('html-content-input') as HTMLTextAreaElement;
  const loadHtmlBtn = document.getElementById('load-html-btn') as HTMLButtonElement;
  const iframeUrlDisplay = document.getElementById('iframe-url-display');

  if (!fileInput || !uploadBtn || !htmlContentInput || !loadHtmlBtn) {
    console.error('File upload elements not found');
    return;
  }

  // Handle file upload button click
  uploadBtn.addEventListener('click', async () => {
    if (!fileInput?.files?.length) {
      alert('Please select an HTML file to upload');
      return;
    }

    const file = fileInput.files[0];
    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      alert('Please select a valid HTML file');
      return;
    }

    await uploadHtmlFile(file, onFileUploaded, onStatusUpdate, iframeUrlDisplay);
  });

  // Handle HTML content load
  loadHtmlBtn.addEventListener('click', async () => {
    const htmlContent = htmlContentInput?.value;
    
    if (!htmlContent) {
      alert('Please enter HTML content');
      return;
    }

    // Create a temporary File object from the content
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const file = new File([blob], 'pasted-content.html', { type: 'text/html' });
    
    await uploadHtmlFile(file, onFileUploaded, onStatusUpdate, iframeUrlDisplay);
  });

  // Add drag and drop functionality for the upload area
  setupDragAndDrop(fileInput);
}

/**
 * Upload an HTML file to the server
 */
async function uploadHtmlFile(
  file: File, 
  onSuccess: (url: string) => void, 
  onStatus: (message: string) => void,
  urlDisplay: HTMLElement | null
) {
  // Create form data for upload
  const formData = new FormData();
  formData.append('html', file);

  try {
    onStatus('Uploading HTML file...');
    
    // Send the file to the server
    const response = await fetch('/api/upload-html', {
      method: 'POST',
      body: formData
    });

    const result = await response.json() as UploadResult;
    
    if (!result.success || !result.url) {
      throw new Error(result.error || 'Upload failed');
    }

    onStatus('HTML file uploaded successfully!');
    
    // Update the URL display if it exists
    if (urlDisplay) {
      urlDisplay.textContent = result.url;
    }
    
    // Call the success callback with the new URL
    onSuccess(result.url);
  } catch (error) {
    console.error('Error uploading HTML file:', error);
    onStatus(`Error - ${error instanceof Error ? error.message : 'Upload failed'}`);
  }
}

/**
 * Setup drag and drop functionality
 */
function setupDragAndDrop(fileInput: HTMLInputElement) {
  const uploadArea = document.querySelector('label[for="html-file-input"]');
  if (!uploadArea) return;
  
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
    }, false);
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    uploadArea.addEventListener(eventName, () => {
      uploadArea.classList.add('bg-base-300');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, () => {
      uploadArea.classList.remove('bg-base-300');
    }, false);
  });

  uploadArea.addEventListener('drop', (e) => {
    if (e instanceof DragEvent && e.dataTransfer?.files?.length) {
      fileInput.files = e.dataTransfer.files;
    }
  }, false);
} 