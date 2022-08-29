<script>

  import { onMount } from 'svelte';
  import { router } from 'tinro';

  import {
    Toast,
    ToastBody,
    ToastHeader,
    Icon,
    Progress
  } from 'sveltestrap';

  import { pocketDB } from '../lib/storage';
  import { loadDatabases, status, isDatabaseReady } from '../lib/db';

  let open = true;

  onMount(() => {

    if ( ! $isDatabaseReady ) {
      document.body.dataset.active = false;
      loadDatabases().then(() => {
        document.body.dataset.active = true;
        console.log("-- databases loaded");
        open = false;
        isDatabaseReady.set(true);
        router.goto(`/`);
      })
    } else {
      console.log("-- database was already loaded!");
      open = false;
    }

  });


</script>

<style>
  .bottom-1 {
    bottom: 1rem;
  }
  
  .end-1 {
    right: 1rem;
  }
</style>

{#if open}
  <div class="toast-container p-1 bg-dark end-1 bottom-1 rounded">
    <Toast class="me-1">
      <ToastHeader>
        <Icon slot="icon" name="cloud-arrow-down" class="me-2" />
        Updating Pocket Guides Databases
      </ToastHeader>
      <ToastBody>
        {#if $status.nodes.ready === false}
        <div>
          <div class="text-center">Buug Guide and Animal Finder</div>
          <Progress color="success" animated striped value={$status.nodes.p} max={100}>{$status.nodes.p}%</Progress>
        </div>        
        {/if}
        {#if $status.images.ready === false}
        <div>
          <div class="text-center">Images</div>
          <Progress color="info" animated striped value={$status.images.p} max={100}>{$status.images.p}%</Progress>
        </div>
        {/if}
      </ToastBody>
    </Toast>
  </div>
{/if}