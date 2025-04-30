import {matrixGlobals as mGlob } from "./globals";
import { EventType } from "rrweb";
import { initPlayer, updateStatus } from "./player";
import { generateTimelineView } from "./timeline";
import { updateConsoleLogsView } from "./console";
import { updateNetworkRequestsView } from "./network";
import { updateTabHighlighting } from "./timeline";
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
export function initRecorder() {
  // Get DOM elements
  const recordFrame = document.getElementById('record-frame') as HTMLIFrameElement;
  const startBtn = document.getElementById('start-record-btn') as HTMLButtonElement;
  const stopBtn = document.getElementById('stop-replay-btn') as HTMLButtonElement;
  const statusEl = document.getElementById('status-display') as HTMLDivElement;
  const replayContainer = document.getElementById('replay-container') as HTMLDivElement;
  const eventTimeline = document.getElementById('event-timeline') as HTMLDivElement;
  const jsonContent = document.getElementById('json-content') as HTMLTextAreaElement;
  const timelineViewBtn = document.getElementById('timeline-view-btn') as HTMLButtonElement;
  const rawViewBtn = document.getElementById('raw-view-btn') as HTMLButtonElement;
  const consoleViewBtn = document.getElementById('console-view-btn') as HTMLButtonElement;
  const networkViewBtn = document.getElementById('network-view-btn') as HTMLButtonElement;
  const tagsViewBtn = document.getElementById('tags-view-btn') as HTMLButtonElement;
  const timelineView = document.getElementById('timeline-view') as HTMLDivElement;
  const rawJsonView = document.getElementById('raw-json-view') as HTMLDivElement;
  const consoleLogsView = document.getElementById('console-logs-view') as HTMLDivElement;
  const networkRequestsView = document.getElementById('network-requests-view') as HTMLDivElement;
  const tagsView = document.getElementById('tags-view') as HTMLDivElement;

  if (!recordFrame || !startBtn || !stopBtn || !timelineViewBtn || !rawViewBtn || !consoleViewBtn || !networkViewBtn || !tagsViewBtn || !timelineView || !rawJsonView || !consoleLogsView || !networkRequestsView || !tagsView) {
    console.error('Recording or view elements not found');
    return;
  }

  let isRecording = false;

  // Prevent Sentry from capturing expected errors
  setupErrorPrevention();

  // Set up message listener from iframe
  window.addEventListener("message", (event) => {
    // Security check to validate message source (should be more specific in production)
    if (event.source !== recordFrame?.contentWindow) {
      console.warn("Parent: Received message from unknown source, ignoring.");
      return;
    }

    // Process different message types
    switch (event.data?.type) {
      case "iframeReady":
        console.log("Parent: Received iframe ready notification.");
        if (startBtn) startBtn.disabled = false;
        if (statusEl) statusEl.textContent = "Status: Ready";
        break;

      case "rrwebEvent":
        if (isRecording && event.data.event) {
          mGlob.rrwebEvents.push(event.data.event);
          // If this is a console log event, extract it
          if (
            event.data.event.type === EventType.Plugin &&
            event.data.event.data.plugin === "rrweb/console@1"
          ) {
            // Extract the console log data and add timestamp
            const logData = { ...event.data.event.data.payload };
            logData.timestamp = event.data.event.timestamp;
            mGlob.consoleLogs.push(logData);
          }
        }
        break;

      case "statusUpdate":
        console.log(`Parent: Received status update: ${event.data.text}`);
        if (statusEl) statusEl.textContent = `Status: ${event.data.text}`;
        break;

      case "consoleLog":
        if (isRecording && event.data) {
          mGlob.consoleLogs.push(event.data);
        }
        break;

      case "networkRequest":
        if (isRecording && event.data && event.data.request) {
          mGlob.networkRequests.push(event.data.request);
        }
        break;

      case "allNetworkRequests":
        if (event.data && event.data.requests) {
          // Replace any individually received requests with the complete set
          mGlob.networkRequests = event.data.requests;
        }
        break;

      default:
        console.log(
          "Parent: Received unknown message type from iframe:",
          event.data
        );
    }
  });

  // Start recording button click handler
  startBtn.addEventListener('click', () => {
    if (isRecording) {
      console.warn("Start clicked but already recording.");
      return;
    }

    const iframeWin = recordFrame.contentWindow as IframeWindowWithRecorder | null;

    if (iframeWin && typeof iframeWin.startRecordingInIframe === 'function') {
      isRecording = true;
      mGlob.rrwebEvents = [];
      mGlob.consoleLogs = []; 
      updateStatus('Recording... (in iframe)');
      startBtn.disabled = true;
      stopBtn.disabled = false;
      // Clear previous replay
      if (mGlob.playerInstance) {
        // For rrweb-player we need to remove it from DOM
        if (replayContainer) replayContainer.innerHTML = "";
        mGlob.playerInstance = null;
      }
      // Reset timeline view
      if (eventTimeline) {
        eventTimeline.innerHTML =
          '<div class="p-4 text-center text-base-content/60">Recording in progress...</div>';
      }
      // Call the function defined INSIDE the iframe
      iframeWin.startRecordingInIframe();
    } else {
      updateStatus('Error: Cannot call start function in iframe. Is it loaded?');
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
    updateStatus('Recording stopped. Preparing replay...');
    stopBtn.disabled = true;
    startBtn.disabled = false;

      // Format the JSON for raw view
      const formattedJson = JSON.stringify(mGlob.rrwebEvents, null, 2);
      jsonContent!.textContent = formattedJson;

      // Generate the timeline view
      generateTimelineView(mGlob.rrwebEvents);

      // Update the console logs view
      updateConsoleLogsView();

      // Update the network requests view
      updateNetworkRequestsView();

      // Populate the Tags view with static data
      populateTagsView();

      // Set view to timeline using the helper function
      updateTabHighlighting(timelineViewBtn);
      timelineView!.classList.remove("hidden");
      rawJsonView!.classList.add("hidden");
      consoleLogsView!.classList.add("hidden");
      networkRequestsView!.classList.add("hidden");
      tagsView!.classList.add("hidden");

      // Initialize the player and store the instance globally
      const player = initPlayer(mGlob.rrwebEvents, replayContainer);
      if (player) {
        mGlob.playerInstance = player;
        console.log("Player instance initialized and stored.");
      } else {
        console.error("Failed to initialize player instance.");
        mGlob.playerInstance = null; // Ensure it's null if init failed
      }
  });
}

/**
 * Create a message handler for iframe messages
 */
function createMessageHandler(
  recordFrame: HTMLIFrameElement,
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
        updateStatus('Ready');
        break;

      case 'rrwebEvent':
        if (event.data.event) {
          onReceiveEvent(event.data.event);
        }
        break;

      case 'statusUpdate':
        console.log(`Received status update: ${event.data.text}`);
        updateStatus(event.data.text);
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
export function setupErrorPrevention() {
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

/**
 * Populates the Tags view tab with static data.
 * TODO: Replace static data with dynamically fetched data from Sentry/environment.
 */
function populateTagsView(): void {
  const tagsContent = document.getElementById('tags-content');
  if (!tagsContent) {
    console.error("Tags content area (#tags-content) not found.");
    return;
  }

  // Static tag data (replace with dynamic fetching later)
  const tagsData = {
    "browser.name": "Firefox",
    "browser.version": "137.0",
    "environment": "production",
    "os.name": "Windows",
    "os.version": ">=10",
    "platform": "javascript",
    "releases": "unknown", // Or fetch dynamically if possible
    "replayType": "buffer",
    "sdk.name": "sentry.javascript.astro",
    "sdk.replay.blockAllMedia": "true",
    "sdk.replay.errorSampleRate": "1",
    "sdk.replay.maskAllInputs": "true",
    "sdk.replay.maskAllText": "true",
    "sdk.replay.networkCaptureBodies": "true",
    "sdk.replay.networkDetailHasUrls": "false",
    "sdk.replay.networkRequestHasHeaders": "true",
    "sdk.replay.networkResponseHasHeaders": "true",
    "sdk.replay.sessionSampleRate": "0.1",
    "sdk.replay.shouldRecordCanvas": "false",
    "sdk.replay.useCompression": "false",
    "sdk.replay.useCompressionOption": "true",
    "sdk.version": "9.14.0",
    "user.ip": "116.88.152.58" // Note: IP is sensitive, be cautious
  };

  let tableHtml = "";
  for (const [key, value] of Object.entries(tagsData)) {
    tableHtml += `
      <tr>
        <td class="font-mono text-xs break-all">${key}</td>
        <td class="text-sm break-all">${value}</td>
      </tr>
    `;
  }

  tagsContent.innerHTML = tableHtml;
} 