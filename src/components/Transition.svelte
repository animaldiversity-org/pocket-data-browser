<script>
  import {router} from 'tinro';
  import {fade} from 'svelte/transition';
</script>

<style>
  div {
    /* height: 100%; */
  }
</style>

{#key $router.path}
  <div class="main--transition" in:fade="{{ duration: 250 }}">
    <slot></slot>
  </div>
{/key}
