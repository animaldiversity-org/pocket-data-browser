<script>
    import {router} from 'tinro';
    import {fade} from 'svelte/transition';
</script>

{#key $router.path}
    <div in:fade="{{ duration: 350 }}">
        <slot></slot>
    </div>
{/key}
