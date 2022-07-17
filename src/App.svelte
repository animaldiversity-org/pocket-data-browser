<script>

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

  import TopicPage from './components/TopicPage.svelte';
  import NoteForm from './components/NoteForm.svelte';

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
          <a class="btn btn-outline-primary p-2" href="/note/add">
            <Icon name="plus-square" /> New Note
          </a>
        </li>
        <li class="nav-item">
        </li>
      </ul>
    </div>
  </nav>
  <Collapse {isOpen} navbar>
    <Nav class="ms-auto fs-5" navbar>
      <NavItem>
        <NavLink href="/about"><Icon name="info-square" /> About</NavLink>
      </NavItem>
      <NavItem>
        <NavLink href="/places"><Icon name="globe" /> Places</NavLink>
      </NavItem>
      <NavItem>
        <NavLink href="/idguide"><Icon name="bug-fill" /> Bug Guide</NavLink>    
      </NavItem>
      <NavItem>
        <NavLink href="/species-categories"><Icon name="search" /> Animal Finder</NavLink>          
      </NavItem>
      <NavItem>
        <NavLink href="/notes"><Icon name="card-text" /> Notes</NavLink>          
      </NavItem>
    </Nav>
  </Collapse>
</div>

<main>

  <Transition>
    <Route path="/">
      {#if $db}
        <p>AHOY READY</p>
        <p>{fetchRow().title}</p>
        <p><a href="/guide/{fetchRow().id}">Click Here</a></p>
      {:else}
        <p>So not ready</p>
      {/if}
    </Route>
    <Route path="/guide/:id" firstmatch>
      <TopicPage />
    </Route>
    <Route path="/guide/">
      <TopicPage />
    </Route>
    <Route path="/note/*" firstmatch>
      <Route path="/add">
        <NoteForm noteId="blank" message="add" />
      </Route>
      <Route path="/:uuid" let:meta>
        <NoteForm noteId={meta.params.uuid} message="uuid" />
      </Route>
    </Route>
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
    margin-left: -1rem;
    margin-right: -1rem;
    margin-bottom: -1rem;
    margin-top: 4rem;
  }
</style>
