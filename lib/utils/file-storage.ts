/**
 * File-system based storage adapter for Zustand persist middleware.
 * Uses expo-file-system (v55 class-based API) for persistent JSON storage.
 */

import { File, Paths, Directory } from 'expo-file-system';
import { StateStorage } from 'zustand/middleware';

const STORAGE_DIR = new Directory(Paths.document, 'zustand');

function keyToFile(key: string): File {
  const safeName = key.replace(/[^a-zA-Z0-9_-]/g, '_') + '.json';
  return new File(STORAGE_DIR, safeName);
}

export const fileStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const file = keyToFile(name);
      if (!file.exists) return null;
      return await file.text();
    } catch {
      return null;
    }
  },

  setItem: async (name: string, value: string): Promise<void> => {
    try {
      if (!STORAGE_DIR.exists) {
        STORAGE_DIR.create();
      }
      const file = keyToFile(name);
      file.write(value);
    } catch (err) {
      console.warn('fileStorage setItem error:', err);
    }
  },

  removeItem: async (name: string): Promise<void> => {
    try {
      const file = keyToFile(name);
      if (file.exists) {
        file.delete();
      }
    } catch {
      // ignore
    }
  },
};
