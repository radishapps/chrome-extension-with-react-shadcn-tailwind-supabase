/// <reference types="chrome"/>
import { createClient } from '@supabase/supabase-js'

// Debug: Log all environment variables
console.log('Environment Variables:', {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  ALL_ENV: import.meta.env
});

declare global {
  interface Window {
    chrome: typeof chrome;
  }
}

// Helper function to check if extension context is valid
const isExtensionContextValid = () => {
  try {
    return !!(window.chrome?.runtime?.getURL(""));
  } catch (e) {
    return false;
  }
};

const storageAdapter = {
  getItem: async (key: string) => {
    try {
      if (!isExtensionContextValid()) {
        throw new Error("Extension context invalid");
      }
      const item = await window.chrome.storage.local.get(key);
      return item[key];
    } catch (err) {
      console.error('Storage get error:', err);
      return null;
    }
  },

  setItem: async (key: string, value: unknown) => {
    try {
      if (!isExtensionContextValid()) {
        throw new Error("Extension context invalid");
      }
      await window.chrome.storage.local.set({ [key]: value });
    } catch (err) {
      console.error('Storage set error:', err);
      throw err;
    }
  },

  removeItem: async (key: string) => {
    try {
      if (!isExtensionContextValid()) {
        throw new Error("Extension context invalid");
      }
      await window.chrome.storage.local.remove(key);
    } catch (err) {
      console.error('Storage remove error:', err);
      throw err;
    }
  },
};

const options = {
  auth: {
    debug: process.env.NODE_ENV === 'development',
    persistSession: true,
    storage: storageAdapter,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
};

// Initialize Supabase client with fallback values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials:', { supabaseUrl, supabaseKey });
  throw new Error('Supabase credentials are required. Check your .env file and build configuration.');
}

// Initialize Supabase client
export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  options
); 