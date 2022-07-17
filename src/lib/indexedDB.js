// db.js
import Dexie from 'dexie';

export const indexedDB = new Dexie('pocket-data-browser');
indexedDB.version(2).stores({
  sqlitedb: 'id, lastModified',
  notesdb: 'uuid, datetime, lastSynced, deleted, activity, *observers',
  imagesdb: 'uuid, lastModified, deleted, lastSynced'
});
