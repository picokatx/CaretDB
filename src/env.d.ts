/// <reference types="astro/client" />

// Add declarations for global window properties here
declare global {
    interface Window {
        // Declare the toast function added by ToastContainer.astro
        showGlobalToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
    }
}

// Augment Auth.js types
declare module "@auth/core/types" {
    interface User {
      role?: string;
    }
    interface Session {
      user?: { // Ensure user object structure matches what we populate
        id?: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
        role?: string; // Add role here
      } & DefaultSession["user"]; // Include default fields if needed
    }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: string;
  }
}

// Export empty object to treat this file as a module
export {}; 