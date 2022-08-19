<script>
  import { imageDB } from '../lib/imageDB';
  export let src;
  export let classes = null;
  export let style = null;
  export let alt = '';

  let data;
  let imageSrc;

  $: if ( $imageDB ) {
    let idx = src.indexOf('images/')
    let image_src = src.substring(idx);
    console.log('-- image', image_src);
    let stmt = $imageDB.prepare(`SELECT * FROM nodes_images WHERE image_src = :image_src`);
    let row = stmt.getAsObject({ ':image_src' : image_src });
    if ( row.data === undefined ) {
      console.log('-- Image 404', src, image_src);
      imageSrc = navigator.onLine ? src : null;
    } else {
      const decoder = new TextDecoder();
      data = decoder.decode(row.data);
      imageSrc = ( false && navigator.onLine ) ? src : `data:image/jpeg;base64,${data}`;
    }
    // console.log("-- Image", data, src, global_id);
  }
</script>

<style>
  svg {
    height: 64px;
    width: 64px;
    opacity: 0.25;
  }

  img {
    padding: 0.5rem;
  }

  img[data-online="true"] {
    border: 1px solid green;
  }

  img[data-online="false"] {
    border: 1px solid orange;
  }
</style>

{#if imageSrc}
<img data-online={navigator.onLine} src={imageSrc} {style} class={classes} {alt}/>
{:else}
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-card-image" viewBox="0 0 16 16">
  <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
  <path d="M1.5 2A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13zm13 1a.5.5 0 0 1 .5.5v6l-3.775-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12v.54A.505.505 0 0 1 1 12.5v-9a.5.5 0 0 1 .5-.5h13z"/>
</svg>
{/if}
