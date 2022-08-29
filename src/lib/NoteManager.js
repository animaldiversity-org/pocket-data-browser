import { writable, get } from 'svelte/store';
import { pocketDB } from './storage';
import { liveQuery } from "dexie";
import { v4 as uuidv4 } from 'uuid';

import Cookies from 'js-cookie';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
dayjs.extend(utc);
window.dayjs = dayjs;

import { AuthManager, remoteUser, syncData } from './AuthManager';

let ix;

let fnGetFileNameFromContentDispostionHeader = function (header) {
  let contentDispostion = header.split(';');
  const fileNameToken = `filename=`;

  let fileName = 'downloaded.xslx';
  for (let thisValue of contentDispostion) {
    if (thisValue.trim().indexOf(fileNameToken) === 0) {
      fileName = decodeURIComponent(thisValue.trim().replace(fileNameToken, ''));
      fileName = fileName.substring(1, fileName.length - 1);
      break;
    }
  }

  return fileName;
};

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

    note.syncToken = get(syncData).syncToken;
    
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
      syncToken: get(syncData).syncToken 
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
    if ( ! token ) {
      console.log("-- syncNotes: no token");
      return;
    }

    console.log("-- syncNotes", syncData, get(syncData));
    let lastSynced = get(syncData).lastSynced || '1970-01-01T00:00:00+0000';

    console.log("-- syncNotes", lastSynced);

    let notes = await pocketDB.notesdb
      .where('syncToken').equals(get(syncData).syncToken)
      .filter((v) => { return v.owner != 'demo' && ( v.updatedAt >= lastSynced || v.lastSynced == '0000-00-00T00:00:00+0000' ) })
      .toArray()

    Cookies.remove('csrftoken');
    let resp = await fetch('/api/sync_notes/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Token ${token.token}`,
      },
      mode: 'cors',
      body: JSON.stringify({
        syncToken: get(syncData).syncToken,
        lastSynced: lastSynced,
        notes: notes
      })
    })
    if ( ! resp.ok ) {
      console.log("-- syncNotes", resp.ok);
      return;
    }
    
    let retval = await resp.json();

    if ( retval.updates.length == 0 ) {
      // no updates; just return
      return;
    }

    AuthManager.updateLastSynced(retval.lastSynced);
    console.log("-- setting lastsynced", get(syncData));
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

  static async downloadNotes() {
    let token = AuthManager.getUser();
    if (!token) {
      console.log("-- syncNotes: no token");
      return;
    }

    Cookies.remove('csrftoken');
    fetch('/api/download_notes/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Token ${token.token}`,
      },
      mode: 'cors',
      body: JSON.stringify({
        workspace_slug: token.currentWorkspace
      })
    })
    .then(async res => ({
      filename: fnGetFileNameFromContentDispostionHeader(res.headers.get('content-disposition')),
      blob: await res.blob()
    }))
    .then((resObj) => {
      const newBlob = new Blob([resObj.blob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const objUrl = window.URL.createObjectURL(newBlob);
      let link = document.createElement('a');
      link.href = objUrl;
      link.download = resObj.filename;
      link.click();
      setTimeout(() => { window.URL.revokeObjectURL(objUrl); }, 250);
    })
  }

  static unloadNotes() {
    let token = get(remoteUser);
    if (navigator.onLine === false) { return; }
    if ( ! token ) { return ; }
    let username = token.username;
    NoteManager.stopCrontab();
    pocketDB.notesdb.where("owner").equals(username).delete().then((deleteCount) => {
      console.log("-- unloadNotes", deleteCount);
    })

    localStorage.removeItem('syncData');
    sessionStorage.removeItem('selectedUsername');
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
    if ( navigator.onLine === false ) { return; }

    let check = await pocketDB.notesdb.where('owner').equals('demo').toArray();
    if ( check.length ) { return ; }

    Cookies.remove('csrftoken');
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