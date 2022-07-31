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
  import AuthManager from './lib/AuthManager';

  import TopicPage from './components/TopicPage.svelte';
  import NoteForm from './components/NoteForm.svelte';
  import NoteList from './components/NoteList.svelte';
  import LoginForm from './components/LoginForm.svelte';

  import NoteManager from './lib/NoteManager';

  router.mode.hash();
  router.subscribe(_ => window.scrollTo(0, 0));

  console.log($db);
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
      <NavItem>
        <NavLink href="/places"><Icon name="globe" /> Places</NavLink>
      </NavItem>
      <NavItem>
        <NavLink href="/guide"><Icon name="bug-fill" /> Bug Guide</NavLink>    
      </NavItem>
      <NavItem>
        <NavLink href="/species-categories"><Icon name="search" /> Animal Finder</NavLink>          
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
        {#if $db}
          <p>AHOY READY</p>
          <p>{fetchRow().title}</p>
          <p><a href="/guide/{fetchRow().id}">Click Here</a></p>
        {:else}
          <p>So not ready</p>
        {/if}
      </Route>
      <Route path="/guide/*" firstmatch>
        <Route path="/:id" let:meta>
          <TopicPage id="{meta.params.id}" />
        </Route>
        <Route path="/">
          <TopicPage />
        </Route>
      </Route>
      <Route path="/notes/*" firstmatch>
        {@const token = AuthManager.getUser()}
        <Route path="/add">
          <NoteForm noteId="blank" message="add" config={AuthManager.getWorkspaceConfig()} />
        </Route>
        <Route path="/:uuid" let:meta>
          <NoteForm noteId={meta.params.uuid} message="uuid" config={AuthManager.getWorkspaceConfig()} />
        </Route>
        <Route path="/">
          <NoteList />
        </Route>
      </Route>
  {:else}
      <LoginForm on:auth={handleAuth} />
  {/if}
  </Transition>
  
</main>

<footer class="d-flex flex-wrap justify-content-between align-items-center p-3 border-top text-bg-dark">
  <div class="col-md-8 d-flex flex-column gap-2">
    <a href="/" class="text-white text-decoration-none lh-1">
      Animal Diversity Web
    </a>
    <span class="xxx-mb-3">© 2022 Animal Diversity Web and LIFE Project</span>
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
