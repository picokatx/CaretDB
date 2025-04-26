/**
 * Recorder controller for managing recording sessions
 */

// Interface for the iframe window
export interface IframeWindowWithRecorder extends Window {
  startRecordingInIframe?: () => void;
  stopRecordingInIframe?: () => void;
}

/**
 * Initialize the recording controller
 */
export function initRecorder(
  onRecordingStart: () => void,
  onRecordingStop: () => void,
  onStatusUpdate: (message: string) => void,
  onReceiveEvent: (event: any) => void,
  onReceiveConsoleLog: (log: any) => void,
  onReceiveNetworkRequest: (request: any) => void,
  onReceiveAllNetworkRequests: (requests: any[]) => void
) {
  // Get DOM elements
  const recordFrame = document.getElementById('record-frame') as HTMLIFrameElement;
  const startBtn = document.getElementById('start-record-btn') as HTMLButtonElement;
  const stopBtn = document.getElementById('stop-replay-btn') as HTMLButtonElement;
  
  if (!recordFrame || !startBtn || !stopBtn) {
    console.error('Recording elements not found');
    return;
  }

  let isRecording = false;
  
  // Prevent Sentry from capturing expected errors
  setupErrorPrevention();

  // Set up message listener from iframe
  window.addEventListener('message', createMessageHandler(
    recordFrame,
    onStatusUpdate,
    onReceiveEvent,
    onReceiveConsoleLog,
    onReceiveNetworkRequest,
    onReceiveAllNetworkRequests
  ));

  // Start recording button click handler
  startBtn.addEventListener('click', () => {
    if (isRecording) {
      console.warn("Start clicked but already recording.");
      return;
    }
   
    const iframeWin = recordFrame.contentWindow as IframeWindowWithRecorder | null;
   
    if (iframeWin && typeof iframeWin.startRecordingInIframe === 'function') {
      isRecording = true;
      onStatusUpdate('Recording... (in iframe)');
      startBtn.disabled = true;
      stopBtn.disabled = false;
     
      // Call the function defined INSIDE the iframe
      iframeWin.startRecordingInIframe();
      onRecordingStart();
    } else {
      onStatusUpdate('Error: Cannot call start function in iframe. Is it loaded?');
      console.error('Iframe window or startRecordingInIframe function not available.');
    }
  });

  // Stop recording button click handler
  stopBtn.addEventListener('click', () => {
    if (!isRecording) return;

    const iframeWin = recordFrame.contentWindow as IframeWindowWithRecorder | null;
    
    // Call stop function inside iframe
    if (iframeWin && typeof iframeWin.stopRecordingInIframe === 'function') {
      iframeWin.stopRecordingInIframe();
    } else {
      console.warn('Could not call stop function in iframe. Events might be incomplete.');
    }
   
    isRecording = false;
    onStatusUpdate('Recording stopped. Preparing replay...');
    stopBtn.disabled = true;
    
    // Call the recording stop callback
    onRecordingStop();
  });
}

/**
 * Create a message handler for iframe messages
 */
function createMessageHandler(
  recordFrame: HTMLIFrameElement,
  onStatusUpdate: (message: string) => void,
  onReceiveEvent: (event: any) => void,
  onReceiveConsoleLog: (log: any) => void,
  onReceiveNetworkRequest: (request: any) => void,
  onReceiveAllNetworkRequests: (requests: any[]) => void
) {
  return (event: MessageEvent) => {
    // Security check to validate message source
    if (event.source !== recordFrame.contentWindow) {
      console.warn('Received message from unknown source, ignoring.');
      return;
    }
    
    // Process different message types
    switch (event.data?.type) {
      case 'iframeReady':
        console.log('Received iframe ready notification.');
        const startBtn = document.getElementById('start-record-btn') as HTMLButtonElement;
        if (startBtn) startBtn.disabled = false;
        onStatusUpdate('Ready');
        break;
        
      case 'rrwebEvent':
        if (event.data.event) {
          onReceiveEvent(event.data.event);
        }
        break;
        
      case 'statusUpdate':
        console.log(`Received status update: ${event.data.text}`);
        onStatusUpdate(event.data.text);
        break;
      
      case 'consoleLog':
        if (event.data) {
          onReceiveConsoleLog(event.data);
        }
        break;
        
      case 'networkRequest':
        if (event.data && event.data.request) {
          onReceiveNetworkRequest(event.data.request);
        }
        break;
        
      case 'allNetworkRequests':
        if (event.data && event.data.requests) {
          onReceiveAllNetworkRequests(event.data.requests);
        }
        break;
        
      default:
        console.log('Received unknown message type from iframe:', event.data);
    }
  };
}

/**
 * Set up iframe URL
 */
export function setIframeUrl(url: string) {
  const recordFrame = document.getElementById('record-frame') as HTMLIFrameElement;
  if (recordFrame) {
    recordFrame.src = url;
  }
}

/**
 * Setup error prevention to avoid Sentry reporting expected errors
 */
function setupErrorPrevention() {
  // Disable Sentry reporting for this app
  window.addEventListener('error', (event) => {
    // Check if this is a CORS error or a known error we want to prevent from sending to Sentry
    if (event.message.includes('SecurityError') || 
        event.message.includes('cross-origin') ||
        event.message.includes('stylesheet')) {
      // Prevent the error from propagating to error handlers like Sentry
      event.stopImmediatePropagation();
      event.preventDefault();
      
      // Just log it to the console but don't let it propagate to Sentry
      console.warn('Intercepted error:', event.message);
      return true;
    }
    return false;
  }, true);

  // Also handle unhandled promise rejections to prevent Sentry errors
  window.addEventListener('unhandledrejection', (event) => {
    // Check if this is a CORS-related promise rejection
    if (event.reason && (
      (typeof event.reason.message === 'string' && (
        event.reason.message.includes('SecurityError') || 
        event.reason.message.includes('cross-origin') ||
        event.reason.message.includes('stylesheet')
      )) || 
      (event.reason.name === 'SecurityError')
    )) {
      // Prevent the rejection from propagating to error handlers like Sentry
      event.stopImmediatePropagation();
      event.preventDefault();
      
      // Just log it to the console but don't let it propagate to Sentry
      console.warn('Intercepted promise rejection:', event.reason);
      return true;
    }
    return false;
  }, true);
} 