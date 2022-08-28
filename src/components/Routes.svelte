<script>
  import {Route, router} from 'tinro';

  import Transition from './Transition.svelte';

  import AboutPage from './AboutPage.svelte';
  import TopicPage from './TopicPage.svelte';
  import NoteForm from './NoteForm.svelte';
  import NoteList from './NoteList.svelte';
  import AnimalFinder from './AnimalFinder.svelte';
  import TaxonAccount from './TaxonAccount.svelte';
  import HomePage from './HomePage.svelte';

  import AuthManager from '../lib/AuthManager';

  router.mode.hash();
  router.subscribe(_ => window.scrollTo(0, 0));

  window.router = router;


</script>

<style>

</style>

<Transition>
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
</Transition>
