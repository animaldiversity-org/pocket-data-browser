<script>
  export let record;
  export let isHeading = false;
  export let isSpecies = false;
</script>

<style>
  span.vernacular_name {
    display: block;
  }

  span.scientific_name {
    display: block;
  }

  .vernacular_name + .scientific_name {
    /* font-size: 90%; */
    color: #333;
    opacity: 0.75;
  }

  span[data-is-heading="true"] {
    display: inline-block !important;
  }

  span[data-is-heading="true"] + span[data-is-heading="true"]::before {
    content: " / ";
    color: #666;
    opacity: 0.4;
  }

  .divider {
    opacity: 0.4;
    color: #666;
  }

  .scientific_name[data-is-species="true"] {
    font-style: italic;
  }

</style>

{#if record.vernacularName}
  <span class="vernacular_name" data-is-heading={isHeading}>{record.vernacularName}</span> 
  <span class="scientific_name" data-is-heading={isHeading} data-is-species={isSpecies}>{record.scientificName}</span>
{:else if record.scientificName}
  <span class="scientific_name" data-is-species={isSpecies}>{record.scientificName}</span>
{:else}
  {record.title}
{/if}
