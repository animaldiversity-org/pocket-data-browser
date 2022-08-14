<script>

  import { Card } from 'sveltestrap';
  import Image from './Image.svelte';
  import SpeciesHeader from './SpeciesHeader.svelte';

  export let record;
  export let icon;

  let action = ( icon == 'bi-folder' ) ? 'animal-finder' : 'accounts';

</script>

<style>
  .figure-wrap {
    height: 250px; 
    width: 100%; 
    display: flex; 
    align-items: center; 
    justify-content: center
  }

  a {
    text-decoration: none;
  }

  span[data-is-native] {
    display: block;
    text-transform: uppercase;
    color: #fff;
    padding: 0.25rem 1rem;
    margin: 0.25rem 0;
    flex-basis: 100%;
  }

  a:hover span[data-is-native] {
    text-decoration: none !important;
  }

  span[data-is-native="true"] {
    background: #568203;
  }

  span[data-is-native="false"] {
    background: goldenrod;
  }

  a:hover div {
    text-decoration: underline;
  }
</style>

<Card body>
  <a href="/{action}/{record.id}">
    <figure style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
      {#if record.previewImage}
        <div class="figure-wrap">
          <!-- <img src="{taxonInformation.previewImage.src.replace('//images', '/images')}" style="max-height: 250px; width: auto;" /> -->
          <Image src={record.previewImage.src.replace('//images', '/images')} style="max-height: 250px; width: auto;"  />
        </div>
      {:else}
        <div class="figure-wrap">
          <i class="bi bi-binoculars fs-1" style="opacity: 0.5;"></i>
        </div>
      {/if}
      <figcaption>
        <span class="fs-5 d-flex gap-1" href="/{action}/{record.id}">
          <i class="bi {icon}"></i>
          <div>
            <SpeciesHeader record={record} />
            {#if record.facts}
              {#if record.facts.isNative == true}
                <span data-is-native="true">Native</span>
              {:else if record.facts.isNative == false}
                <span data-is-native="false">Introduced</span>
              {/if}
            {/if}
          </div>
        </span>
      </figcaption>
    </figure>
  </a>

</Card>