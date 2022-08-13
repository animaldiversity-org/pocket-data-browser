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
      console.log('-- Image 404', src);
      imageSrc = src;
    } else {
      const decoder = new TextDecoder();
      data = decoder.decode(row.data);
      imageSrc = `data:image/jpeg;base64,${data}`;
    }
    // console.log("-- Image", data, src, global_id);
  }
</script>

<img src={imageSrc} {style} class={classes} {alt}/>