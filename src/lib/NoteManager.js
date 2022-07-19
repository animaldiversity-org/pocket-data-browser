import { indexedDB } from './indexedDB';
import { liveQuery } from "dexie";
import { v4 as uuidv4 } from 'uuid';

async function updateNote(note) {
  let status;
  try {
    note.uuid = uuidv4();
    const uuid = await indexedDB.notesdb.update(note);
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
    const uuid = await indexedDB.notesdb.add(note);
    status = `Created ${uuid}`;
  } catch (error) {
    status = `Failed to add ${error}`;
  }
  return status;
}

class NoteManager {

  static async saveNote(note) {
    let method;
    if ( note.uuid ) {
      method = 'update';
    } else {
      method = 'add';
      note.uuid = uuidv4();
    }
    
    let response;
    let status;
    try {
      if ( method == 'add' ) {
        note.uuid = uuidv4();
        response = await indexedDB.notesdb.add(note)
      } else {
        response = await indexedDB.notesdb.update(note.uuid, note);
      }
      status = [ true, response ];
    } catch (error) {
      status = [ false, error ];
    }
    return status;
  }

  static async getNote(uuid) {
    let response = await indexedDB.notesdb.get(uuid);
    return response;
  }

  static async deleteNote(uuid) {
    // let note = await indexedDb.notesdb.get(uuid);
    // note.deleted = (new Date).getTime();
    await indexedDB.notesdb.update(uuid, { deleted: (new Date).getTime() });
  }

  static uploadImage(file, uuid) {

  }

  static deleteImage() {

  }

}


window.NoteManager = NoteManager;
export default NoteManager;