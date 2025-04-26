/**
 * Network controller for displaying network requests
 */

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
    document.getElementById('network-container')?.innerHTML = 
      '<div class="p-4 text-center">No network requests recorded</div>';
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