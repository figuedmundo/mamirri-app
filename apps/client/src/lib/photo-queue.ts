import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

interface PhotoQueueDB extends DBSchema {
  'pending-photos': {
    key: string;
    value: {
      id: string;
      sessionId: string;
      blob: Blob;
      caption?: string;
      timestamp: number;
    };
    indexes: { 'by-session': string };
  };
}

let dbPromise: Promise<IDBPDatabase<PhotoQueueDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<PhotoQueueDB>('photo-queue', 1, {
      upgrade(db) {
        const store = db.createObjectStore('pending-photos', { keyPath: 'id' });
        store.createIndex('by-session', 'sessionId');
      },
    });
  }
  return dbPromise;
}

export interface PendingPhoto {
  id: string;
  sessionId: string;
  blob: Blob;
  caption?: string;
  timestamp: number;
}

export const photoQueue = {
  async add(
    sessionId: string,
    blob: Blob,
    caption?: string,
  ): Promise<PendingPhoto> {
    const db = await getDB();
    const photo: PendingPhoto = {
      id: crypto.randomUUID(),
      sessionId,
      blob,
      caption,
      timestamp: Date.now(),
    };
    await db.add('pending-photos', photo);
    return photo;
  },

  async remove(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('pending-photos', id);
  },

  async getAll(): Promise<PendingPhoto[]> {
    const db = await getDB();
    return db.getAll('pending-photos');
  },

  async getBySession(sessionId: string): Promise<PendingPhoto[]> {
    const db = await getDB();
    return db.getAllFromIndex('pending-photos', 'by-session', sessionId);
  },

  async clear(): Promise<void> {
    const db = await getDB();
    await db.clear('pending-photos');
  },
};

export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

export function onOnline(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('online', callback);
  return () => window.removeEventListener('online', callback);
}
