// db.js
import Dexie from 'dexie';

export const indexedDB = new Dexie('pocket-data-browser');
indexedDB.version(1).stores({
  databases: 'id, data, lastModified'
});
