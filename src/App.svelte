<script>
  import { onMount } from 'svelte';

  import {Route, router} from 'tinro';
  import Transition from './components/Transition.svelte';

  import {
    Collapse,
    NavbarToggler,
    Nav,
    NavItem,
    NavLink,
    Icon,
  } from 'sveltestrap';

  import { db, isReady } from './lib/db';
  import { imageDB } from './lib/imageDB';
  import AuthManager from './lib/AuthManager';

  import AboutPage from './components/AboutPage.svelte';
  import TopicPage from './components/TopicPage.svelte';
  import NoteForm from './components/NoteForm.svelte';
  import NoteList from './components/NoteList.svelte';
  import AnimalFinder from './components/AnimalFinder.svelte';
  import TaxonAccount from './components/TaxonAccount.svelte';
  import LoginForm from './components/LoginForm.svelte';
  import HomePage from './components/HomePage.svelte';

  import NoteManager from './lib/NoteManager';
  import TaxonManager from './lib/TaxonManager';

  router.mode.hash();
  router.subscribe(_ => window.scrollTo(0, 0));

  console.log($db);
  console.log($imageDB);
  let fetchRow = function() {
    let statement = $db.prepare('SELECT * FROM nodes_topic WHERE id = 583');
    let result = statement.getAsObject({});
    console.log(result);
    return result;
  };

  let isOpen = false;
  const toggle = () => (isOpen = !isOpen);

  let isAuthenticated = AuthManager.isAuthenticated();

  function handleAuth(event) {
    let token = event.detail.token;
    isAuthenticated = AuthManager.isAuthenticated();
    if ( isAuthenticated ) {
      NoteManager.syncNotes();
      NoteManager.initializeCrontab();
      AuthManager.fetchWorkspaceConfig();
    }
  }


  onMount(() => {

    let $span = document.querySelector('#preload-message');
    $span.style.display = 'none';
    document.querySelector('#app').dataset.initialized = true;
    
    // this is read only so fudge some data
    window.isReadOnly = true;
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

<div class="container">
  <nav class="navbar bg-light">
    <div class="container-fluid p-0">
      <div class="d-flex gap-3">
        <NavbarToggler on:click={toggle} class="sm" />
        <a class="navbar-brand" href="/" style="height: 3.375rem">
          <img style="height: 100%; width: 100%" src="https://pocketguides.animaldiversity.org/assets/public/images/uncompressed/adwLogoBig.png" height="70" width="196" />
        </a>        
      </div>
      <ul class="why-so-complicated list-unstyled fs-5">
        <li class="nav-item">
          <a class="btn btn-outline-primary p-2" href="/notes/add">
            <Icon name="plus-square" /> New Note
          </a>
        </li>
        <li class="nav-item">
        </li>
      </ul>
    </div>
  </nav>
  <Collapse {isOpen} navbar>
    <div class="p-3">
    <Nav class="ms-auto fs-5" navbar>
      <NavItem>
        <NavLink href="/about"><Icon name="info-square" /> About</NavLink>
      </NavItem>
      <!-- <NavItem>
        <NavLink href="/places"><Icon name="globe" /> Places</NavLink>
      </NavItem> -->
      <NavItem>
        <NavLink href="/guide"><Icon name="bug-fill" /> Bug Guide</NavLink>    
      </NavItem>
      <NavItem>
        <NavLink href="/animal-finder"><Icon name="search" /> Animal Finder</NavLink>          
      </NavItem>
      <NavItem>
        <NavLink href="/notes"><Icon name="card-text" /> Notes</NavLink>          
      </NavItem>
    </Nav>          
    </div>

  </Collapse>
</div>

<main class="container mt-3">

  <Transition>
    {#if isAuthenticated}      
      <Route path="/">
        <HomePage />
      </Route>
      <Route path="/about">
        <AboutPage />
      </Route>
      <Route path="/guide/*" firstmatch>
        <Route path="/:id" let:meta>
          <TopicPage id="{meta.params.id}" />
        </Route>
        <Route path="/">
          <TopicPage />
        </Route>
      </Route>
      <Route path="/animal-finder/*" firstmatch>
        <Route path="/:id" let:meta>
          <AnimalFinder id={meta.params.id} />
        </Route>
        <Route path="/">
          <AnimalFinder />
        </Route>
      </Route>
      <Route path="/accounts/:id" let:meta>
        <TaxonAccount id={meta.params.id} />
      </Route>
      <Route path="/notes/*" firstmatch>
        {@const token = AuthManager.getUser()}
        <Route path="/add">
          <NoteForm noteId="blank" message="add" config={AuthManager.getWorkspaceConfig()} token={token} />
        </Route>
        <Route path="/:id" let:meta>
          <NoteForm noteId={meta.params.id} message="uuid" config={AuthManager.getWorkspaceConfig()} token={token} />
        </Route>
        <Route path="/">
          <NoteList config={AuthManager.getWorkspaceConfig()} token={token} />
        </Route>
      </Route>
    {:else}
        <LoginForm on:auth={handleAuth} />
    {/if}
  </Transition>
  
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
  .why-so-complicated {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-end;
    align-items: center;
    gap: 1rem;
  }

  footer {
    /* margin-left: -1rem;
    margin-right: -1rem;
    margin-bottom: -1rem; */
    margin-top: 4rem;
  }
</style>
