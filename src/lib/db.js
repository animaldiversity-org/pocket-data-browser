import { readable } from 'svelte/store';
import { indexedDB } from './indexedDB';

export let isReady = readable(false);
async function loadDatabase() {
  let db; let data;
  console.log("--?");
  const rows = await indexedDB.databases.where("id").equals("prototype").toArray();
  if (rows.length == 0) {
    console.log('-- loading database');

    fetch('/pocket-data-browser.db').then(function (res) {
      return res.arrayBuffer();
    })
      .then(function (buffer) {
        data = new Uint8Array(buffer);
        indexedDB.databases.add({ id: 'prototype', data: data, lastModified: (new Date).getTime() })
        db = new SQL.Database(data);
        return db;
      })
  } else {
    console.log("-- using database");
    data = rows[0].data;
    db = new SQL.Database(new Uint8Array(data));
    window.db = db;
    return db;
  }
};

export const db = readable(null, set => {
  console.log("-- db start");
  loadDatabase().then((value) => { 
    console.log("-- db loaded", value);
    // isReady = true; 
    set(value) 
  });
})

// export const isReady = readable(_isReady);
