/**
 * Player controller for replaying recording sessions
 */

import * as rrwebPlayer from 'rrweb-player';

// Define enums from rrweb
export enum EventType {
  DomContentLoaded = 0,
  Load = 1,
  FullSnapshot = 2,
  IncrementalSnapshot = 3,
  Meta = 4,
  Custom = 5,
  Plugin = 6
}

export enum IncrementalSource {
  Mutation = 0,
  MouseMove = 1,
  MouseInteraction = 2,
  Scroll = 3,
  ViewportResize = 4,
  Input = 5,
  TouchMove = 6,
  MediaInteraction = 7,
  StyleSheetRule = 8,
  CanvasMutation = 9,
  Font = 10,
  Log = 11,
  Drag = 12,
  StyleDeclaration = 13,
  Selection = 14,
  AdoptedStyleSheet = 15
}

export enum MouseInteractions {
  MouseUp = 0,
  MouseDown = 1,
  Click = 2,
  ContextMenu = 3,
  DblClick = 4,
  Focus = 5,
  Blur = 6,
  TouchStart = 7,
  TouchMove_Departed = 8,
  TouchEnd = 9,
  TouchCancel = 10
}

/**
 * Initialize and start the player with the recorded events
 */
export function initPlayer(
  events: any[], 
  targetElement: HTMLElement,
  onPlaybackFinished: () => void,
  onStatusUpdate: (message: string) => void
): any {
  if (!targetElement) {
    console.error('Player target element not found');
    return null;
  }

  if (events.length === 0) {
    onStatusUpdate('No events recorded. Start recording again.');
    targetElement.innerHTML = '<p class="text-center p-4">No events were recorded.</p>';
    return null;
  }

  try {
    // Clear previous player
    targetElement.innerHTML = '';
   
    // Create the player with DaisyUI styling
    const playerInstance = new rrwebPlayer.default({
      target: targetElement,
      props: {
        events: events,
        width: targetElement.clientWidth,
        height: targetElement.clientHeight,
        autoPlay: true,
        showController: true,
        speedOption: [1, 2, 4, 8],
        skipInactive: true,
      }
    });
    
    // Listen for player events
    playerInstance.addEventListener('end', () => {
      onStatusUpdate('Replay finished. Ready to record again.');
      onPlaybackFinished();
    });

    onStatusUpdate('Replaying...');
    return playerInstance;

  } catch(error) {
    console.error("Failed to initialize or start replay:", error);
    onStatusUpdate('Error during replay setup.');
    return null;
  }
}

/**
 * Helper function to format a timestamp
 */
export function formatTimestamp(timestamp: number, base: number = 0): string {
  const elapsed = Math.max(0, timestamp - base);
  const seconds = Math.floor(elapsed / 1000);
  const milliseconds = Math.floor((elapsed % 1000) / 10); // Get only 2 digits
  
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Helper function to get event type name
 */
export function getEventTypeName(type: number): string {
  return EventType[type] || `Unknown(${type})`;
}

/**
 * Helper function to get incremental source name
 */
export function getIncrementalSourceName(source: number): string {
  return IncrementalSource[source] || `Unknown(${source})`;
}

/**
 * Helper function to get mouse interaction name
 */
export function getMouseInteractionName(interaction: number): string {
  return MouseInteractions[interaction] || `Unknown(${interaction})`;
} 