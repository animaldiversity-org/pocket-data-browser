<script>
  import {
    Collapse,
    NavbarToggler,
    Nav,
    NavItem,
    NavLink,
    Icon,
  } from 'sveltestrap';

  let isOpen = false;
  const toggle = () => (isOpen = !isOpen);

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
</style>

<div class="container">
  <nav class="navbar bg-light">
    <div class="container-fluid p-0">
      <div class="d-flex gap-3">
        <NavbarToggler on:click={toggle} class="sm" />
        <a class="navbar-brand" href="/" style="height: 3.375rem">
          <img style="height: 100%; width: auto" src="/adwLogoBig.png" height="70" width="196" />
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