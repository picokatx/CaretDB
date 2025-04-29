/**
 * Timeline controller for displaying and managing the event timeline
 */

import { EventType, IncrementalSource, formatTimestamp, getEventTypeName, getIncrementalSourceName, getMouseInteractionName } from './player';
import { matrixGlobals as mGlob } from "./globals";
import { updateStatus } from "./player";
import { updateNetworkRequestsView } from './network';
import { updateConsoleLogsView } from './console';
let selectedEventIndex = -1;

/**
 * Initialize timeline controls and views
 */
export function initTimelineControls() {
  const timelineViewBtn = document.getElementById('timeline-view-btn');
  const rawViewBtn = document.getElementById('raw-view-btn');
  const consoleViewBtn = document.getElementById('console-view-btn');
  const networkViewBtn = document.getElementById('network-view-btn');
  const jsonCopyBtn = document.getElementById('json-copy-btn');
  const networkSearch = document.getElementById(
    "network-search"
  ) as HTMLInputElement;
  const networkSearchBtn = document.getElementById("network-search-btn");
  const timelineView = document.getElementById('timeline-view') as HTMLDivElement;
  const rawJsonView = document.getElementById('raw-json-view') as HTMLDivElement;
  const consoleLogsView = document.getElementById('console-logs-view') as HTMLDivElement;
  const networkRequestsView = document.getElementById('network-requests-view') as HTMLDivElement;
  const consoleSearch = document.getElementById(
    "console-search"
  ) as HTMLInputElement;
  const consoleSearchBtn = document.getElementById("console-search-btn");
  const jumpToCurrentBtn = document.getElementById(
    "jump-to-current-timestamp"
  );
  if (!timelineViewBtn || !rawViewBtn || !consoleViewBtn || !networkViewBtn) {
    console.error('Timeline control elements not found');
    return;
  }

  networkSearchBtn?.addEventListener("click", () => {
    if (networkSearch) {
      mGlob.networkSearchText = networkSearch.value.trim().toLowerCase();
      updateNetworkRequestsView();
    }
  });

  networkSearch?.addEventListener("keyup", (e) => {
    if (e.key === "Enter" && networkSearch) {
      mGlob.networkSearchText = networkSearch.value.trim().toLowerCase();
      updateNetworkRequestsView();
    }
  });

  // Tab switching (update to include network tab and better highlighting)
  timelineViewBtn?.addEventListener("click", () => {
    mGlob.currentView = "timeline";
    updateTabHighlighting(timelineViewBtn);
    timelineView!.classList.remove("hidden");
    rawJsonView!.classList.add("hidden");
    consoleLogsView!.classList.add("hidden");
    networkRequestsView!.classList.add("hidden");
  });

  rawViewBtn?.addEventListener("click", () => {
    mGlob.currentView = "raw";
    updateTabHighlighting(rawViewBtn);
    rawJsonView!.classList.remove("hidden");
    timelineView!.classList.add("hidden");
    consoleLogsView!.classList.add("hidden");
    networkRequestsView!.classList.add("hidden");
  });

  consoleViewBtn?.addEventListener("click", () => {
    mGlob.currentView = "console";
    updateTabHighlighting(consoleViewBtn);
    consoleLogsView!.classList.remove("hidden");
    timelineView!.classList.add("hidden");
    rawJsonView!.classList.add("hidden");
    networkRequestsView!.classList.add("hidden");
    updateConsoleLogsView();
  });

  networkViewBtn?.addEventListener("click", () => {
    mGlob.currentView = "network";
    updateTabHighlighting(networkViewBtn);
    networkRequestsView!.classList.remove("hidden");
    timelineView!.classList.add("hidden");
    rawJsonView!.classList.add("hidden");
    consoleLogsView!.classList.add("hidden");
    updateNetworkRequestsView();
  });
  // Filter by log level - enhanced to update the display text
  document.querySelectorAll(".log-level-filter").forEach((levelBtn) => {
    levelBtn.addEventListener("click", (e) => {
      e.preventDefault();

      // Get the selected level
      const target = e.currentTarget as HTMLElement;
      const level = target.getAttribute("data-level") || "any";

      // Update the filter
      mGlob.currentLogLevel = level;

      // Update active class
      document.querySelectorAll(".log-level-filter").forEach((btn) => {
        btn.classList.remove("active");
      });
      target.classList.add("active");

      // Update the dropdown label
      const levelDisplay = document.getElementById("log-level-display");
      if (levelDisplay) {
        const displayText = level === "any" ? "Any" : formatLogLevel(level);
        levelDisplay.textContent = `Log Level: ${displayText}`;
      }

      // Update the view
      updateConsoleLogsView();
    });
  });
  // Search functionality
  consoleSearch?.addEventListener("input", (e) => {
    mGlob.consoleSearchText = (e.target as HTMLInputElement).value.toLowerCase();
    updateConsoleLogsView();
  });

  consoleSearchBtn?.addEventListener("click", () => {
    updateConsoleLogsView();
  });

  // Jump to current timestamp
  jumpToCurrentBtn?.addEventListener("click", () => {
    if (mGlob.playerInstance && typeof mGlob.playerInstance.goto === "function") {
      // Get the current player position
      const currentTime = mGlob.playerInstance.getCurrentTime
        ? mGlob.playerInstance.getCurrentTime()
        : mGlob.playerInstance.replayer
          ? mGlob.playerInstance.replayer.getCurrentTime()
          : 0;

      mGlob.playerInstance.goto(currentTime);
    }
  });
  // JSON copy button click
  jsonCopyBtn?.addEventListener('click', () => {
    try {
      const jsonContent = document.getElementById('json-content');
      let textToCopy = "";
      if (mGlob.currentView === "raw") {
        textToCopy = jsonContent!.textContent || "";
      } else if (mGlob.selectedEventIndex >= 0) {
        // Copy only the selected event JSON if in timeline view
        textToCopy = JSON.stringify(mGlob.rrwebEvents[mGlob.selectedEventIndex], null, 2);
      } else if (mGlob.rrwebEvents.length > 0) {
        // If no event selected but events exist, copy all
        textToCopy = JSON.stringify(mGlob.rrwebEvents, null, 2);
      }
      navigator.clipboard.writeText(textToCopy);
      updateStatus("JSON copied to clipboard.");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      updateStatus("Error copying to clipboard.");
    }
  });
}

/**
 * Helper function to update tab highlighting
 */
export function updateTabHighlighting(activeTab: HTMLElement): void {
  // Remove highlighting from all tabs
  const timelineViewBtn = document.getElementById('timeline-view-btn');
  const consoleViewBtn = document.getElementById('console-view-btn');
  const networkViewBtn = document.getElementById('network-view-btn');
  const rawViewBtn = document.getElementById('raw-view-btn');

  [timelineViewBtn, consoleViewBtn, networkViewBtn, rawViewBtn].forEach(tab => {
    if (tab) {
      tab.classList.remove('tab-active', 'bg-primary', 'text-primary-content');
    }
  });

  // Add highlighting to active tab
  activeTab.classList.add('tab-active', 'bg-primary', 'text-primary-content');
}

/**
 * Update the timeline view based on events
 */
export function generateTimelineView(events: any[]): void {
  const eventTimeline = document.getElementById('event-timeline');

  if (!eventTimeline) return;

  eventTimeline.innerHTML = '';

  if (events.length === 0) {
    eventTimeline.innerHTML = '<div class="p-4 text-center">No events recorded</div>';
    return;
  }

  // Use the first event as the base timestamp
  const baseTimestamp = events[0].timestamp;

  events.forEach((event, index) => {
    const eventItem = document.createElement('div');
    eventItem.className = 'event-item mb-2 p-2 bg-base-200 rounded-lg cursor-pointer hover:bg-base-300 border border-base-300 transition-all';

    // Add click handler to select this event
    eventItem.addEventListener('click', () => {
      selectEvent(index, events);
    });

    // Get the event class based on type
    const eventClass = getEventTypeClass(event.type, event.data);
    const eventIcon = getEventTypeIcon(event.type, event.data);

    // Create a brief version of the event details
    const shortDetails = createCompactEventDetails(event);
    const elapsedMillis = Math.max(0, event.timestamp - baseTimestamp);

    // Create the event content
    eventItem.innerHTML = `
      <div class="flex justify-between items-center">
        <div class="${eventClass} font-semibold flex-grow">
          ${eventIcon} 
          ${getEventTypeName(event.type)}
          ${event.type === EventType.IncrementalSnapshot ?
        `(${getIncrementalSourceName(event.data.source)})` : ''}
        </div>
        <div class="text-xs opacity-70 ml-2 shrink-0 flex items-center">
          <button class="btn btn-xs btn-ghost btn-circle mr-1 jump-to-event-btn" data-timestamp="${elapsedMillis}" title="Jump to this time">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </button>
          ${formatTimestamp(event.timestamp, baseTimestamp)}
        </div>
      </div>
      <div class="ml-5 text-sm mt-1">${shortDetails}</div>
    `;

    // Add click handler for the jump button
    const jumpBtn = eventItem.querySelector('.jump-to-event-btn');
    jumpBtn?.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent triggering selectEvent
      const timestampToJump = parseInt((e.currentTarget as HTMLElement).dataset.timestamp || '0');
      if (mGlob.playerInstance && typeof mGlob.playerInstance.goto === 'function' && timestampToJump >= 0) {
        console.log("Jumping player to timestamp:", timestampToJump);
        mGlob.playerInstance.goto(timestampToJump);
      } else {
        console.warn("Could not jump player. Instance:", mGlob.playerInstance, "Timestamp:", timestampToJump);
      }
    });

    eventTimeline.appendChild(eventItem);
  });

  // Select the first event by default
  if (events.length > 0) {
    selectEvent(0, events);
  }
}

/**
 * Display selected event JSON and update preview
 */
export function selectEvent(index: number, events: any[]): void {
  const eventTimeline = document.getElementById('event-timeline');
  const timelinePreview = document.getElementById('timeline-preview');

  if (!eventTimeline || !timelinePreview) return;

  if (index >= 0 && index < events.length) {
    selectedEventIndex = index;

    // Highlight all event elements
    const eventElements = eventTimeline.querySelectorAll('.event-item');
    eventElements.forEach((el, i) => {
      if (i === index) {
        el.classList.add('border-primary', 'border-2');
      } else {
        el.classList.remove('border-primary', 'border-2');
      }
    });

    // Update preview with event information
    const event = events[index];

    // Create preview content
    let previewContent = `
      <div class="bg-base-200 p-4 rounded-lg">
        <h4 class="font-bold mb-2">${getEventTypeName(event.type)} at ${formatTimestamp(event.timestamp)}</h4>
        <p class="text-sm mb-4">${createEventDetails(event)}</p>
        <pre class="bg-base-300 p-3 rounded text-xs overflow-auto max-h-[200px]">${JSON.stringify(event, null, 2)}</pre>
      </div>
    `;

    timelinePreview.innerHTML = previewContent;
  }
}

/**
 * Update the raw JSON view
 */
export function updateRawJsonView(events: any[]): void {
  const jsonContent = document.getElementById('json-content') as HTMLPreElement;
  const placeholder = document.getElementById('json-placeholder') as HTMLDivElement;

  if (!jsonContent || !placeholder) {
    console.error("Raw JSON view elements not found");
    return;
  }

  if (events && events.length > 0) {
    // Format the JSON for raw view
    const formattedJson = JSON.stringify(events, null, 2);
    jsonContent.textContent = formattedJson; // This clears the placeholder
    placeholder.style.display = 'none'; // Explicitly hide just in case
  } else {
    // No events, show placeholder and clear any previous JSON
    jsonContent.textContent = ''; // Clear previous content
    placeholder.style.display = 'block'; // Ensure placeholder is visible
    jsonContent.appendChild(placeholder); // Re-append if textContent cleared it
  }
}

/**
 * Create parsed event details
 */
export function createEventDetails(event: any): string {
  let details = '';

  switch (event.type) {
    case EventType.Meta:
      details = `URL: ${event.data.href}, Viewport: ${event.data.width}x${event.data.height}`;
      break;

    case EventType.FullSnapshot:
      details = 'Full DOM snapshot captured';
      break;

    case EventType.IncrementalSnapshot:
      switch (event.data.source) {
        case IncrementalSource.MouseMove:
          details = `Mouse moved (${event.data.positions.length} positions)`;
          break;

        case IncrementalSource.MouseInteraction:
          details = `${getMouseInteractionName(event.data.type)} at (${event.data.x}, ${event.data.y})`;
          break;

        case IncrementalSource.Scroll:
          details = `Scroll to (${event.data.x}, ${event.data.y})`;
          break;

        case IncrementalSource.Input:
          details = `Input value: "${event.data.text?.substring(0, 50)}${event.data.text?.length > 50 ? '...' : ''}"`;
          break;

        case IncrementalSource.Mutation:
          const adds = event.data.adds?.length || 0;
          const removes = event.data.removes?.length || 0;
          const texts = event.data.texts?.length || 0;
          const attributes = event.data.attributes?.length || 0;
          details = `DOM mutations: ${adds} additions, ${removes} removals, ${texts} text changes, ${attributes} attribute changes`;
          break;
        case IncrementalSource.ViewportResize:
          details = `Viewport resized to ${event.data.width}x${event.data.height}`;
          break;
        case IncrementalSource.Log:
          details = `Console ${event.data.level}: ${event.data.payload?.map((p: any) => typeof p === 'object' ? JSON.stringify(p) : p).join(' ')}`;
          break;
        default:
          details = `${getIncrementalSourceName(event.data.source)} event`;
      }
      break;

    default:
      details = 'See raw data for details';
  }

  return details;
}

/**
 * Create compact event details
 */
export function createCompactEventDetails(event: any): string {
  let details = '';

  switch (event.type) {
    case EventType.Meta:
      details = `${event.data.width}x${event.data.height}`;
      break;

    case EventType.FullSnapshot:
      details = 'Full DOM snapshot';
      break;

    case EventType.IncrementalSnapshot:
      switch (event.data.source) {
        case IncrementalSource.MouseMove:
          details = `${event.data.positions.length} positions`;
          break;

        case IncrementalSource.MouseInteraction:
          details = `${getMouseInteractionName(event.data.type)}`;
          break;

        case IncrementalSource.Input:
          const textValue = event.data.text || '';
          const truncated = textValue.length > 20 ? textValue.substring(0, 20) + '...' : textValue;
          details = `"${truncated}"`;
          break;

        case IncrementalSource.Mutation:
          const adds = event.data.adds?.length || 0;
          const removes = event.data.removes?.length || 0;
          if (adds && removes) {
            details = `${adds} added, ${removes} removed`;
          } else if (adds) {
            details = `${adds} added`;
          } else if (removes) {
            details = `${removes} removed`;
          } else {
            details = 'DOM changes';
          }
          break;

        case IncrementalSource.Log:
          const logContent = event.data.payload?.join ?
            event.data.payload.join(' ').substring(0, 20) :
            String(event.data.payload || '').substring(0, 20);
          details = `${event.data.level}: ${logContent}${logContent.length > 20 ? '...' : ''}`;
          break;

        default:
          details = getIncrementalSourceName(event.data.source);
      }
      break;

    default:
      details = getEventTypeName(event.type);
  }

  return details;
}

/**
 * Get CSS class for event type
 */
function getEventTypeClass(type: number, data: any): string {
  if (type === EventType.IncrementalSnapshot) {
    if (data.source === IncrementalSource.MouseInteraction) {
      return 'text-info';
    } else if (data.source === IncrementalSource.Input) {
      return 'text-warning';
    } else if (data.source === IncrementalSource.Mutation) {
      return 'text-success';
    } else if (data.source === IncrementalSource.Log) {
      return getLogLevelClass(data.level || 'log');
    }
  } else if (type === EventType.FullSnapshot) {
    return 'text-primary';
  } else if (type === EventType.Meta) {
    return 'text-secondary';
  }
  return 'text-base-content';
}

/**
 * Get icon for event type
 */
function getEventTypeIcon(type: number, data: any): string {
  if (type === EventType.IncrementalSnapshot) {
    switch (data.source) {
      case IncrementalSource.MouseInteraction:
        return '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>';
      case IncrementalSource.Input:
        return '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>';
      case IncrementalSource.Mutation:
        return '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>';
      case IncrementalSource.Log:
        if (data.level === 'error') {
          return '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>';
        } else if (data.level === 'warn') {
          return '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>';
        } else {
          return '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>';
        }
      default:
        return '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>';
    }
  } else if (type === EventType.FullSnapshot) {
    return '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>';
  } else if (type === EventType.Meta) {
    return '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>';
  }
  return '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>';
}

/**
 * Get CSS class for console log level
 */
export function getLogLevelClass(level: string): string {
  switch (level) {
    case 'error': return 'text-error';
    case 'warn': return 'text-warning';
    case 'info': return 'text-info';
    default: return 'text-base-content';
  }
}

export function getLogLevelBadge(level: string): string {
  let badgeClass = "badge badge-sm ";
  switch (level) {
    case "error":
      badgeClass += "badge-error";
      break;
    case "warn":
      badgeClass += "badge-warning";
      break;
    case "info":
      badgeClass += "badge-info";
      break;
    case "debug":
      badgeClass += "badge-ghost";
      break;
    default:
      badgeClass += "badge-neutral";
  }

  return `<span class="${badgeClass} mr-2">${formatLogLevel(level)}</span>`;
}

export function formatLogLevel(level: string): string {
  const levelMap: { [key: string]: string } = {
    log: "LOG",
    info: "INFO",
    warn: "WARN",
    error: "ERROR",
    debug: "DEBUG",
  };
  return levelMap[level] || level.toUpperCase();
}