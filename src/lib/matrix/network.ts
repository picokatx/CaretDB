import { matrixGlobals as mGlob } from "./globals";
import { formatTimestamp } from "./player";
import { getFullPath, formatBytes } from "./console";
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
    return (
      req.url.toLowerCase().includes(mGlob.networkSearchText.toLowerCase()) ||
      (req.path &&
        req.path.toLowerCase().includes(mGlob.networkSearchText.toLowerCase())) ||
      (req.type &&
        req.type.toLowerCase().includes(mGlob.networkSearchText.toLowerCase()))
    );
  });

  // Clear previous content
  networkTimeline.innerHTML = "";

  if (filteredRequests.length === 0) {
    networkTimeline.innerHTML =
      '<tr><td colspan="7" class="text-center py-4">No network requests recorded</td></tr>';
    return;
  }

  // Use the first event as the base timestamp for relative time display
  const baseTimestamp =
    mGlob.rrwebEvents.length > 0
      ? mGlob.rrwebEvents[0].timestamp
      : filteredRequests.length > 0
        ? new Date(filteredRequests[0].timestamp).getTime()
        : 0;

  // Create network request items
  filteredRequests.forEach((req) => {
    const row = document.createElement("tr");
    row.className = "hover";

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

    // Format status code with color
    let statusHtml = "N/A";
    console.log("req.statusCode", req.statusCode, req);
    if (req.statusCode) {
      let statusClass = "";
      if (req.statusCode >= 500) statusClass = "text-error font-bold";
      else if (req.statusCode >= 400) statusClass = "text-error";
      else if (req.statusCode >= 300) statusClass = "text-warning";
      else if (req.statusCode >= 200) statusClass = "text-success";

      statusHtml = `<span class="${statusClass}">${req.statusCode}</span>`;
    }

    // Format timestamp relative to base
    let timeDisplay = "-";
    if (req.timestamp) {
      const timestamp = new Date(req.timestamp).getTime();
      timeDisplay = formatTimestamp(timestamp, baseTimestamp);
    }

    // Create row cells
    row.innerHTML = `
                <td class="max-w-xs truncate">${fullPath}</td>
                <td>${method}</td>
                <td>${statusHtml}</td>
                <td>${req.type || "unknown"}</td>
                <td>${formattedSize}</td>
                <td>${formattedDuration}</td>
                <td>${timeDisplay}</td>
            `;

    // Add tooltip with full URL
    row.title = req.url;

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