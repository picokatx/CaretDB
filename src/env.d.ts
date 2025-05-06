/// <reference types="astro/client" />

// Add declarations for global window properties here
declare global {
    interface Window {
        // Declare the toast function added by ToastContainer.astro
        showGlobalToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
    }
}

declare namespace App {
    interface Locals {
      session: import("@auth/core/types").Session | null;
    }
  }

// Extend Auth.js types
declare module "@auth/core/types" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
      user: {
        /** The user's role. */
        role?: string;
         /** The user's unique ID (often email or DB id) */
         id?: string;
      } & DefaultSession["user"];
      /** The provider used for login */
      provider?: string;
    }
  
    interface User {
      /** The user's role. */
      role?: string;
    }
}

// Extend JWT type
declare module "@auth/core/jwt" {
    /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
    interface JWT {
      /** User role */
      role?: string;
      /** Provider */
      provider?: string;
    }
}

// Export empty object to treat this file as a module
export {}; 