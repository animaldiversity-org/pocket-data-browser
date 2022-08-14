import { readable } from 'svelte/store';
import { pocketDB } from './storage';

export let isReady = readable(false);
async function loadDatabase() {
  let db; let data;
  console.log("--?");
  const rows = await pocketDB.sqlitedb.where("id").equals("prototype").toArray();

  if (rows.length == 0) {
    console.log('-- loading database');

    return fetch('/pocket-data-browser.db').then(function (res) {
      return res.arrayBuffer();
    })
      .then(function (buffer) {
        data = new Uint8Array(buffer);
        pocketDB.sqlitedb.add({ id: 'prototype', data: data, lastModified: (new Date).getTime() })
        db = new SQL.Database(data);
        console.log("-- taxon load and return", db);
        return db;
      })
  } else {
    console.log("-- taxon using database");
    data = rows[0].data;
    db = new SQL.Database(new Uint8Array(data));
    window.db = db;
    console.log("-- taxon fetch and return", db);
    return db;
  }
};

export const db = readable(null, set => {
  console.log("-- taxon db start");
  loadDatabase().then((value) => { 
    console.log("-- taxon db loaded", value);
    // isReady = true; 
    set(value) 
  });
})

// export const isReady = readable(_isReady);
