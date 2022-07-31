class AuthManager {

  static isAuthenticated() {
    const token = localStorage.getItem('token');
    if (token) {
      return true;
    }
    return false;
  }

  static login(username, password) {
    return fetch('/api-token-auth/', {
      method: 'POST',
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
      localStorage.setItem('token', JSON.stringify(json));
      return json;
    })
  }

  static getUser() {
    const token = localStorage.getItem('token');
    return JSON.parse(token);
  }

  static getWorkspaceConfig() {
    const token = AuthManager.getUser();
    let workspaceSlug = token.currentWorkspace;
    return JSON.parse(localStorage.getItem(`${workspaceSlug}.config`) || '{}');
  }

  static async fetchWorkspaceConfig(workspaceSlug) {
    const token = AuthManager.getUser();

    if ( workspaceSlug === undefined ) {
      workspaceSlug = token.currentWorkspace;
    }

    let workspaceKey = `${workspaceSlug}.config`;
    let workspaceConfig = localStorage.getItem(workspaceKey);
    let now = Math.ceil((new Date).getTime() / 1000);

    if (workspaceConfig &&
      (now - workspaceConfig.timestamp) < (24 * 60 * 60)
    ) { return; }


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