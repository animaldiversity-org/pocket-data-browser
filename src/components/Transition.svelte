<script>
    import {router} from 'tinro';
    import {fade} from 'svelte/transition';
</script>

<style>
    div {
        height: 100%;
    }
</style>

{#key $router.path}
    <div in:fade="{{ duration: 350 }}">
        <slot></slot>
    </div>
{/key}
