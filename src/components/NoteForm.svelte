<script>
  import { each } from 'svelte/internal';

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

  let rosterData = [
    'sightsurvival@univhigh.edu',
    'suspectnuclear@univhigh.edu',
    'everyseedling@univhigh.edu',
    'penaltyheartpulse@univhigh.edu',
    'mottledfeet@univhigh.edu',
    'seafowlrecently@univhigh.edu',
    'helicoptertreatment@univhigh.edu',
    'leopardbellbottoms@univhigh.edu',
    'santandershotput@univhigh.edu',
    'greetingssaving@univhigh.edu',
    'soychannel@univhigh.edu',
    'agitateddove@univhigh.edu',
    'fallaciousgrowl@univhigh.edu',
    'twangbeetroot@univhigh.edu',
    'watchfulrugby@univhigh.edu',
    'competingbegan@univhigh.edu',
    'pelvisfluttering@univhigh.edu',
    'itselfvirtue@univhigh.edu',
    'adoredcoati@univhigh.edu',
    'framerich@univhigh.edu',
    'spothandsomely@univhigh.edu',
    'whooshcrackers@univhigh.edu',
    'frockmedial@univhigh.edu',
    'velvetymanner@univhigh.edu',
    'softballlibrarian@univhigh.edu',
    'tensesaw@univhigh.edu',
    'keyboardluminous@univhigh.edu',
    'surferpackage@univhigh.edu',
    'tadayearly@univhigh.edu',
    'slicesafety@univhigh.edu',
    'tattereddivulge@univhigh.edu',
    'murmuruniform@univhigh.edu',
    'unrulyvenomous@univhigh.edu',
    'wishpopulate@univhigh.edu',
    'pullovereventually@univhigh.edu',
    'startcomedy@univhigh.edu',
    'cavernoustubby@univhigh.edu',
    'workseight@univhigh.edu',
    'gracefitzroy@univhigh.edu',
    'hivetrained@univhigh.edu',
    'putridsurround@univhigh.edu',
    'perfumedphantom@univhigh.edu',
    'sharpaccess@univhigh.edu',
    'blackstonefinancial@univhigh.edu',
    'immigratebonehead@univhigh.edu',
    'resulttranquil@univhigh.edu',
    'layertired@univhigh.edu',
    'scarletlollies@univhigh.edu',
    'individualmews@univhigh.edu',
    'cerebellumoutcome@univhigh.edu',
  ];
  rosterData.sort();

  let activityList = [
    '-- no activity --',
    'Schoolyard Observation #1',
    'Schoolyard Observation #2',
    'Schoolyard Observation #3',
  ]

  let noteSchema = [
    { name: 'animalName', label: 'What kind of animal do you think this is?', component: Input, placeholder: 'Crow, squirrel, etc.', args: { type: 'textarea' } },
    { name: 'images', label: 'Can you take a picture?', component: 'Input', placeholder: 'Upload a photo', args: { type: 'file' }, inactive: true },
    { name: 'description', label: 'How would you describe the animal?', placeholder: 'How many legs, wings, colors, etc.?', component: Input, args: { type: 'textarea' } },
    { name: 'animalActions', label: 'What is the animal doing?', placeholder: 'Moving, eating, hiding, etc.?', component: Input, args: { type: 'textarea' } },
    { name: 'weatherDescription', label: 'What is the weather like?', placeholder: 'Temperature, precipitation, sunshine, etc.', component: Input, args: { type: 'textarea' } },
    { name: 'animalHabitat', label: 'In what kind of habitat did you observe the animal?', placeholder: 'Grasses, forest, pond, etc.?', component: Input, args: { type: 'textarea' } },
    { name: 'locationDescription', label: 'Where specifically did you observe the animal?', placeholder: 'Under a leaf, on a flower, on the ground, etc.?', component: Input, args: { type: 'textarea' } },
    { name: 'animalCount', label: 'How many animals did you observe?', component: Input, placeholder: "0", help: 'Enter a number, 0-100', args: { type: 'number', min: 0, max: 100 } },
    { name: 'timeOfDay', label: 'What time of day did you observe the animal?', component: Input, args: { type: 'datetime-local' } },
  ]

  let blankNote = {
    'summary': '',
    'datetime': false,
    'activity': '-- no activity --',
    'observers': [],
    'lastSynced': false,
    'deleted': false,
    'data': {
      'observers': [],
      'animalName': '',
      'images': [],
      'description': '',
      'animalActions': '',
      'weatherDescription': '',
      'animalHabitat': '',
      'locationDescription': '',
      'animalCount': 0,
      'timeOfDay': null
    }
  }

  if (location.hostname == 'localhost') {
    blankNote.data.animalName = 'wombat';
    blankNote.data.description = 'furry, squat';
    blankNote.data.animalActions = 'pooping';
    blankNote.data.weatherDescription = 'sunny, hot';
    blankNote.data.animalHabitat = 'scrub';
    blankNote.data.locationDescription = 'ground';
    blankNote.data.animalCount = 1;
    blankNote.data.timeOfDay = '2022-06-26T15:20:00';
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
      intialized = true;
      console.log("-- have note", note);
    });
  }

  let observers;
  let images;
  let processedFiles = {};
  let files;
  let selectedActivity;

  $: if ( intialized ) {
    observers = note.data.observers;
    images = note.data.images;
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
    summary.push(note.data.animalName.replace(/\n+/g, ' ').replace(/ +/g, ' '));
    if ( note.data.animalCount > 0 ) {
      summary.push(`(${note.data.animalCount})`);
    }
    note.summary = summary.join(" ");
    note.datetime = note.data.timeOfDay;
    note.observers = note.data.observers;
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
      <Col>
        <Accordion class="mb-3">
          <AccordionItem on:toggle={resortObservers}>
            <div slot="header">
              <h2 class="h4">Who are the observers?</h2>
              {#if observers.length}
                <div class="m-1 p-1" data-slot="observers">{observers.join('; ')}</div>
              {/if}
            </div>
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
                {#each activityList as activityItem}
                  <Button outline dark active={activityItem == selectedActivity} on:click={selectActivity}>{activityItem}</Button>
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
              <AccordionItem>
                <div slot="header">
                  <h2 class="h4">{field.label}</h2>
                </div>
                <FormGroup>
                  <Input type="file" accept="image/*" aria-label="Select files" placeholder={field.placeholder} bind:files />
                </FormGroup>
                {#if images}
                  <div style="display: flex; gap: 1rem; flex-wrap: wrap">
                  {#each images as image, imageIdx}
                    <Card class="mb-3" style="width: 25vw">
                      <CardBody>
                        <Image thumbnail alt="an upload" src={image} style="display: block; width: 25vw; margin-bottom: 0.5rem;" />
                        <Button size="sm" outline secondary on:click={() => removeImage(imageIdx)}>Delete</Button>
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
              <svelte:component id={'field-' + field.name} this={field.component} placeholder={field.placeholder} bind:value={note.data[field.name]} {...field.args} />
              {#if field.help}
                <FormText>{field.help}</FormText>
              {/if}
            </FormGroup>
          {/if}
        </Col>
      </Row>
    {/each}
    <Row>
      <Col>
        <Button color="primary" size="lg" on:click="{saveChanges}">Save</Button>
      </Col>
    </Row>
  </Container>
</Form>
<canvas id="preview" width="1024" height="1024"></canvas>
{:else}
<pre>Initializing form... {intialized}</pre>
{/if}
