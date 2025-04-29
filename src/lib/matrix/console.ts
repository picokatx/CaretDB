import { matrixGlobals as mGlob } from "./globals";
import { getLogLevelClass, getLogLevelBadge } from "./timeline";
import { formatTimestamp } from "./player";
/**
 * Console controller for displaying console logs
 */
export function updateConsoleLogsView(): void {
  const consoleTimeline = document.getElementById('console-timeline') as HTMLDivElement;
  if (!consoleTimeline) return;

  // Filter console logs based on current settings
  const filteredLogs = mGlob.consoleLogs.filter((log) => {
    // Filter by log level if needed
    if (mGlob.currentLogLevel !== "any" && log.level !== mGlob.currentLogLevel) {
      return false;
    }

    // Filter by search text if needed
    if (mGlob.consoleSearchText) {
      const logContent = log.args.join(" ").toLowerCase();
      return logContent.includes(mGlob.consoleSearchText);
    }

    return true;
  });

  // Clear previous content
  consoleTimeline.innerHTML = "";

  if (filteredLogs.length === 0) {
    consoleTimeline.innerHTML =
      '<div class="p-4 text-center text-base-content/60">No matching console logs found</div>';
    return;
  }

  // Use the first event overall (not just console events) as the base timestamp
  const baseTimestamp =
    mGlob.rrwebEvents.length > 0
      ? mGlob.rrwebEvents[0].timestamp
      : mGlob.consoleLogs.length > 0
        ? mGlob.consoleLogs[0].timestamp
        : 0;

  // Create console log items
  filteredLogs.forEach((log) => {
    const logItem = document.createElement("div");

    // Set base class and add level-specific class
    logItem.className =
      "console-log-item border-b border-base-100 p-2 hover:bg-base-200";

    // Get styling based on log level
    const levelClass = getLogLevelClass(log.level || "log");

    // Format the log content
    const logContent = log.args.join(" ");
    const isLongMessage = logContent.length > 100;

    // Format timestamp
    const timestamp = formatTimestamp(log.timestamp, baseTimestamp);
    const timestampMillis = log.timestamp; // Keep original milliseconds for player jump
    const elapsedMillis = Math.max(0, log.timestamp - baseTimestamp); // Calculate elapsed ms

    // Add level badge
    const levelBadge = getLogLevelBadge(log.level || "log");

    // Add warning icon for errors
    let icon = "";
    if (log.level === "error" || log.level === "warn") {
      icon = `<span class="${levelClass} mr-2">⚠</span>`;
    }

    // Create the log item content with collapsible functionality for long messages
    if (isLongMessage) {
      logItem.innerHTML = `
                <div class="flex justify-between items-start">
                    <div class="log-content ${levelClass} flex-1 cursor-pointer" data-expanded="false">
                        <div class="flex items-start">
                            ${levelBadge}
                            ${icon}
                            <div class="log-message-container">
                                <div class="log-message-preview">${escapeHtml(logContent.substring(0, 100))}... <span class="text-primary">[Click to expand]</span></div>
                                <div class="log-message-full hidden">${escapeHtml(logContent)}</div>
                            </div>
                        </div>
                    </div>
                    <div class="log-timestamp text-xs opacity-70 ml-4 shrink-0 mt-1 flex items-center">
                        <button class="btn btn-xs btn-ghost btn-circle mr-1 jump-to-log-btn" data-timestamp="${elapsedMillis}" title="Jump to this time">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </button>
                        ${timestamp}
                    </div>
                </div>
            `;

      // Add click handler to expand/collapse with proper TypeScript typing
      const logContentEl = logItem.querySelector(".log-content");
      logContentEl?.addEventListener("click", function (this: HTMLElement) {
        const expanded = this.getAttribute("data-expanded") === "true";
        const preview = this.querySelector(".log-message-preview");
        const full = this.querySelector(".log-message-full");

        if (expanded) {
          // Collapse
          preview?.classList.remove("hidden");
          full?.classList.add("hidden");
          this.setAttribute("data-expanded", "false");
        } else {
          // Expand
          preview?.classList.add("hidden");
          full?.classList.remove("hidden");
          this.setAttribute("data-expanded", "true");
        }
      });
    } else {
      // For short messages, no need for expand/collapse
      logItem.innerHTML = `
                <div class="flex justify-between items-center">
                    <div class="log-content ${levelClass}">
                        ${levelBadge}${icon}${escapeHtml(logContent)}
                    </div>
                    <div class="log-timestamp text-xs opacity-70 ml-4 shrink-0 flex items-center">
                        <button class="btn btn-xs btn-ghost btn-circle mr-1 jump-to-log-btn" data-timestamp="${elapsedMillis}" title="Jump to this time">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </button>
                        ${timestamp}
                    </div>
                </div>
            `;
    }

    // Add click handler for the jump button
    const jumpBtn = logItem.querySelector('.jump-to-log-btn');
    jumpBtn?.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent triggering the log item's own click listener
      const timestampToJump = parseInt((e.currentTarget as HTMLElement).dataset.timestamp || '0');
      if (mGlob.playerInstance && typeof mGlob.playerInstance.goto === 'function' && timestampToJump > 0) {
        console.log("Jumping player to timestamp:", timestampToJump);
        mGlob.playerInstance.goto(timestampToJump);
      } else {
        console.warn("Could not jump player. Instance:", mGlob.playerInstance, "Timestamp:", timestampToJump);
      }
    });

    consoleTimeline.appendChild(logItem);
  });
}
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
// function formatTimestamp(timestamp: number): string {
//   const date = new Date(timestamp);
//   const hours = date.getHours().toString().padStart(2, '0');
//   const minutes = date.getMinutes().toString().padStart(2, '0');
//   const seconds = date.getSeconds().toString().padStart(2, '0');
//   const milliseconds = date.getMilliseconds().toString().padStart(3, '0');

//   return `${hours}:${minutes}:${seconds}.${milliseconds}`;
// }

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

export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (!bytes || isNaN(bytes)) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(Math.max(bytes, 1)) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(1) + " " + sizes[i];
}

export function getFullPath(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname + urlObj.search + urlObj.hash;
  } catch (e) {
    return url;
  }
}