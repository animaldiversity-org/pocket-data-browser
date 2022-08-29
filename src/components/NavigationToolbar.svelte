<script>
  import {
    Collapse,
    NavbarToggler,
    Nav,
    NavItem,
    NavLink,
    Icon,
    Button
  } from 'sveltestrap';

  import {router} from 'tinro';

  import { AuthManager, remoteUser } from '../lib/AuthManager';
  import NoteManager from '../lib/NoteManager';

  let isOpen = false;
  const toggle = () => (isOpen = !isOpen);

  // router.subscribe(_ => setTimeout(toggle, 100));
  // router.subscribe(_ => {
  //   // if ( isOpen ) { setTimeout(() => { isOpen = false; }, 0) }
  //   if ( isOpen ) {
  //     window.requestAnimationFrame(() => {
  //       if ( isOpen ) { isOpen = false; }
  //     })
  //   }
  //   window.scrollTo(0,0);
  // });

  const logout = () => {
    if ( navigator.onLine === false ) {
      alert("You need to be online to logout.");
      return;
    }

    // unload the user notes
    NoteManager.unloadNotes();
    // log out to stop sync
    AuthManager.logout(); 

    isOpen = false;
  };

</script>

<style>
  .why-so-complicated {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-end;
    align-items: center;
    gap: 1rem;
  }

  img.logo {
    height: 100%;
    width: auto;
  }
</style>

<div class="container">
  <nav class="navbar bg-light">
    <div class="container-fluid p-0">
      <div class="d-flex gap-3">
        <NavbarToggler on:click={toggle} class="sm border border-dark" style="width: 3.5rem; height: 3.5rem;">
          <Icon name="list" style="color: black" />
        </NavbarToggler>
        <a class="navbar-brand" href="/" style="height: 3.375rem">
          <img class="logo" src="/adwLogoBig.png" height="70" width="196" alt="" aria-hidden="true" />
          <span class="visually-hidden">Animal Diversity Web Pocket Guide</span>
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
        <NavItem>
          <Button outline color="dark" class="mt-3" on:click={logout}><Icon name="box-arrow-left" /> Log Out</Button>
        </NavItem>
      </Nav>          
    </div>
  </Collapse>
</div>