/// <reference types="astro/client" />

// Add declarations for global window properties here
declare global {
    interface Window {
        // Declare the toast function added by ToastContainer.astro
        showGlobalToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
    }
}

// Export empty object to treat this file as a module
export {}; 