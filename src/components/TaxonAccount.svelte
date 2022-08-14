<script>
  import { db } from '../lib/db';
  import TaxonManager from '../lib/TaxonManager';
  
  import { Col, Container, Row } from 'sveltestrap';
  import { Button } from 'sveltestrap';
  import { Accordion, AccordionItem } from 'sveltestrap';
  import {
    Carousel,
    CarouselControl,
    CarouselIndicators,
    CarouselItem
  } from 'sveltestrap';

  import SpeciesHeader from './SpeciesHeader.svelte';
  import Image from './Image.svelte';

  let content;
  let hasPreviewitems = false;

  export let id = null;

  let isSpecies = true;
  let breadcrumbs = [];

  let info;
  let assets = [];
  let items = [];
  let activeIndex = 0;
  let isRemote = false;
  
  $: if ( $db ) {

    info = isNaN(id) ? 
      TaxonManager.getTaxonInformationBySlug(`accounts/${id}`) : 
      TaxonManager.getTaxonInformationById(id);

    if ( info ) {
      let parentId = info.categoryId;
      while ( parentId ) {
        let parent = TaxonManager.getCategory(parentId);
        breadcrumbs.push(parent);
        parentId = parent.parentId;
      }

      if ( info.images ) {
        assets = []; items = [];
        info.images.edges.forEach((edge) => {
          assets.push(edge.node);
          items.push(edge.node.src);
        })
      } else if ( info.previewImage ) {
        assets = [ info.previewImage ];
        items = [ info.previewImage.src ];
      }
      isRemote = false;
    } else {
      isRemote = true;
    }


    console.log("-- assets", assets, items);

  }
  // $: if ( content && content.childrenSet.edges ) {
  //   let tmp = content.childrenSet.edges.filter((edge) => edge.node.previewImage != null);
  //   hasPreviewitems = ( tmp.length > 0 ) && ( tmp.length == content.childrenSet.edges.length );
  //   console.log("-- hasPreviewitems", tmp.length, content.childrenSet.edges.length);
  // }
</script>

<style>

  article {
    font-size: 1.25rem;
  }

  article h1 {
    font-size: 2rem;
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

  .dd-flex {
    display: flex;
  }

  span[data-is-native] {
    display: block;
    text-transform: uppercase;
    color: #fff;
    padding: 0.25rem 1rem;
    margin: 0.25rem 0;
    flex-basis: 100%;
    font-size: 0.6em;
  }

  span[data-is-native="true"] {
    background: #568203;
  }

  span[data-is-native="false"] {
    background: goldenrod;
  }

</style>

{#if info}

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
        <i class="bi bi-file-text"></i>
        {info.title}
      </li>
    </ol>
  </nav>

  <article class="p-3 pt-0">
    <h1>
      <SpeciesHeader record={info} isHeading={true} isSpecies={isSpecies} />
      {#if info.facts}
        {#if info.facts.isNative == true}
          <span data-is-native="true">Native</span>
        {:else if info.facts.isNative == false}
          <span data-is-native="false">Introduced</span>
        {/if}
      {/if}
    </h1>

    <Container>
      {#if assets.length}
        <Row class="mb-3">
          <Carousel {items} bind:activeIndex ride={false}>
            <CarouselIndicators bind:activeIndex {items} />

            <div class="carousel-inner">
              {#each items as image, index}
                <CarouselItem bind:activeIndex itemIndex={index} class="dd-flex align-items-center justify-content-center bg-black">
                  <!-- <img src={image} class="d-block w-100" alt={`${assets[index].title} ${index + 1}`} /> -->
                  <Image style="max-height: 80vh; width: auto !important;" src={image} classes="d-block ww-100" alt={`${assets[index].title} ${index + 1}`} />
                </CarouselItem>
              {/each}
            </div>
            <CarouselControl direction="prev" bind:activeIndex {items} />
            <CarouselControl direction="next" bind:activeIndex {items} />
          </Carousel>
        </Row>
      {/if}
      <Row>
        <Accordion stayOpen>
          {#each info.content.sections as section, index}
            <AccordionItem active={index == 0}>
              <h2 class="fs-4" slot="header">{section.label}</h2>
              {@html section.fragment}
            </AccordionItem>
          {/each}
        </Accordion>
      </Row>
    </Container>

  </article>

{:else}
  <div class="alert alert-secondary" role="alert">
    This account is available <a target="_blank" href="https://animaldiversity.org/accounts/{id}/">online</a>.
  </div>
{/if}