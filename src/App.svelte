<script>
  import { onMount } from 'svelte';
  import { afterUpdate } from 'svelte';

  import {useRegisterSW} from 'virtual:pwa-register/svelte';

  import Routes from './components/Routes.svelte';
  import LoginForm from './components/LoginForm.svelte';
  import NavigationToolbar from './components/NavigationToolbar.svelte';

  import { isDatabaseReady } from './lib/db';
  import { AuthManager, remoteUser } from './lib/AuthManager';
  import NoteManager from './lib/NoteManager';
  import DatabaseLoader from './components/DatabaseLoader.svelte';
  import ServiceWorkerStatus from './components/ServiceWorkerStatus.svelte';

  const {offlineReady, needRefresh, updateServiceWorker} = useRegisterSW({
      onRegistered(swr) {
          console.log(`SW registered: ${swr}`);
      },
      onRegisterError(error) {
          console.log('SW registration error', error);
      },
      onOfflineReady() {
          console.log('SW ready for offline')
          setTimeout(() => close(), 5000)
      }
  });

  if ( navigator.serviceWorker ) {
    let expectedWorkerUrl = `http://${location.host}/sw.js`;
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      console.log("== SERVICE WORKER REGISTRATIONS", registrations);
      let promises = [];
      registrations.forEach((registration) => {
        if ( registration.active.scriptURL != expectedWorkerUrl ) {
          console.log("--> REMOVE", registration.active.scriptURL);
          promises.push(registration.unregister());
        }
      })
      if ( promises.length ) {
        Promise.allSettled(promises).then((results) => {
          location.reload();
        })
      }
    });
  }

  let isAuthenticated = AuthManager.isAuthenticated();
  let isSQLReady = false;
  let doUpdateDatabases = true;

  function handleAuth(event) {
    let token = event.detail.token;
    isAuthenticated = AuthManager.isAuthenticated();
    console.log("-- handleAuth", isAuthenticated);
    if ( isAuthenticated ) {
      NoteManager.syncNotes();
      NoteManager.initializeCrontab();
      AuthManager.fetchWorkspaceConfig();
    }
  }

  function close() {
    offlineReady.set(false)
    needRefresh.set(false)
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
    // localStorage.setItem('diamond-fork-01.config', '{"activityData":["Schoolyard Observations 1","Schoolyard Observations 2"],"rosterData":["adoredcoati@univhigh.edu","agitateddove@univhigh.edu","blackstonefinancial@univhigh.edu","cavernoustubby@univhigh.edu","cerebellumoutcome@univhigh.edu","competingbegan@univhigh.edu","everyseedling@univhigh.edu","fallaciousgrowl@univhigh.edu","framerich@univhigh.edu","frockmedial@univhigh.edu","gracefitzroy@univhigh.edu","greetingssaving@univhigh.edu","helicoptertreatment@univhigh.edu","hivetrained@univhigh.edu","immigratebonehead@univhigh.edu","individualmews@univhigh.edu","itselfvirtue@univhigh.edu","keyboardluminous@univhigh.edu","layertired@univhigh.edu","leopardbellbottoms@univhigh.edu","mottledfeet@univhigh.edu","murmuruniform@univhigh.edu","pelvisfluttering@univhigh.edu","penaltyheartpulse@univhigh.edu","perfumedphantom@univhigh.edu","pullovereventually@univhigh.edu","putridsurround@univhigh.edu","resulttranquil@univhigh.edu","santandershotput@univhigh.edu","scarletlollies@univhigh.edu","seafowlrecently@univhigh.edu","sharpaccess@univhigh.edu","sightsurvival@univhigh.edu","slicesafety@univhigh.edu","softballlibrarian@univhigh.edu","soychannel@univhigh.edu","spothandsomely@univhigh.edu","startcomedy@univhigh.edu","surferpackage@univhigh.edu","suspectnuclear@univhigh.edu","tadayearly@univhigh.edu","tattereddivulge@univhigh.edu","tensesaw@univhigh.edu","twangbeetroot@univhigh.edu","unrulyvenomous@univhigh.edu","velvetymanner@univhigh.edu","watchfulrugby@univhigh.edu","whooshcrackers@univhigh.edu","wishpopulate@univhigh.edu","workseight@univhigh.edu"],"timestamp":1660502474}');
    // localStorage.setItem('token', '{"token":"719ec5e24efe979d9ce939e6eadf730bafa5098a","user_id":59,"username":"science1","workspaces":[{"slug":"diamond-fork-01","name":"1st Period Science","organization":"Diamond Fork"}],"currentWorkspace":"diamond-fork-01"}');

    isAuthenticated = AuthManager.isAuthenticated();

    if ( isAuthenticated ) {
      console.log("-- mounted and authenticated");
      NoteManager.syncNotes();
      NoteManager.initializeCrontab();
      AuthManager.fetchWorkspaceConfig();
    }
		return () => NoteManager.stopCrontab();
	});

  $: toast = $offlineReady || $needRefresh; console.log("-- toast", $offlineReady, $needRefresh);
	
</script>

<NavigationToolbar />

<main class="container mt-3 position-relative">

  {#if $remoteUser}
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

  {#if toast}
    <ServiceWorkerStatus 
      offlineReady={offlineReady}
      needRefresh={needRefresh}
      on:reload={() => { updateServiceWorker(true) }} />
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

    background: black;
    color: white;
  }
</style>
