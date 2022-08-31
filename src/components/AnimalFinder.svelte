<script>
  import { nodesDB } from '../lib/db';
  import TaxonManager from '../lib/TaxonManager';
  import { meta } from 'tinro';

  import SpeciesHeader from './SpeciesHeader.svelte';
  import TaxonCard from './TaxonCard.svelte';
  
  const rootSlug = '__ROOT__';
  let content;
  let hasPreviewImages = false;

  export let id = null;

  let category;
  let taxonInformationSet;
  let taxonCategorySet;
  let isSpecies = false;
  let breadcrumbs = [];

  let searchResults;
  let searchTerm;

  function onChange(event) {
    searchTerm = event.target.value;
    // console.log("-- input: onChange", searchTerm);
    if ( searchTerm == "" ) { searchResults = null; return; }
    searchResults = TaxonManager.search(searchTerm);
    // console.log("-- input:", searchResults);
  }

  function onKeyDown(event) {
    // console.log("-- input: onKeyDown", event);
  }

  function resetSearch(event) {
    event.preventDefault();
    searchTerm = ''; searchResults = null;
  }
  
  $: if ( $nodesDB ) {

    category = TaxonManager.getCategory(id);
    console.log("-- category", category);
    if ( category.id ) {
      taxonInformationSet = TaxonManager.taxonInformationSet(category);
    }
    taxonCategorySet = TaxonManager.taxonCategorySet(category);

    let parentId = category.parentId;
    while ( parentId ) {
      let parent = TaxonManager.getCategory(parentId);
      breadcrumbs.push(parent);
      parentId = parent.parentId;
    }

  }
  // $: if ( content && content.childrenSet.edges ) {
  //   let tmp = content.childrenSet.edges.filter((edge) => edge.node.previewImage != null);
  //   hasPreviewImages = ( tmp.length > 0 ) && ( tmp.length == content.childrenSet.edges.length );
  //   console.log("-- hasPreviewImages", tmp.length, content.childrenSet.edges.length);
  // }
</script>

<style>

  article {
    font-size: 1.25rem;
  }
  
  .p-grid {
    width: 100%;
    overflow: hidden;
    position: relative;
    padding: 1rem;

    display: grid;
    grid-gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));

    margin: 1rem 0;
  }


</style>

{#if category}

  {#if category.id}
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <a href="/animal-finder/">Animal Finder</a>
        </li>
        {#each breadcrumbs as breadcrumb}
          <li class="breadcrumb-item">
            <a href="/animal-finder/{breadcrumb.id}">
              <i class="bi bi-folder"></i>
              {breadcrumb.title}
            </a>
          </li>
        {/each}
        <li class="breadcrumb-item active" aria-current="page">
          <i class="bi bi-folder"></i>
          {category.title}
        </li>
      </ol>
    </nav>
  {/if}

  <article class="p-3 pt-0">
    <h1>
      <SpeciesHeader record={category} isHeading={true} />
    </h1>

    <div class="p-1">
      <form class="m-0">
        <div class="input-group mb-3">
          <!-- <label for="q1" class="form-label form-label-lg">Search Inside</label> -->
          <span id="q1-label" class="input-group-text">Search inside</span>
          <input 
            class="form-control" 
            type="text" 
            aria-labelledby="q1-label" 
            on:input={onChange}
            on:keydown={onKeyDown}
            />
          <button class="btn btn-outline-secondary" type="button" on:click={resetSearch}>
            <i class="bi bi-x-circle"></i>
          </button>
        </div>
      </form>
    </div>

    {#if searchResults}
      {#if searchResults.taxonInformation.length}
      <h2 class="mt-3 mx-3 mb-0"><i class="bi bi-file-text"></i> Taxon Accounts matching {searchTerm}</h2>
      <div class="p-grid mt-0">
        {#each searchResults.taxonInformation as taxonInformation}
          <TaxonCard record={taxonInformation} icon="bi-file-text" />
        {/each}        
      </div>
      {/if}
    {/if}

    {#if ! searchResults && taxonInformationSet}
      <h2 class="mt-3 mx-3 mb-0"><i class="bi bi-file-text"></i> Taxon accounts in this category</h2>
      <div class="p-grid mt-0">
        {#each taxonInformationSet as taxonInformation}
          <TaxonCard record={taxonInformation} icon="bi-file-text" />
        {/each}        
      </div>
    {/if}

    {#if ! searchResults && taxonCategorySet}
      <h2 class="mt-3 mx-3 mb-0"><i class="bi bi-folder"></i> Explore categories</h2>
      <div class="p-grid mt-0">
        {#each taxonCategorySet as subCategory}
          <TaxonCard record={subCategory} icon="bi-folder" />
        {/each}        
      </div>
    {/if}

  </article>

{:else}
<pre>ALAS WAITING FOR CATEGORY</pre>
{/if}