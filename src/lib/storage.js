// db.js
import Dexie from 'dexie';

export const pocketDB = new Dexie('pocket-data-browser');
pocketDB.version(2).stores({
  sqlitedb: 'id, lastModified',
  notesdb: 'id, owner, createdAt, syncToken, lastSynced, deletedAt, activity, *observers'
});

window.pocketDB = pocketDB;