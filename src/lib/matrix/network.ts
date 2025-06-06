import { matrixGlobals as mGlob } from "./globals";
import { formatTimestamp } from "./player";
import { getFullPath, formatBytes } from "./console";

// --- NEW Helper Function to Determine Request Type ---
function determineRequestType(request: any): string {
    // 1. Check Content-Type header (case-insensitive)
    const contentTypeHeader = request.responseHeaders ? 
        Object.keys(request.responseHeaders).find(key => key.toLowerCase() === 'content-type') : undefined;
    const contentType = contentTypeHeader ? request.responseHeaders[contentTypeHeader].toLowerCase() : null;

    if (contentType) {
        if (contentType.includes('html')) return 'html';
        if (contentType.includes('css')) return 'css';
        if (contentType.includes('javascript')) return 'js';
        if (contentType.includes('json')) return 'json';
        if (contentType.includes('image')) return 'image';
        if (contentType.includes('font')) return 'font';
        if (contentType.includes('xml')) return 'xml';
        if (contentType.includes('text/plain')) return 'text';
        // Add more specific types if needed
    }

    // 2. Check URL extension
    if (request.url) {
        try {
            const url = new URL(request.url);
            const path = url.pathname;
            const extension = path.split('.').pop()?.toLowerCase();

            if (extension) {
                switch (extension) {
                    case 'html':
                    case 'htm': return 'html';
                    case 'css': return 'css';
                    case 'js':
                    case 'mjs': return 'js';
                    case 'json': return 'json';
                    case 'png':
                    case 'jpg':
                    case 'jpeg':
                    case 'gif':
                    case 'svg':
                    case 'webp':
                    case 'ico': return 'image';
                    case 'woff':
                    case 'woff2':
                    case 'ttf':
                    case 'otf':
                    case 'eot': return 'font';
                    case 'xml': return 'xml';
                    case 'txt': return 'text';
                    // Add more extensions if needed
                }
            }
        } catch (e) {
            console.warn(`Could not parse URL for extension: ${request.url}`, e);
        }
    }
    
    // 3. Check initiatorType as a fallback (less specific)
    if (request.initiatorType) {
       // Basic mapping, could be expanded
       if (['fetch', 'xhr'].includes(request.initiatorType)) return 'fetch/xhr';
       if (['img', 'image'].includes(request.initiatorType)) return 'image';
       if (['script'].includes(request.initiatorType)) return 'script'; 
       if (['css', 'link'].includes(request.initiatorType)) return 'css'; // 'link' often implies css
       return request.initiatorType; // Return raw initiatorType if specific mapping unknown
    }

    // 4. Fallback
    return 'N/A'; 
}

// Helper function to display details in the modal
function displayNetworkRequestDetails(request: any): void {
  const modal = document.getElementById('network-detail-modal') as HTMLDialogElement;
  if (!modal) return;

  // --- Populate General Info ---
  (modal.querySelector('#modal-net-url') as HTMLElement).textContent = request.url || 'N/A';
  (modal.querySelector('#modal-net-method') as HTMLElement).textContent = request.method || 'N/A';
  (modal.querySelector('#modal-net-status') as HTMLElement).innerHTML = request.status ? String(request.status) : '--'; // Use innerHTML for potential status styling later
  (modal.querySelector('#modal-net-type') as HTMLElement).textContent = request.type || 'N/A';
  (modal.querySelector('#modal-net-duration') as HTMLElement).textContent = request.duration !== undefined ? `${request.duration.toFixed(2)} ms` : 'N/A';
  (modal.querySelector('#modal-net-size') as HTMLElement).textContent = request.size !== undefined ? formatBytes(request.size) : 'N/A';
  (modal.querySelector('#modal-net-timestamp') as HTMLElement).textContent = request.timestamp ? new Date(request.timestamp).toLocaleTimeString() : 'N/A';
  
  // Update status color specifically if needed (example)
   const statusEl = modal.querySelector('#modal-net-status') as HTMLElement;
   if (statusEl) {
       statusEl.className = ''; // Reset class
       if (request.status >= 500) statusEl.classList.add("text-error", "font-bold");
       else if (request.status >= 400) statusEl.classList.add("text-error");
       else if (request.status >= 300) statusEl.classList.add("text-warning");
       else if (request.status >= 200) statusEl.classList.add("text-success");
   }

  // --- Populate Headers --- 
  const reqHeadersEl = modal.querySelector('#modal-net-req-headers') as HTMLElement;
  const resHeadersEl = modal.querySelector('#modal-net-res-headers') as HTMLElement;
  const jsonContentEl = modal.querySelector('#modal-net-json') as HTMLPreElement;
  const noHeadersMsg = 'Headers not captured for this request type or not available.';

  reqHeadersEl.textContent = request.requestHeaders && Object.keys(request.requestHeaders).length > 0 
    ? Object.entries(request.requestHeaders).map(([key, value]) => `${key}: ${value}`).join('\n') 
    : noHeadersMsg;

  resHeadersEl.textContent = request.responseHeaders && Object.keys(request.responseHeaders).length > 0
    ? Object.entries(request.responseHeaders).map(([key, value]) => `${key}: ${value}`).join('\n')
    : noHeadersMsg;

  // --- Populate JSON --- 
  try {
      jsonContentEl.textContent = JSON.stringify(request, null, 2); // Pretty print JSON
  } catch (e) {
      console.error("Error stringifying network request:", e);
      jsonContentEl.textContent = "Error displaying JSON data.";
  }

  // --- Reset Tabs --- 
  const tabs = modal.querySelectorAll('.tabs .tab');
  tabs.forEach(tab => tab.classList.remove('tab-active'));
  (tabs[0] as HTMLElement).classList.add('tab-active'); // Default to request headers tab
  reqHeadersEl.classList.remove('hidden');
  resHeadersEl.classList.add('hidden');
  jsonContentEl.classList.add('hidden'); // Hide JSON initially

  // --- Show Modal --- 
  modal.showModal();
}

// Function to handle tab switching within the modal
function setupModalTabs(): void {
    const modal = document.getElementById('network-detail-modal');
    if (!modal) return;

    const tabs = modal.querySelectorAll('.tabs .tab');
    const reqHeadersEl = modal.querySelector('#modal-net-req-headers') as HTMLElement;
    const resHeadersEl = modal.querySelector('#modal-net-res-headers') as HTMLElement;
    const jsonContentEl = modal.querySelector('#modal-net-json') as HTMLPreElement;
    // Add selectors for body divs later if implemented

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Deactivate all tabs
            tabs.forEach(t => t.classList.remove('tab-active'));
            // Activate clicked tab
            tab.classList.add('tab-active');

            // Show corresponding content
            const tabType = (tab as HTMLElement).dataset.tab;
            reqHeadersEl.classList.toggle('hidden', tabType !== 'req-headers');
            resHeadersEl.classList.toggle('hidden', tabType !== 'res-headers');
            jsonContentEl.classList.toggle('hidden', tabType !== 'json');
            // Add logic for body tabs later
        });
    });
}

// Call setup for tabs once when the script loads (or after modal is added to DOM)
// Since it's part of the Astro component, it should exist when script runs
setupModalTabs();

/**
 * Network controller for displaying network requests
 */
// Generate network requests view
export function updateNetworkRequestsView(): void {
  const networkTimeline = document.getElementById('network-timeline') as HTMLDivElement;
  if (!networkTimeline) return;

  console.log(
    `Updating network view with ${mGlob.networkRequests.length} requests`
  );

  // Filter network requests based on search text
  const filteredRequests = mGlob.networkRequests.filter((req) => {
    if (!mGlob.networkSearchText) return true;

    // Search in URL, path, and now also in type
    // Make sure req properties exist before calling toLowerCase
    const urlMatch = req.url?.toLowerCase().includes(mGlob.networkSearchText.toLowerCase());
    const pathMatch = req.path?.toLowerCase().includes(mGlob.networkSearchText.toLowerCase());
    const typeMatch = req.type?.toLowerCase().includes(mGlob.networkSearchText.toLowerCase());
    
    return urlMatch || pathMatch || typeMatch;
  });

  // Clear previous content
  networkTimeline.innerHTML = "";

  if (filteredRequests.length === 0) {
    networkTimeline.innerHTML =
      '<tr><td colspan="7" class="text-center py-4">No network requests recorded or matching filter</td></tr>'; // Updated message
    return;
  }

  // Use the first event as the base timestamp for relative time display
  const baseTimestamp =
    mGlob.rrwebEvents.length > 0
      ? mGlob.rrwebEvents[0].timestamp
      : filteredRequests.length > 0 && filteredRequests[0].timestamp
        ? new Date(filteredRequests[0].timestamp).getTime()
        : Date.now(); // Fallback to current time if no timestamps available

  // Create network request items
  filteredRequests.forEach((req) => {
    const row = document.createElement("tr");
    row.className = "hover cursor-pointer"; // Added hover and cursor-pointer

    // Format the size - ensure it's a number
    const size =
      typeof req.size === "number" ? req.size : parseInt(req.size) || 0;
    const formattedSize = formatBytes(size);

    // Format the duration to 2 decimal places
    const duration =
      typeof req.duration === "number"
        ? req.duration
        : parseFloat(req.duration) || 0;
    const formattedDuration = duration.toFixed(2) + " ms";

    // Get full path from URL
    const fullPath = req.path ? req.path : getFullPath(req.url);

    // Get request method
    const method = req.method || req.initiatorType || "other";
    
    // --- Determine Request Type using helper ---
    const determinedType = determineRequestType(req);

    // Format status code with color
    let statusHtml = '--'; // Default
    if (req.status !== undefined && req.status !== 0) { // Check for valid status
      let statusClass = "";
      if (req.status >= 500) statusClass = "text-error font-bold";
      else if (req.status >= 400) statusClass = "text-error";
      else if (req.status >= 300) statusClass = "text-warning";
      else if (req.status >= 200) statusClass = "text-success";
      statusHtml = `<span class="${statusClass}">${req.status}</span>`;
    } else if (req.error) {
        statusHtml = `<span class="text-error font-bold" title="${req.error}">Error</span>`; // Show "Error" if status is 0 and error exists
    }

    // Format timestamp relative to base
    let timeDisplay = "-";
    let elapsedMillis = 0;
    if (req.timestamp) {
      try {
          const timestamp = new Date(req.timestamp).getTime();
          elapsedMillis = Math.max(0, timestamp - baseTimestamp);
          timeDisplay = formatTimestamp(timestamp, baseTimestamp);
      } catch (e) {
          console.error("Error parsing network request timestamp:", req.timestamp, e);
          timeDisplay = "Invalid Date";
      }
    }

    // Create row cells with jump button
    row.innerHTML = `
                <td class="max-w-xs truncate">${fullPath || 'N/A'}</td>
                <td>${method}</td>
                <td>${statusHtml}</td>
                <td>${determinedType}</td>
                <td>${formattedSize}</td>
                <td>${formattedDuration}</td>
                <td class="flex items-center">
                    <button class="btn btn-xs btn-ghost btn-circle mr-1 jump-to-network-btn" data-timestamp="${elapsedMillis}" title="Jump to this time">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </button>
                    ${timeDisplay}
                </td>
            `;

    // Add tooltip with full URL
    row.title = req.url || 'No URL';

    // Add click handler for the jump button
    const jumpBtn = row.querySelector('.jump-to-network-btn');
    jumpBtn?.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent triggering the row click listener
      const timestampToJump = parseInt((e.currentTarget as HTMLElement).dataset.timestamp || '0');
      if (mGlob.playerInstance && typeof mGlob.playerInstance.goto === 'function' && timestampToJump >= 0) { // Check >= 0
        console.log("Jumping player to timestamp:", timestampToJump);
        mGlob.playerInstance.goto(timestampToJump);
      } else {
        console.warn("Could not jump player. Instance:", mGlob.playerInstance, "Timestamp:", timestampToJump);
      }
    });

    // Add click listener for the entire row to show details
    row.addEventListener('click', () => {
        displayNetworkRequestDetails(req);
    });

    networkTimeline.appendChild(row);
  });
}
/**
 * Interface for network request entry
 */
export interface NetworkRequest {
  id: string;
  url: string;
  method: string;
  status: number;
  type: string;
  size: number;
  time: number;
  timestamp: number;
}

/**
 * Initialize network panel with recorded request data
 */
export function initNetworkPanel(events: any[]): void {
  const networkRequests = extractNetworkRequests(events);

  if (networkRequests.length === 0) {
    const networkContainer = document.getElementById('network-container');
    if (networkContainer) {
      networkContainer.innerHTML = '<div class="p-4 text-center">No network requests recorded</div>';
    }
    return;
  }

  displayNetworkRequests(networkRequests);
  setupNetworkFilters(networkRequests);
}

/**
 * Extract network requests from events
 */
function extractNetworkRequests(events: any[]): NetworkRequest[] {
  const networkRequests: NetworkRequest[] = [];

  events.forEach(event => {
    // Look for special console log events that contain network information
    if (event.type === 3 && event.data.source === 6 && event.data.level === 'network') {
      try {
        const payload = event.data.payload;
        if (Array.isArray(payload) && payload.length > 0) {
          const networkData = payload[0];

          if (typeof networkData === 'object' && networkData !== null) {
            // Create a network request entry
            const request: NetworkRequest = {
              id: networkData.id || `req-${Math.random().toString(36).substr(2, 9)}`,
              url: networkData.url || '',
              method: networkData.method || 'GET',
              status: networkData.status || 0,
              type: getContentType(networkData.contentType || ''),
              size: networkData.size || 0,
              time: networkData.time || 0,
              timestamp: event.timestamp
            };

            networkRequests.push(request);
          }
        }
      } catch (e) {
        console.error('Error parsing network request:', e);
      }
    }
  });

  return networkRequests;
}

/**
 * Extract content type from header
 */
function getContentType(contentType: string): string {
  if (!contentType) return 'other';

  if (contentType.includes('text/html')) return 'html';
  if (contentType.includes('text/css')) return 'css';
  if (contentType.includes('application/javascript') || contentType.includes('text/javascript')) return 'js';
  if (contentType.includes('application/json')) return 'json';
  if (contentType.includes('image/')) return 'image';
  if (contentType.includes('font/') || contentType.includes('application/font')) return 'font';
  if (contentType.includes('audio/')) return 'audio';
  if (contentType.includes('video/')) return 'video';

  return 'other';
}

/**
 * Format file size
 */
function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format time in milliseconds
 */
function formatTime(ms: number): string {
  if (ms < 1) return '< 1 ms';
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

/**
 * Display network requests in the table
 */
function displayNetworkRequests(requests: NetworkRequest[]): void {
  const networkTable = document.getElementById('network-table-body');
  if (!networkTable) return;

  networkTable.innerHTML = '';

  requests.forEach(request => {
    const row = document.createElement('tr');
    row.className = 'hover:bg-base-200';

    // Set status color
    let statusClass = 'text-base-content';
    if (request.status >= 200 && request.status < 300) {
      statusClass = 'text-success';
    } else if (request.status >= 300 && request.status < 400) {
      statusClass = 'text-warning';
    } else if (request.status >= 400) {
      statusClass = 'text-error';
    }

    // Create URL display with truncation if too long
    const displayUrl = request.url.length > 50
      ? request.url.substring(0, 47) + '...'
      : request.url;

    // Add row content
    row.innerHTML = `
      <td class="font-mono text-xs">${request.method}</td>
      <td class="font-mono text-xs" title="${request.url}">${displayUrl}</td>
      <td class="${statusClass} font-mono text-xs">${request.status || '-'}</td>
      <td class="font-mono text-xs">${request.type}</td>
      <td class="font-mono text-xs">${formatSize(request.size)}</td>
      <td class="font-mono text-xs">${formatTime(request.time)}</td>
    `;

    // Add click handler to show details
    row.addEventListener('click', () => {
      showNetworkDetails(request);
    });

    networkTable.appendChild(row);
  });
}

/**
 * Show details of a network request
 */
function showNetworkDetails(request: NetworkRequest): void {
  const detailsContainer = document.getElementById('network-details');
  if (!detailsContainer) return;

  detailsContainer.innerHTML = `
    <div class="bg-base-200 p-4 rounded-lg">
      <h4 class="font-bold">${request.url}</h4>
      <div class="grid grid-cols-2 gap-2 mt-2">
        <div>
          <p class="text-sm opacity-70">Method:</p>
          <p class="font-mono">${request.method}</p>
        </div>
        <div>
          <p class="text-sm opacity-70">Status:</p>
          <p class="font-mono">${request.status || 'Unknown'}</p>
        </div>
        <div>
          <p class="text-sm opacity-70">Type:</p>
          <p class="font-mono">${request.type}</p>
        </div>
        <div>
          <p class="text-sm opacity-70">Size:</p>
          <p class="font-mono">${formatSize(request.size)}</p>
        </div>
        <div>
          <p class="text-sm opacity-70">Time:</p>
          <p class="font-mono">${formatTime(request.time)}</p>
        </div>
      </div>
    </div>
  `;

  detailsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Setup network filters
 */
function setupNetworkFilters(requests: NetworkRequest[]): void {
  const networkFilter = document.getElementById('network-filter') as HTMLInputElement;

  if (!networkFilter) return;

  networkFilter.addEventListener('input', () => {
    const filterValue = networkFilter.value.toLowerCase();

    // Filter requests based on URL, method, type
    const filteredRequests = requests.filter(request =>
      request.url.toLowerCase().includes(filterValue) ||
      request.method.toLowerCase().includes(filterValue) ||
      request.type.toLowerCase().includes(filterValue)
    );

    displayNetworkRequests(filteredRequests);
  });
} 