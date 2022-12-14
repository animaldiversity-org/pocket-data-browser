import { writable, get } from 'svelte/store';
import Cookies from 'js-cookie';

export const remoteUser = writable(null, set => {
  const token = localStorage.getItem('authtoken');
  if ( token ) {
    set(JSON.parse(token));
  }
});

export const syncData = writable({}, set => {
  let data = JSON.parse(localStorage.getItem('syncData') || '{}');
  if ( data.syncToken === undefined ) {
    data.syncToken = (1000 * Math.random()).toString();
    localStorage.setItem('syncData', JSON.stringify(data));
  }
  set(data);
});

export class AuthManager {

  static isAuthenticated() {
    const token = localStorage.getItem('authtoken');
    if (token) {
      if ( token.indexOf('user_id') < 0 ) {
        localStorage.removeItem('authtoken');
        return false;
      }
      return true;
    }
    return false;
  }

  static login(username, password) {
    Cookies.remove('csrftoken');
    return fetch('/api-token-auth/', {
      method: 'POST',
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      mode: 'cors',
      body: JSON.stringify({
        username: username,
        password: password
      })
    })
    .then(res => res.json())
    .then(json => {
      console.log("-- login", json);
      if (json.non_field_errors) {
        alert(`Could not log in as user ${username} with that password.`);
        return;
      }
      localStorage.setItem('authtoken', JSON.stringify(json));
      remoteUser.set(json);
      return json;
    })
  }

  static generateSyncToken() {
    let syncDatum = get(syncData);
    syncDatum.syncToken = (1000 * Math.random()).toString();
    localStorage.setItem('syncData', JSON.stringify(syncDatum));
    syncData.set(syncDatum);
  }

  static updateLastSynced(lastSynced) {
    let syncDatum = get(syncData);
    syncDatum.lastSynced = lastSynced;
    localStorage.setItem('syncData', JSON.stringify(syncDatum));
    console.log("-- updateLastSynced", lastSynced, syncDatum);
    syncData.set(syncDatum);
  }

  static logout() {
    // remove the token to stop sync
    localStorage.removeItem('authtoken');
    localStorage.removeItem('syncData');
    remoteUser.set(null);
  }

  static getUser() {
    // const token = localStorage.getItem('authtoken');
    // remoteUser.set(JSON.parse(token));
    // console.log("-- getUser", remoteUser);
    return get(remoteUser);
  }

  static getWorkspaceConfig() {
    const token = AuthManager.getUser();
    let workspaceSlug = token.currentWorkspace;
    return JSON.parse(localStorage.getItem(`${workspaceSlug}.config`) || '{}');
  }

  static async fetchWorkspaceConfig(workspaceSlug) {

    if ( navigator.onLine === false ) { return ; }

    const token = AuthManager.getUser();

    if ( workspaceSlug === undefined ) {
      console.log("-- token", token);
      workspaceSlug = token.currentWorkspace;
    }

    let workspaceKey = `${workspaceSlug}.config`;
    let workspaceConfig = localStorage.getItem(workspaceKey);
    let now = Math.ceil((new Date).getTime() / 1000);

    if (workspaceConfig &&
      (now - workspaceConfig.timestamp) < (24 * 60 * 60)
    ) { return; }

    Cookies.remove('csrftoken');
    let resp = await fetch(`/api/workspace_config/?workspace=${workspaceSlug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Token ${token.token}`,
      },
      mode: 'cors'
    })
    let retval = await resp.json();
    localStorage.setItem(workspaceKey, JSON.stringify(retval));
  }

}

window.AuthManager = AuthManager;
export default AuthManager;