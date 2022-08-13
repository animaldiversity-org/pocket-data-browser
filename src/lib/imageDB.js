import { readable } from 'svelte/store';
import { pocketDB } from './storage';

async function loadDatabase() {
  let imageDB; let data;
  console.log("--?");
  const rows = await pocketDB.sqlitedb.where("id").equals("images").toArray();
  if (rows.length == 0) {
    console.log('-- loading database');

    fetch('/pocket-images.db').then(function (res) {
      return res.arrayBuffer();
    })
      .then(function (buffer) {
        data = new Uint8Array(buffer);
        pocketDB.sqlitedb.add({ id: 'images', data: data, lastModified: (new Date).getTime() })
        imageDB = new SQL.Database(data);
        return imageDB;
      })
  } else {
    console.log("-- using database");
    data = rows[0].data;
    imageDB = new SQL.Database(new Uint8Array(data));
    window.imageDB = imageDB;
    return imageDB;
  }
};

export const imageDB = readable(null, set => {
  console.log("-- db start");
  loadDatabase().then((value) => {
    console.log("-- db loaded", value);
    // isReady = true; 
    set(value)
  });
})

// export const isReady = readable(_isReady);
