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
export function initFileHandlers(
  onFileUploaded: (url: string) => void, 
  onStatusUpdate: (message: string) => void,
  onError: (errorMessage: string) => void
) {
  const fileInput = document.getElementById('html-file-input') as HTMLInputElement;
  const uploadBtn = document.getElementById('upload-html-btn') as HTMLButtonElement;
  const htmlContentInput = document.getElementById('html-content-input') as HTMLTextAreaElement;
  const loadHtmlBtn = document.getElementById('load-html-btn') as HTMLButtonElement;
  const iframeUrlDisplay = document.getElementById('iframe-url-display');
  const fileInputLabel = document.querySelector('label[for="html-file-input"]');
  const fileUploadPrompt = document.getElementById('file-upload-prompt');

  if (!fileInput || !uploadBtn || !htmlContentInput || !loadHtmlBtn || !fileInputLabel || !fileUploadPrompt) {
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
    
    // Show loading state on the button
    uploadBtn.disabled = true;
    uploadBtn.classList.add('loading', 'loading-spinner');
    const originalBtnText = uploadBtn.textContent;
    // uploadBtn.textContent = 'Uploading...'; // Optional: Change text

    try {
      await uploadHtmlFile(file, onFileUploaded, onStatusUpdate, iframeUrlDisplay, onError);
    } finally {
      // Restore button state regardless of success or error
      uploadBtn.disabled = false;
      uploadBtn.classList.remove('loading', 'loading-spinner');
      uploadBtn.textContent = originalBtnText; // Restore original text
    }
  });

  // Handle HTML content load
  loadHtmlBtn.addEventListener('click', async () => {
    const htmlContent = htmlContentInput?.value;
    
    if (!htmlContent) {
      alert('Please enter HTML content');
      return;
    }

    // Show loading state on the button
    loadHtmlBtn.disabled = true;
    loadHtmlBtn.classList.add('loading', 'loading-spinner');
    const originalBtnText = loadHtmlBtn.textContent;
    // loadHtmlBtn.textContent = 'Loading...'; // Optional: Change text

    // Create a temporary File object from the content
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const file = new File([blob], 'pasted-content.html', { type: 'text/html' });
    
    try {
      await uploadHtmlFile(file, onFileUploaded, onStatusUpdate, iframeUrlDisplay, onError);
    } finally {
      // Restore button state regardless of success or error
      loadHtmlBtn.disabled = false;
      loadHtmlBtn.classList.remove('loading', 'loading-spinner');
      loadHtmlBtn.textContent = originalBtnText; // Restore original text
    }
  });

  // Add drag and drop functionality for the upload area
  setupDragAndDrop(fileInput, fileInputLabel, fileUploadPrompt);

  // Add listener for file input changes to update UI
  fileInput.addEventListener('change', () => {
    updateFileInputUI(fileInput, fileInputLabel, fileUploadPrompt);
  });
}

/**
 * Upload an HTML file to the server
 */
async function uploadHtmlFile(
  file: File, 
  onSuccess: (url: string) => void, 
  onStatus: (message: string) => void,
  urlDisplay: HTMLElement | null,
  onError: (errorMessage: string) => void
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
    
    if (!response.ok || !result.success || !result.url) {
      const errorMessage = result.error || `Upload failed with status: ${response.status}`;
      onError(errorMessage);
      onStatus(`Error - ${errorMessage}`);
      return;
    }

    onStatus('HTML file uploaded successfully!');
    
    // Update the URL display if it exists
    if (urlDisplay) {
      urlDisplay.textContent = result.url;
    }
    
    // Call the success callback with the new URL
    onSuccess(result.url);

    // Show toast notification
    if (window.showGlobalToast) {
      window.showGlobalToast(`HTML file uploaded successfully: ${file.name}`, 'success');
    } else {
      console.warn("Global toast function not available."); // Fallback if somehow not loaded
    }

  } catch (error) {
    console.error('Error uploading HTML file:', error);
    const errorMessage = error instanceof Error ? error.message : 'Upload failed due to an unknown error';
    onError(errorMessage);
    onStatus(`Error - ${errorMessage}`);
  }
}

/**
 * Setup drag and drop functionality
 */
function setupDragAndDrop(
  fileInput: HTMLInputElement,
  labelElement: Element | null,
  promptElement: HTMLElement | null
) {
  const uploadArea = labelElement; // Use the label directly
  if (!uploadArea || !labelElement || !promptElement) return;
  
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
      // Manually trigger UI update after setting files via drag/drop
      updateFileInputUI(fileInput, labelElement, promptElement);
    }
  }, false);
}

/**
 * Updates the file input UI to show a badge with the filename
 * or the default prompt.
 */
function updateFileInputUI(
  fileInput: HTMLInputElement,
  labelElement: Element | null,
  promptElement: HTMLElement | null
) {
  if (!labelElement || !promptElement) return;

  const existingBadge = labelElement.querySelector('#file-upload-badge');
  if (existingBadge) {
    labelElement.removeChild(existingBadge);
  }

  if (fileInput.files && fileInput.files.length > 0) {
    const file = fileInput.files[0];
    promptElement.style.display = 'none'; // Hide prompt

    const badge = document.createElement('span');
    badge.id = 'file-upload-badge';
    badge.className = 'badge badge-lg badge-outline p-4'; // Added padding
    badge.textContent = file.name;
    labelElement.appendChild(badge);
  } else {
    promptElement.style.display = ''; // Show prompt
  }
} 