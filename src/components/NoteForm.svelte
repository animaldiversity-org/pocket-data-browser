<script>
  import { each } from 'svelte/internal';
  import { onMount } from 'svelte';

  import dayjs from 'dayjs';
  import utc from 'dayjs/plugin/utc.js';
  dayjs.extend(utc);

  import { Accordion, AccordionItem, Button, ButtonGroup } from 'sveltestrap';
  import { Form, FormGroup, Input, Label, FormText } from 'sveltestrap';
  import { ListGroup, ListGroupItem } from 'sveltestrap';
  import { Card, CardBody, Image } from 'sveltestrap';
  import { Col, Container, Row } from 'sveltestrap';

  import { Canvas, Layer } from 'svelte-canvas';

  import NoteManager from '../lib/NoteManager.js';

  import { meta, router } from 'tinro';
  const routeData = meta();

  export let noteId = "false";
  export let message;
  export let config;
  export let token;

  let rosterData;
  let activityList;
  let isReadOnly = false;
  let isEditable = true;

  $: rosterData = config ? config.rosterData : [];
  $: activityList = config ? config.activityData : [];

  let noteSchema = [
    { name: 'animalName', label: 'What kind of animal do you think this is?', component: Input, placeholder: 'Crow, squirrel, etc.', args: { type: 'textarea' } },
    { name: 'images', label: 'Can you take a picture?', component: 'Input', placeholder: 'Upload a photo', args: { type: 'file' }, inactive: true },
    { name: 'description', label: 'How would you describe the animal?', placeholder: 'How many legs, wings, colors, etc.?', component: Input, args: { type: 'textarea' } },
    { name: 'animalActions', label: 'What is the animal doing?', placeholder: 'Moving, eating, hiding, etc.?', component: Input, args: { type: 'textarea' } },
    { name: 'weatherDescription', label: 'What is the weather like?', placeholder: 'Temperature, precipitation, sunshine, etc.', component: Input, args: { type: 'textarea' } },
    { name: 'animalHabitat', label: 'In what kind of habitat did you observe the animal?', placeholder: 'Grasses, forest, pond, etc.?', component: Input, args: { type: 'textarea' } },
    { name: 'locationDescription', label: 'Where specifically did you observe the animal?', placeholder: 'Under a leaf, on a flower, on the ground, etc.?', component: Input, args: { type: 'textarea' } },
    { name: 'animalCount', label: 'How many animals did you observe?', component: Input, placeholder: "0", help: 'Enter a number, 0-100', args: { type: 'number', min: 0, max: 100 } },
    { name: 'observedAt', label: 'What time of day did you observe the animal?', component: Input, args: { type: 'datetime-local' } },
  ]

  let blankNote = {
    'summary': '',
    'createdAt': false,
    'activity': '-- no activity --',
    'observers': [],
    'lastSynced': '0000-00-00T00:00:00+0000',
    'deletedAt': '0000-00-00T00:00:00+0000',
    'content': {
      'observers': [],
      'animalName': '',
      'images': [],
      'description': '',
      'animalActions': '',
      'weatherDescription': '',
      'animalHabitat': '',
      'locationDescription': '',
      'animalCount': 0,
      'observedAt': null
    }
  }

  if (location.hostname == 'localhost') {
    blankNote.content.animalName = 'wombat';
    blankNote.content.description = 'furry, squat';
    blankNote.content.animalActions = 'pooping';
    blankNote.content.weatherDescription = 'sunny, hot';
    blankNote.content.animalHabitat = 'scrub';
    blankNote.content.locationDescription = 'ground';
    blankNote.content.animalCount = 1;
    // blankNote.content.observedAt = '2022-06-26T15:20:00';
  }

  console.log("-- routeData", $routeData, noteId);
  let note;
  $: intialized = false;
  // $: noteId = $routeData.params.uuid || $routeData.pattern;
  if ( noteId == 'blank' ) {
    note = JSON.parse(JSON.stringify(blankNote));
    console.log("-- blank note", $routeData.params, note);
    setTimeout(() => { intialized = true; }, 0);
    intialized = true;
  } else if ( true || ! intialized ) {
    console.log("-- have note uuid", noteId);
    NoteManager.getNote(noteId).then((data) => {
      note = data;
      if ( note.content.timeOfDay ) {
        let parts = note.createdAt.split(/[ \+]/);
        let time = note.content.timeOfDay.split(/[ :]/);
        let ampm = time.pop();
        if ( ampm == 'PM' ) { time[0] = parseInt(time[0], 10) + 12; }
        // note.content.observedAt = parts[0] + ' ' + note.content.timeOfDay + '+' + parts.pop();
        note.content.observedAt = `${parts[0]} ${time[0]}:${time[1]}:00`;
        console.log('-- synthesized', note.content.observedAt);
      }
      intialized = true;
      isReadOnly = note.owner != token.username;
      isEditable = ! isReadOnly;
      console.log("-- have note", note);
    });
  }

  let observers;
  let images;
  let processedFiles = {};
  let files;
  let selectedActivity;

  $: if ( intialized ) {
    observers = note.content.observers || note.observers;
    images = note.content.images;
    selectedActivity = note.activity;
  }
  
  let removeImage = function(imageIdx) {
    images.splice(imageIdx, 1);
    images = images;
  }

  let addObserver = function(event) {
    let observer = event.target.textContent;
    let idx = observers.indexOf(observer);
    if ( idx > -1 ) {
      observers.splice(idx, 1);
    } else {
      observers.push(event.target.textContent);
    }
    observers = observers;
    console.log('--', observers.join(';'));
  }

  let selectActivity = function(event) {
    event.preventDefault();
    selectedActivity = event.target.textContent;
    note.activity = selectedActivity;
    console.log("--!", selectedActivity, event.target.textContent);
  }

  let resortObservers = function(event) {
    let open = event.detail;
    if ( open === false && observers.length ) {
      // toggling close, so resort the observers list to put
      // put the observed first
      console.log('-- sorting');
      rosterData.sort((a, b) => { 
        console.log("--?", a, b, observers.indexOf(a), observers.indexOf(b));
        let aIdx = observers.indexOf(a);
        let bIdx = observers.indexOf(b);
        if ( aIdx > -1 && bIdx > -1 ) {
          return a == b ? 0 : 
            a > b ? 1 : 0;
        }
        return aIdx == bIdx ? (
          a > b ? 1 : 0
          ) : 
          aIdx > bIdx ? -1 : 1;
      });
      rosterData = rosterData;
    }
  }

  async function saveChanges(event) {
    event.preventDefault();
    // do some validation

    // set the summary
    let summary = [];
    // if ( note.activity != '-- no activity --' ) {
    //   summary.push(note.activity);
    // }
    summary.push(note.content.animalName.replace(/\n+/g, ' ').replace(/ +/g, ' '));
    if ( note.content.animalCount > 0 ) {
      summary.push(`(${note.content.animalCount})`);
    }
    let observedAt = note.content.observedAt || (new Date);
    observedAt = new Date(observedAt);

    note.content.observedAt = dayjs(observedAt).format('YYYY-MM-DDTHH:mm:ss');
    note.summary = summary.join(" ");
    note.createdAt = dayjs(observedAt).utc().format('YYYY-MM-DDTHH:mm:ssZZ');
    note.observers = note.content.observers;
    note.activity = selectedActivity;
    let results = await NoteManager.saveNote(note);
    console.log("-- saveChanges", note, results);
    router.goto('/notes');
  }

  let searchTerm = '';
  $: filterExpr = new RegExp(searchTerm);
  $: filteredRosterData = rosterData.filter(item => item.match(filterExpr));

  $: if ( files ) {
    console.log("-- files", files);
    for(const file of files) {
      if ( processedFiles[file.name] ) { continue; }
      processedFiles[file.name] = true;
      const reader = new FileReader();
      let img = new window.Image();
      reader.addEventListener("load", function (e) {
        let canvas = document.querySelector('#preview');
        img.addEventListener('load', function(event) {
          let width = img.width; let height = img.height; 
          if ( width > height ) {
            height = height * ( 1024 / width );
            width = 1024;
          } else {
            width = width * ( 1024 / height );
            height = 1024;
          }

          canvas.width = width;
          canvas.height = height;

          let ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          images.push(canvas.toDataURL('image/jpeg'));
          images = images;
        });
        img.src = e.target.result;
        // images.push(reader.result);
        // images = images;
      });
      reader.readAsDataURL(file);
    }
    files = '';
  }

  onMount(() => {
    console.log("-- NoteForm mounted", config);
	});

</script>

<style>
  canvas {
    height: 1px;
    width: 1px;
  }
</style>

{#if intialized}
<Form>
  <Container>
    <Row class="mb-1">
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item">
            <a href="/notes/">Notes</a>
          </li>
        </ol>
      </nav>
    </Row>
    <Row class="mb-1">
      <Col>
        <Accordion class="mb-3">
          <AccordionItem on:toggle={resortObservers} disadbled={isReadOnly}>
            <div slot="header">
              <h2 class="h4">Who are the observers?</h2>
              {#if observers.length}
                <div class="m-1 p-1" data-slot="observers">{observers.join('; ')}</div>
              {/if}
            </div>
            {#if isEditable}
            <div>
                <FormGroup>
                  <Label for="searchRoster">Find observer</Label>
                  <Input 
                    type="text" 
                    name="searchRoster" 
                    id="searchRoster" 
                    placeholder="Type username"
                    bind:value={searchTerm} />
                </FormGroup>
                <FormText>Select an observer from the list.</FormText>
                <ListGroup style="max-height: 50vh; overflow: auto">
                  {#each filteredRosterData as observer}
                    <ListGroupItem tag="button" action on:click={addObserver} active={observers.indexOf(observer) > -1}>{observer}</ListGroupItem>            
                  {/each}
                </ListGroup>
            </div>
            {/if}
          </AccordionItem>
        </Accordion>
      </Col>
    </Row>
    <Row class="mb-1">
      <Col>
        <Accordion>
            <AccordionItem>
              <div slot="header">
                <h2 class="h4">Is this for an activity? <span class="badge bg-info text-dark">Optional</span></h2>
                {#if selectedActivity != '-- no activity --'}
                  <div class="m-1 p-1" data-slot="selectedActivity">{selectedActivity}</div>
                {/if}
              </div>
              <ButtonGroup vertical style="width: 100%">
                <Button outline color='dark' active={'-- no activity --' == selectedActivity} disabled={isReadOnly} on:click={selectActivity}>-- no activity --</Button>
                {#each activityList as activityItem}
                  <Button outline color='dark' active={activityItem == selectedActivity} disabled={isReadOnly} on:click={selectActivity}>{activityItem}</Button>
                {/each}
              </ButtonGroup>
            </AccordionItem>
        </Accordion>
      </Col>
    </Row>
    {#each noteSchema as field}
      <Row>
        <Col class="p-3">
          {#if field.args.type == 'file'}
            <Accordion>
              <AccordionItem active={images.length > 0}>
                <div slot="header">
                  <h2 class="h4">{field.label}</h2>
                </div>
                {#if isEditable}
                  <FormGroup>
                    <Input type="file" accept="image/*" aria-label="Select files" placeholder={field.placeholder} bind:files />
                  </FormGroup>
                {/if}
                {#if images}
                  <div style="display: flex; gap: 1rem; flex-wrap: wrap">
                  {#each images as image, imageIdx}
                    <Card class="mb-3" style="width: 25vw">
                      <CardBody>
                        <Image thumbnail alt="an upload" src={image.src ? image.src : image} style="display: block; width: 25vw; margin-bottom: 0.5rem;" />
                        {#if isEditable}
                          <Button size="sm" outline secondary on:click={() => removeImage(imageIdx)}>Delete</Button>
                        {/if}
                      </CardBody>
                    </Card>
                  {/each}
                  </div>
                {/if}
              </AccordionItem>
            </Accordion>
          {:else}
            <FormGroup class="form-group">
              <Label for={'field-' + field.name} class="h4 fs-4">{field.label}</Label>
              <svelte:component id={'field-' + field.name} this={field.component} placeholder={field.placeholder} disabled={isReadOnly} bind:value={note.content[field.name]} {...field.args} />
              {#if field.help}
                <FormText>{field.help}</FormText>
              {/if}
            </FormGroup>
          {/if}
        </Col>
      </Row>
    {/each}
    {#if isEditable}
    <Row>
      <Col>
        <Button color="primary" size="lg" on:click="{saveChanges}">Save</Button>
      </Col>
    </Row>
    {/if}
  </Container>
</Form>
<canvas id="preview" width="1024" height="1024"></canvas>
{:else}
<pre>Initializing form... {intialized}</pre>
{/if}
