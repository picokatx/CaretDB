/**
 * Console controller for displaying console logs
 */

/**
 * Console log entry interface
 */
export interface ConsoleLogEntry {
  id: string;
  level: string;
  message: string;
  timestamp: number;
  source: number;
  payload: any[];
}

/**
 * Initialize console panel
 */
export function initConsolePanel(events: any[]): void {
  const consoleEntries = extractConsoleLogs(events);
  
  if (consoleEntries.length === 0) {
    const consoleContainer = document.getElementById('console-container');
    if (consoleContainer) {
      consoleContainer.innerHTML = '<div class="p-4 text-center">No console logs recorded</div>';
    }
    return;
  }
  
  displayConsoleEntries(consoleEntries);
  setupConsoleFilters(consoleEntries);
}

/**
 * Extract console logs from events
 */
function extractConsoleLogs(events: any[]): ConsoleLogEntry[] {
  const consoleEntries: ConsoleLogEntry[] = [];
  
  events.forEach(event => {
    if (event.type === 3 && event.data && event.data.source !== undefined) {
      // Skip network logs which are handled by the network panel
      if (event.data.level === 'network') {
        return;
      }
      
      try {
        const entry: ConsoleLogEntry = {
          id: `log-${Math.random().toString(36).substr(2, 9)}`,
          level: event.data.level || 'log',
          message: formatConsoleMessage(event.data.payload),
          timestamp: event.timestamp,
          source: event.data.source,
          payload: event.data.payload || []
        };
        
        consoleEntries.push(entry);
      } catch (e) {
        console.error('Error parsing console log:', e);
      }
    }
  });
  
  return consoleEntries;
}

/**
 * Format console message
 */
function formatConsoleMessage(payload: any[]): string {
  if (!payload || !Array.isArray(payload) || payload.length === 0) {
    return '';
  }
  
  return payload.map(item => {
    if (typeof item === 'object' && item !== null) {
      try {
        return JSON.stringify(item, null, 2);
      } catch (e) {
        return String(item);
      }
    }
    return String(item);
  }).join(' ');
}

/**
 * Get level class for styling
 */
function getLevelClass(level: string): string {
  switch (level.toLowerCase()) {
    case 'error':
      return 'text-error';
    case 'warn':
      return 'text-warning';
    case 'info':
      return 'text-info';
    case 'debug':
      return 'text-success';
    default:
      return 'text-base-content';
  }
}

/**
 * Get level icon
 */
function getLevelIcon(level: string): string {
  switch (level.toLowerCase()) {
    case 'error':
      return '❌';
    case 'warn':
      return '⚠️';
    case 'info':
      return 'ℹ️';
    case 'debug':
      return '🔍';
    default:
      return '📝';
  }
}

/**
 * Format timestamp to readable time
 */
function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
  
  return `${hours}:${minutes}:${seconds}.${milliseconds}`;
}

/**
 * Display console entries in the container
 */
function displayConsoleEntries(entries: ConsoleLogEntry[]): void {
  const consoleOutput = document.getElementById('console-output');
  if (!consoleOutput) return;
  
  consoleOutput.innerHTML = '';
  
  entries.forEach(entry => {
    const logElement = document.createElement('div');
    logElement.className = `p-2 border-b border-base-300 ${getLevelClass(entry.level)}`;
    
    // Create expandable log entry
    const isExpandable = entry.message.length > 100 || entry.message.includes('\n');
    
    if (isExpandable) {
      logElement.innerHTML = `
        <div class="flex items-start">
          <div class="mr-2">${getLevelIcon(entry.level)}</div>
          <div class="flex-1">
            <div class="flex justify-between">
              <span class="font-mono text-xs opacity-70">[${formatTimestamp(entry.timestamp)}]</span>
              <button class="toggle-expand-btn text-xs">▼</button>
            </div>
            <div class="log-preview font-mono text-xs">${entry.message.substring(0, 100)}${entry.message.length > 100 ? '...' : ''}</div>
            <pre class="log-full mt-2 p-2 bg-base-200 rounded hidden whitespace-pre-wrap break-words font-mono text-xs">${entry.message}</pre>
          </div>
        </div>
      `;
      
      // Add event listener to toggle expand button
      requestAnimationFrame(() => {
        const toggleBtn = logElement.querySelector('.toggle-expand-btn');
        if (toggleBtn) {
          toggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const fullLog = logElement.querySelector('.log-full');
            const preview = logElement.querySelector('.log-preview');
            const btn = e.target as HTMLElement;
            
            if (fullLog && preview) {
              fullLog.classList.toggle('hidden');
              preview.classList.toggle('hidden');
              btn.textContent = btn.textContent === '▼' ? '▲' : '▼';
            }
          });
        }
      });
    } else {
      logElement.innerHTML = `
        <div class="flex items-start">
          <div class="mr-2">${getLevelIcon(entry.level)}</div>
          <div class="flex-1">
            <div class="flex justify-between">
              <span class="font-mono text-xs opacity-70">[${formatTimestamp(entry.timestamp)}]</span>
            </div>
            <div class="font-mono text-xs">${entry.message}</div>
          </div>
        </div>
      `;
    }
    
    consoleOutput.appendChild(logElement);
  });
}

/**
 * Setup console filters
 */
function setupConsoleFilters(entries: ConsoleLogEntry[]): void {
  const consoleFilter = document.getElementById('console-filter') as HTMLInputElement;
  const logLevelSelect = document.getElementById('log-level-select') as HTMLSelectElement;
  
  if (!consoleFilter || !logLevelSelect) return;
  
  // Apply filters function
  const applyFilters = () => {
    const filterText = consoleFilter.value.toLowerCase();
    const filterLevel = logLevelSelect.value;
    
    let filteredEntries = entries;
    
    // Filter by text
    if (filterText) {
      filteredEntries = filteredEntries.filter(entry => 
        entry.message.toLowerCase().includes(filterText)
      );
    }
    
    // Filter by log level
    if (filterLevel !== 'all') {
      filteredEntries = filteredEntries.filter(entry => 
        entry.level.toLowerCase() === filterLevel.toLowerCase()
      );
    }
    
    displayConsoleEntries(filteredEntries);
  };
  
  // Set up event listeners
  consoleFilter.addEventListener('input', applyFilters);
  logLevelSelect.addEventListener('change', applyFilters);
  
  // Populate log level select if needed
  if (logLevelSelect.children.length <= 1) {
    const levels = ['all', 'log', 'info', 'warn', 'error', 'debug'];
    
    levels.forEach(level => {
      const option = document.createElement('option');
      option.value = level;
      option.textContent = level.charAt(0).toUpperCase() + level.slice(1);
      logLevelSelect.appendChild(option);
    });
  }
} 