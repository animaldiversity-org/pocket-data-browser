<script>
  import { db } from '../lib/db';
  import { meta } from 'tinro';
  const routeData = meta();

  import Image from './Image.svelte';

  const rootId = 579;
  let content;
  let hasPreviewImages = false;

  export let id = rootId;
  
  // $: id = $routeData.params.id || rootId;
  $: if ( $db ) {
    if ( ! id ) { id = rootId; }
    let stmt = $db.prepare(`SELECT * FROM nodes_topic WHERE id = :id`);
    let row = stmt.getAsObject({ ':id' : id });
    try {
      content = JSON.parse(row.content).topic;
    } catch(error) {
      console.log(error);
      console.log(id, row.content);
    }
  }
  $: if ( content && content.childrenSet.edges ) {
    let tmp = content.childrenSet.edges.filter((edge) => edge.node.previewImage != null);
    hasPreviewImages = ( tmp.length > 0 ) && ( tmp.length == content.childrenSet.edges.length );
    console.log("-- hasPreviewImages", tmp.length, content.childrenSet.edges.length);
  }
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

  .p-grid figure img {
    width: 100%;
  }

  .p-link {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-width: 40%;
  }

</style>

{#if content}
  {#if content.parent && id != rootId}
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <a href="/guide/{content.parent.nid}">Back</a>
        </li>
      </ol>
    </nav>
  {/if}

  <article>
    <h1>
      {#if content.title == 'Yes' || content.title == 'No'}
      {content.parent.title}: 
      {/if}
      {content.title}
    </h1>

    {#if content.content.sections}
      {#each content.content.sections as section}
        {#if section.label}
        <h2>{section.label}</h2>
        {/if}
        {#if section.fragment}
          {@html section.fragment}
        {/if}
        {#if section.images}
          <div class="p-grid shadow-sm">
            {#each section.images.edges as image}
              <figure>
                <Image style="max-height: 80vh; max-width: 100%; width: auto !important;" src={image.node.src} classes="d-block ww-100" alt={`${image.node.title}`} />
                <!-- <img src="{image.node.src}" alt="{image.node.title}" /> -->
                {#if image.node.caption}
                <figcaption>
                  {@html image.node.caption}
                </figcaption>
                {/if}
              </figure>
            {/each}
          </div>
        {/if}
      {/each}
    {/if}

    {#if false && content.childrenSet && content.childrenSet.edges}
      <div class="container mt-3">
        <div class="row">
          {#each content.childrenSet.edges as edge}
            <div class="col d-flex justify-content-center">
              <a href="/guide/{edge.node.nid}" class="d-block btn btn-lg btn-outline-dark">{edge.node.title}</a>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    {#if content.childrenSet && content.childrenSet.edges}
    <div class="container mt-3">
      <div class="row row-cols-1 row-cols-md-2 g-4">
        {#each content.childrenSet.edges as edge}
        <div class="col">
          <div class="card h-100">
            {#if hasPreviewImages && ! ( edge.node.title == 'Yes' || edge.node.title == 'No' )}
              <div style="height: 250px" class="d-flex justify-content-center align-items-center card-img-top p-2">
                {#if edge.node.previewImage }
                  <img src="{edge.node.previewImage.src}" class="x-card-img-top flex-grow-0 d-block" style="max-height: 100%" alt="" />              
                {/if}
              </div>
            {/if}
            <div class="card-body d-flex align-items-center justify-content-center">
              <a href="/guide/{edge.node.nid}" class="btn btn-lg btn-outline-dark flex-grow-1 d-flex justify-content-center align-items-center h-100">{edge.node.title}</a>
            </div>
          </div>
          </div>
        {/each}
      </div>
      </div>
    {/if}

  </article>

{:else}
<pre>ALAS WAITING FOR CONTENT</pre>
{/if}