<script>
  import {Route, router} from 'tinro';
  import {
    Icon
  } from 'sveltestrap';

</script>

<style>

  section {
    /* border: 1px dotted #eee; */
    /* height: 100%; */
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .list-group {
    width: 75%;
  }

  .list-group-item {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

</style>

<section>
  <div class="list-group fs-4">
    <a class="list-group-item list-group-action" href="/about"><Icon name="info-square" /> About</a>
    <!-- <a class="list-group-item list-group-action" href="/places"><Icon name="globe" /> Places</a> -->
    <a class="list-group-item list-group-action" href="/guide"><Icon name="bug-fill" /> Bug Guide</a>    
    <a class="list-group-item list-group-action" href="/animal-finder"><Icon name="search" /> Animal Finder</a>          
    <a class="list-group-item list-group-action" href="/notes"><Icon name="card-text" /> Notes</a>          
    <a class="list-group-item list-group-action" href="/notes/add"><Icon name="plus-square" /> New Note</a>          
  </div>
</section>
