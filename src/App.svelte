<script>
  import { onMount } from 'svelte';

  import { registerSW } from "virtual:pwa-register";

  import Routes from './components/Routes.svelte';
  import LoginForm from './components/LoginForm.svelte';
  import NavigationToolbar from './components/NavigationToolbar.svelte';

  import { isDatabaseReady } from './lib/db';
  import AuthManager from './lib/AuthManager';
  import NoteManager from './lib/NoteManager';
  import DatabaseLoader from './components/DatabaseLoader.svelte';

  let isAuthenticated = AuthManager.isAuthenticated();
  let isSQLReady = false;
  let doUpdateDatabases = true;

  function handleAuth(event) {
    let token = event.detail.token;
    isAuthenticated = AuthManager.isAuthenticated();
    if ( isAuthenticated ) {
      NoteManager.syncNotes();
      NoteManager.initializeCrontab();
      AuthManager.fetchWorkspaceConfig();
    }
  }

  if ( "serviceWorker" in navigator ) {
    registerSW();
  }

  onMount(() => {

    const sqlPromise = initSqlJs({
      locateFile: filename => `/${filename}`
    });
    sqlPromise.then(function(SQL) {
      window.SQL = SQL;
      isSQLReady = true;
    })

    let $span = document.querySelector('#preload-message');
    $span.style.display = 'none';
    document.querySelector('#app').dataset.initialized = true;
    
    // this is read only so fudge some data
    window.isReadOnly = false;
    localStorage.setItem('diamond-fork-01.config', '{"activityData":["Schoolyard Observations 1","Schoolyard Observations 2"],"rosterData":["adoredcoati@univhigh.edu","agitateddove@univhigh.edu","blackstonefinancial@univhigh.edu","cavernoustubby@univhigh.edu","cerebellumoutcome@univhigh.edu","competingbegan@univhigh.edu","everyseedling@univhigh.edu","fallaciousgrowl@univhigh.edu","framerich@univhigh.edu","frockmedial@univhigh.edu","gracefitzroy@univhigh.edu","greetingssaving@univhigh.edu","helicoptertreatment@univhigh.edu","hivetrained@univhigh.edu","immigratebonehead@univhigh.edu","individualmews@univhigh.edu","itselfvirtue@univhigh.edu","keyboardluminous@univhigh.edu","layertired@univhigh.edu","leopardbellbottoms@univhigh.edu","mottledfeet@univhigh.edu","murmuruniform@univhigh.edu","pelvisfluttering@univhigh.edu","penaltyheartpulse@univhigh.edu","perfumedphantom@univhigh.edu","pullovereventually@univhigh.edu","putridsurround@univhigh.edu","resulttranquil@univhigh.edu","santandershotput@univhigh.edu","scarletlollies@univhigh.edu","seafowlrecently@univhigh.edu","sharpaccess@univhigh.edu","sightsurvival@univhigh.edu","slicesafety@univhigh.edu","softballlibrarian@univhigh.edu","soychannel@univhigh.edu","spothandsomely@univhigh.edu","startcomedy@univhigh.edu","surferpackage@univhigh.edu","suspectnuclear@univhigh.edu","tadayearly@univhigh.edu","tattereddivulge@univhigh.edu","tensesaw@univhigh.edu","twangbeetroot@univhigh.edu","unrulyvenomous@univhigh.edu","velvetymanner@univhigh.edu","watchfulrugby@univhigh.edu","whooshcrackers@univhigh.edu","wishpopulate@univhigh.edu","workseight@univhigh.edu"],"timestamp":1660502474}');
    localStorage.setItem('token', '{"token":"719ec5e24efe979d9ce939e6eadf730bafa5098a","user_id":59,"username":"science1","workspaces":[{"slug":"diamond-fork-01","name":"1st Period Science","organization":"Diamond Fork"}],"currentWorkspace":"diamond-fork-01"}');

    isAuthenticated = AuthManager.isAuthenticated();

    if ( isAuthenticated ) {
      NoteManager.syncNotes();
      NoteManager.initializeCrontab();
      AuthManager.fetchWorkspaceConfig();
    }
		return () => NoteManager.stopCrontab();
	});
  

	
</script>

<NavigationToolbar />

<main class="container mt-3 position-relative">

  {#if isAuthenticated}
    {#if isSQLReady}
      <!-- <pre>isDatabaseReady = {$isDatabaseReady}</pre> -->
      <Routes />
      {#if $isDatabaseReady === false}
        <DatabaseLoader />
      {/if}
    {:else}
      <pre>WAITING FOR SQL TO LOAD...</pre>
    {/if}
  {:else}
      <LoginForm on:auth={handleAuth} />
  {/if}
  
</main>

<footer class="d-flex flex-wrap justify-content-between align-items-center p-3 border-top text-bg-dark">
  <div class="col-md-8 d-flex flex-column gap-2">
    <div>
      <span class="xxx-mb-3">© 2022</span>
      <span>•</span>
      <a class="text-white text-decoration-none lh-1" href="https://lrhe.utah.edu/">Life Right Here & Everywhere</a>
      <span>•</span>
      <a class="text-white text-decoration-none lh-1" href="https://animaldiversity.org">Animal Diversity Web</a>
    </div>
  </div>
</footer>

<style>
  footer {
    /* margin-left: -1rem;
    margin-right: -1rem;
    margin-bottom: -1rem; */
    /* margin-top: 4rem; */
  }
</style>
