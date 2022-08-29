<script>
  import {
    Toast,
    ToastBody,
    ToastHeader,
    Icon,
    Button
  } from 'sveltestrap';

	import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let offlineReady;
  export let needRefresh;

  function dispatchReload() {
    dispatch('reload', {
      status: true
    })
  }

</script>

<div class="toast-container p-1 bg-dark end-1 bottom-1 rounded">
  <Toast class="me-1">
    <ToastHeader>
      <Icon slot="icon" name="gear" class="me-2" />
      Updating the Pocket Guide
    </ToastHeader>
    <ToastBody>
      {#if $offlineReady}
      The application is ready to use offline.
      {:else}
      A new version of the application is available. Reload to update.
      {/if}
      {#if $needRefresh}
      <Button class="m-0" on:click={dispatchReload}>Reload</Button>
      {/if}
    </ToastBody>
  </Toast>
</div>