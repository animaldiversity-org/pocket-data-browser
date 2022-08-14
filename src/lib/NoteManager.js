import { pocketDB } from './storage';
import { liveQuery } from "dexie";
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
dayjs.extend(utc.default);
window.dayjs = dayjs;

import AuthManager from './AuthManager';

let ix;

const syncData = JSON.parse(localStorage.getItem('syncData') || '{}');
if (syncData.syncToken === undefined) {
  syncData.syncToken = (1000 * Math.random()).toString();
  localStorage.setItem('syncData', JSON.stringify(syncData));
}

async function updateNote(note) {
  let status;
  try {
    note.uuid = uuidv4();
    const uuid = await pocketDB.notesdb.update(note);
    status = `Created ${uuid}`;
  } catch (error) {
    status = `Failed to add ${error}`;
  }
  return status;
}

async function createNote(note) {
  let status;
  try {
    note.uuid = uuidv4();
    const uuid = await pocketDB.notesdb.add(note);
    status = `Created ${uuid}`;
  } catch (error) {
    status = `Failed to add ${error}`;
  }
  return status;
}

class NoteManager {

  static async saveNote(note) {
    let method;

    if ( note.id ) {
      method = 'update';
    } else {
      method = 'add';
      note.id = uuidv4();
      note.owner = AuthManager.getUser().username;
    }

    note.syncToken = syncData.syncToken;
    
    let response;
    let status;
    try {
      if ( method == 'add' ) {
        note.id = uuidv4();
        note.updatedAt = note.createdAt;
        response = await pocketDB.notesdb.add(note)
      } else {
        note.updatedAt = dayjs().utc().format('YYYY-MM-DDTHH:mm:ssZZ');
        response = await pocketDB.notesdb.update(note.id, note);
      }
      status = [ true, response ];
    } catch (error) {
      status = [ false, error ];
    }
    return status;
  }

  static async getNote(uuid) {
    let response = await pocketDB.notesdb.get(uuid);
    if (typeof(response.content) == "string") {
      response.content = JSON.parse(response.content);
    }
    return response;
  }

  static async deleteNote(uuid) {
    // let note = await pocketDB.notesdb.get(uuid);
    // note.deleted = (new Date).getTime();
    await pocketDB.notesdb.update(uuid, { 
      deletedAt: dayjs().utc().format('YYYY-MM-DDTHH:mm:ssZZ'),
      updatedAt: dayjs().utc().format('YYYY-MM-DDTHH:mm:ssZZ'),
      syncToken: syncData.syncToken 
    });
  }

  static uploadImage(file, uuid) {

  }

  static deleteImage() {

  }

  static async syncNotes() {

    if ( navigator.onLine == false || window.isReadOnly === true ) {
      console.log("-- syncNotes: offline");
      return;
    }

    let token = AuthManager.getUser();

    let lastSynced = syncData.lastSynced || '1970-01-01T00:00:00+0000';

    console.log("-- syncNotes", lastSynced);

    let notes = await pocketDB.notesdb
      .where('syncToken').equals(syncData.syncToken)
      .filter((v) => { return v.owner != 'demo' && ( v.updatedAt >= lastSynced || v.lastSynced == '0000-00-00T00:00:00+0000' ) })
      .toArray()
    let resp = await fetch('/api/sync_notes/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Token ${token.token}`,
      },
      mode: 'cors',
      body: JSON.stringify({
        syncToken: syncData.syncToken,
        lastSynced: lastSynced,
        notes: notes
      })
    })
    let retval = await resp.json();

    if ( retval.updates.length == 0 ) {
      // no updates; just return
      return;
    }

    syncData.lastSynced = retval.lastSynced;
    localStorage.setItem('syncData', JSON.stringify(syncData));
    retval['updates'].forEach(async (update) => {
      let check = await pocketDB.notesdb.get(update.id);
      if ( check ) {
        // update this note
        console.log("-- updating", update.id, update.data.syncedAt, update.data.deletedAt);
        await pocketDB.notesdb.update(update.id, update.data)
      } else {
        await pocketDB.notesdb.add(update.data)
      }
    })
    
  }

  static initializeCrontab() {
    if (ix) { console.log("-- NoteManager: unloading interval"); clearInterval(ix); }
    ix = setInterval(() => {
      if (window.syncPaused) { return; }
      NoteManager.syncNotes();
    }, 1000 * 60 * 1);
  }

  static stopCrontab() {
    if (ix) { console.log("-- NoteManager: stopping interval"); clearInterval(ix); }
  }

  static async loadExampleData() {
    let check = await pocketDB.notesdb.where('owner').equals('demo').toArray();
    if ( check.length ) { return ; }

    let request = await fetch("/example_data.json");
    let data = await request.json();
    data.forEach((datum) => {
      pocketDB.notesdb.add(datum);
    })
    console.log("-- example data loaded");
  }

}

NoteManager.loadExampleData();

window.NoteManager = NoteManager;
export default NoteManager;