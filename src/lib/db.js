import { readable, writable } from 'svelte/store';
import { pocketDB } from './storage';

class ProgressReportFetcher {
  constructor(onProgress = function () { }) {
    this.onProgress = onProgress;
  }

  // mimic native fetch() instantiation and return Promise
  fetch(input, init = {}) {
    const request = (input instanceof Request) ? input : new Request(input)
    this._cancelRequested = false;

    return fetch(request, init).then(response => {
      if (!response.body) {
        throw Error('ReadableStream is not yet supported in this browser.  <a href="https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream">More Info</a>')
      }

      // this occurs if cancel() was called before server responded (before fetch() Promise resolved)
      if (this._cancelRequested) {
        response.body.getReader().cancel();
        return Promise.reject('cancel requested before server responded.');
      }

      if (!response.ok) {
        // HTTP error server response
        throw Error(`Server responded ${response.status} ${response.statusText}`);
      }


      // to access headers, server must send CORS header "Access-Control-Expose-Headers: content-encoding, content-length x-file-size"
      // server must send custom x-file-size header if gzip or other content-encoding is used
      const contentEncoding = response.headers.get('content-encoding');
      const contentLength = response.headers.get(contentEncoding ? 'x-file-size' : 'content-length');
      if (contentLength === null) {
        // don't evaluate download progress if we can't compare against a total size
        throw Error('Response size header unavailable');
      }

      const total = parseInt(contentLength, 10);
      let loaded = 0;

      this._reader = response.body.getReader()

      const me = this;

      let progressResponse = new Response(
        new ReadableStream({
          start(controller) {
            if (me.cancelRequested) {
              console.log('canceling read')
              controller.close();
              return;
            }

            read();
            function read() {
              me._reader.read().then(({ done, value }) => {
                if (done) {
                  // ensure onProgress called when content-length=0
                  if (total === 0) {
                    me.onProgress.call(me, { loaded, total });
                  }

                  controller.close();
                  return;
                }

                loaded += value.byteLength;
                me.onProgress.call(me, { loaded, total });
                controller.enqueue(value);
                read();
              }).catch(error => {
                console.error(error);
                controller.error(error)
              });
            }
          }
        })
      )

      for (var pair of response.headers.entries()) {
        progressResponse.headers.append(...pair);
      }

      return progressResponse;

    });
  }

  cancel() {
    console.log('download cancel requested.')
    this._cancelRequested = true;
    if (this._reader) {
      console.log('cancelling current download');
      return this._reader.cancel();
    }
    return Promise.resolve();
  }
}

let config = {
  nodes: { url: '/pocket-data-browser.db', value: 0, max: 0, p: 0, ready: false },
  images: { url: '/pocket-images.db', value: 0, max: 0, p: 0, ready: false }
}

export const status = writable(config);

export const isDatabaseReady = writable(true, set => {
  if ( navigator.onLine === false ) { return ; }
  let checks = {};
  let promises = [];
  for(let key of [ 'nodes', 'images'] ) {
    promises.push(pocketDB.sqlitedb.where('id').equals(key).toArray()
      .then(function(rows) {
        if ( rows.length > 0 ) {
          return fetch(config[key].url, { method: 'HEAD' })
            .then((checkResponse) => {
              const lastModified = checkResponse.headers.get('last-modified');
              let date1 = Date.parse(rows[0].lastModified);
              let date2 = Date.parse(lastModified);
              console.log('-- isDatabaseReady', key, date1, date2);
              if (date1 < date2) {
                return false;
              } else {
                config[key].ready = true;
                status.set(config);
                return true;
              }
            });
        } else {
          return false;
        }
      }
    ))
  }
  Promise.all(promises)
    .then((values) => {
      console.log('-- isDatabaseReady all', values);
      set(values.indexOf(false) < 0);
    })
});

window.isDatabaseReady = isDatabaseReady;

async function downloadDatabase(key) {
  let lastModified;
  console.log("-- downloadDatabase", key);

  let progressFetcher = new ProgressReportFetcher(function({ loaded, total }) {
    config[key].value = loaded;
    config[key].max = total;
    config[key].p = percentize(key, config[key].value, config[key].max);
    // console.log("-- updateProgress", key, loaded, total, config[key].p);
    status.set(config);
  });
  return new Promise(function(resolve, reject) {
    progressFetcher.fetch(config[key].url)
      .then(function(res) {
        lastModified = res.headers.get('last-modified');
        return res.arrayBuffer();
      })
      .then(function(buffer) {
        let data = new Uint8Array(buffer);
        resolve(data);
      })
    })
    .then(async function (data) {
      const rows = await pocketDB.sqlitedb.where("id").equals(key).toArray();
      if (rows.length) {
        return pocketDB.sqlitedb.update(key, { data: data, lastModified: lastModified });
      }
      return pocketDB.sqlitedb.add({ id: key, data: data, lastModified: lastModified })
    })
}

function percentize(key, value, max) {
  if (max == 0) { return 0; }
  let p = Math.ceil((value / max) * 100.0);
  // console.log("-- %", key, p);
  return p;
}

export async function loadDatabases() {
  console.log("::: LOAD DATABASES");
  for (let key of ['nodes', 'images']) {
    let check = await downloadDatabase(key);
    console.log("===", key, check);
  }
  return new Promise((resolve, reject) => {
    resolve(true);
  });
}

export const nodesDB = readable(null, set => {
  console.log("-- taxon db start");
  pocketDB.sqlitedb.get({ id: 'nodes' }).then((value) => {
    if ( value ) {
      let db = new SQL.Database(new Uint8Array(value.data));
      set(db);
    }
  })
})

export const imagesDB = readable(null, set => {
  console.log("-- taxon db start");
  pocketDB.sqlitedb.get({ id: 'images' }).then((value) => {
    if ( value ) {
      let db = new SQL.Database(new Uint8Array(value.data));
      set(db);
    }
  })
})
