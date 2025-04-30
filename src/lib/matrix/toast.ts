/**
 * Simple toast notification utility using DaisyUI classes.
 */
export function showToast(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) {
    console.error("Toast container (#toast-container) not found.");
    return;
  }

  const toast = document.createElement('div');
  toast.className = `alert alert-${type} shadow-lg`;

  const textSpan = document.createElement('span');
  textSpan.textContent = message;
  toast.appendChild(textSpan);

  // Add toast to container
  container.appendChild(toast);

  // Auto-remove toast after a delay
  setTimeout(() => {
    toast.style.opacity = '0'; // Start fade out
    toast.style.transition = 'opacity 0.5s ease-out';
    setTimeout(() => {
      toast.remove();
    }, 500); // Remove after fade out
  }, 5000); // Start fading after 5 seconds
} 