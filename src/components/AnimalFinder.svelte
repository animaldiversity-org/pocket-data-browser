<script>
  import { db } from '../lib/db';
  import TaxonManager from '../lib/TaxonManager';
  import { meta } from 'tinro';

  import { Card } from 'sveltestrap';
  import SpeciesHeader from './SpeciesHeader.svelte';
  import Image from './Image.svelte';
  
  const rootSlug = '__ROOT__';
  let content;
  let hasPreviewImages = false;

  export let id = null;

  let category;
  let taxonInformationSet;
  let taxonCategorySet;
  let isSpecies = false;
  let breadcrumbs = [];
  
  $: if ( $db ) {

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

  .p-grid figure {
    width: 100%;
    margin: 0;
    font-size: 1rem;
  }

  .p-grid figure .img-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  .p-grid figure img {
    width: auto;
  }

  .p-link {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-width: 40%;
  }

  .figure-wrap {
    height: 250px; 
    width: 100%; 
    display: flex; 
    align-items: center; 
    justify-content: center
  }

</style>

{#if category}

  {#if category.id}
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <a href="/species-categories/">Animal Finder</a>
        </li>
        {#each breadcrumbs as breadcrumb}
          <li class="breadcrumb-item">
            <a href="/species-categories/{breadcrumb.id}">
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

  <article>
    <h1>
      <SpeciesHeader record={category} isHeading={true} />
    </h1>

    <div class="m-3 p-1">
      <form class="m-0">
        <div class="input-group mb-3">
          <!-- <label for="q1" class="form-label form-label-lg">Search Inside</label> -->
          <span id="q1-label" class="input-group-text">Search inside</span>
          <input class="form-control" type="text" aria-labelledby="q1-label"/>
          <button class="btn btn-outline-secondary" type="button">
            <i class="bi bi-x-circle"></i>
          </button>
        </div>
      </form>
    </div>


    {#if taxonInformationSet}
      <h2 class="mt-3 mx-3 mb-0"><i class="bi bi-file-text"></i> Taxon accounts in this category</h2>
      <div class="p-grid mt-0">
        {#each taxonInformationSet as taxonInformation}
          <Card body>
            <figure style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
              {#if taxonInformation.previewImage}
                <div class="figure-wrap">
                  <!-- <img src="{taxonInformation.previewImage.src.replace('//images', '/images')}" style="max-height: 250px; width: auto;" /> -->
                  <Image src={taxonInformation.previewImage.src.replace('//images', '/images')} style="max-height: 250px; width: auto;"  />
                </div>
              {:else}
                <div class="figure-wrap">
                  <i class="bi bi-binoculars fs-1" style="opacity: 0.5;"></i>
                </div>
              {/if}
              <figcaption>
                <a class="fs-4 d-flex gap-1" href="/species-information/{taxonInformation.id}">
                  <i class="bi bi-file-text"></i>
                  <div>
                    <SpeciesHeader record={taxonInformation} />
                  </div>
                </a>
              </figcaption>
            </figure>
          </Card>
        {/each}        
      </div>
    {/if}

    {#if taxonCategorySet}
      <h2 class="mt-3 mx-3 mb-0"><i class="bi bi-folder"></i> Explore categories</h2>
      <div class="p-grid mt-0">
        {#each taxonCategorySet as subCategory}
          <Card body>
            <figure style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
              {#if subCategory.previewImage}
                <div class="figure-wrap">
                  <!-- <img src="{subCategory.previewImage.src.replace('//images', '/images')}" style="max-height: 250px; width: auto;" />                                   -->
                  <Image src={subCategory.previewImage.src.replace('//images', '/images')} style="max-height: 250px; width: auto;" />
                </div>
              {:else}
                <div class="figure-wrap">
                  <i class="bi bi-binoculars fs-1" style="opacity: 0.5;"></i>
                </div>
              {/if}
              <figcaption>
                <a class="fs-4 d-flex gap-1" href="/species-categories/{subCategory.id}">
                  <i class="bi bi-folder"></i>
                  <div>
                    <SpeciesHeader record={subCategory} />
                  </div>
                </a>
              </figcaption>
            </figure>
          </Card>
        {/each}        
      </div>
    {/if}

  </article>

{:else}
<pre>ALAS WAITING FOR CATEGORY</pre>
{/if}