<script>

  import { liveQuery } from "dexie";
  import { pocketDB } from '../lib/storage';
  import NoteManager from "../lib/NoteManager";

  import { Table } from 'sveltestrap';
  import { Col, Container, Row } from 'sveltestrap';
  import { Button, ButtonGroup, Icon } from 'sveltestrap';
  import {
    ButtonDropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle
  } from 'sveltestrap';

  import dayjs from 'dayjs';
  import utc from 'dayjs/plugin/utc.js';
  dayjs.extend(utc);

  export let config;
  export let token;

  // initial value
  let username = sessionStorage.getItem('selectedUsername') || token.username;
  let selectedActivity = null;

  let queries = {};
  queries[token.username] = liveQuery(
    () =>  pocketDB.notesdb
            .where('deletedAt').equals('0000-00-00T00:00:00+0000')
            .and((v) => v.owner == username)
            .reverse()
            .sortBy('createdAt')
  );

  queries.demo = liveQuery(
    () =>  pocketDB.notesdb
            .where('deletedAt').equals('0000-00-00T00:00:00+0000')
            .and((v) => v.owner == 'demo')
            .reverse()
            .sortBy('createdAt')
  );

  function deleteNote(uuid) {
    if ( window.confirm("Are you sure you want to delete this note?") ) {
      console.log("-- deleting", uuid);
      NoteManager.deleteNote(uuid);
    }
  }
  
  function _formatDate(datetime) {
    let date = new Date(datetime);
    return dayjs(date).format('MM/DD/YYYY') + '<br />' + dayjs(date).format('hh:mm A');
  }

  function _formatObserver(observers) {
    let html = '<ul class="list-unstyled">';
    observers.forEach((v) => {
      let tmp = v.split('@');
      html += `<li>${tmp[0]}</li>`;
    })
    html += '</ul>';
    return html;
  }

  function _filterPossibleActivities(notes) {
    let results = [];
    let seen = {};
    console.log("-- possibleActivities", notes);
    notes.forEach((note) => {
      let activity = note.activity;
      console.log("--", activity);
      if ( activity && activity != '-- no activity --' ) {
        if ( ! seen[activity] ) {
          results.push(activity);
        }
        seen[activity] = true;
      }
    })
    results.sort();
    return results;

    // config.activityData.forEach((activity) => {
    //   console.log(":::", activity);
    //   if ( seen[activity] ) {
    //     results.push(activity);
    //   }
    // })
    // return results;
  }

  function selectActivity(event) {
    selectedActivity = event.target.dataset.value;
  }

  function _filterActivities(notes, activity) {
    if ( activity == null ) { return notes; }
    // return $notes.filter((v) => v.activity == activity);
  }

  function selectUsername(event) {
    username = event.target.value;
    selectedActivity = null;
    sessionStorage.setItem('selectedUsername', username);
  }

  function downloadNotes(event) {
    event.preventDefault();
    NoteManager.downloadNotes(selectedActivity, username);
  }

  $: notes = queries[username];
  $: possibleActivities = _filterPossibleActivities($notes || []);
  $: backstageLink = `/backstage?workspace_slug=${( username == 'demo' ) ? 'demo' : token.currentWorkspace}`;

</script>

<style>
  .td--date {
    white-space: nowrap;
  }

  table {
    font-size: 0.875rem;
  }

  /* .fs-0_75 {
    font-size: 0.75em;
  } */
</style>

<Container>
  <Row>
    <Col>
      <h1>Notes: {username}</h1>
    </Col>
  </Row>
  <Row>
    <Col>
      <ButtonGroup>
        <input on:change={selectUsername} type="radio" class="btn-check" name="btnradio" id="btn-our-data" autocomplete="off" value={token.username} checked={token.username == username}>
        <label class="btn btn-outline-primary" for="btn-our-data">Our Data</label>

        <input on:change={selectUsername} type="radio" class="btn-check" name="btnradio" id="btn-example-data" value={'demo'} checked={'demo' == username} autocomplete="off">
        <label class="btn btn-outline-primary" for="btn-example-data">Example Data</label>
      </ButtonGroup>
    </Col>
  </Row>
  <Row>
    <Col>
      <form>
        <div class="row d-flex g-3 align-items-center justify-content-end">
          {#if possibleActivities.length}
            <div class="col-auto">
              <ButtonDropdown>
                <DropdownToggle color="secondary" outline caret class="btn-sm text-dark">
                  {#if selectedActivity}
                  <Icon name="filter-square-fill" />
                  {:else}
                  <Icon name="filter-square" />
                  {/if}
                  <span class="mx-1">Filter by Activity</span>
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem on:click={selectActivity}>All Activities</DropdownItem>
                  <DropdownItem divider />
                  {#each possibleActivities as activity}
                    <DropdownItem on:click={selectActivity} data-value={activity}>{activity}</DropdownItem>                    
                  {/each}
                </DropdownMenu>
              </ButtonDropdown>
            </div>
          {/if}
          <div class="col-auto">
            {#if navigator.onLine !== false}
              <button class="btn btn-secondary btn-sm" on:click={downloadNotes}>Download</button>
              <!-- <a tinro-ignore href={backstageLink} class="btn btn-secondary btn-sm">Download</a> -->
            {/if}
          </div>
        </div>
      </form>
      <div class="table-responsive">
        <Table striped hover class="mt-3">
          <thead class="table-dark">
            <tr>
              <!-- <th>#</th> -->
              <th>Activity</th>
              <th>Summary</th>
              <th>Observers</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody class="table-group-divider">
            {#each ($notes || []) as note, noteIdx}
              {#if selectedActivity == null || selectedActivity == note.activity}
              <tr>
                <!-- <th scope="row">
                  {noteIdx}
                </th> -->
                <td>
                  {#if ! note.activity || note.activity == '-- no activity --'}
                    -
                  {:else}
                    {note.activity}
                  {/if}
                </td>
                <td>{note.summary}</td>
                <td class="fs-0_75">{@html _formatObserver(note.observers)}</td>
                <td class="td--date">{@html _formatDate(note.createdAt)}</td>
                <td style="white-space: nowrap">
                  <Button outline dark href="/notes/{note.id}">
                    <Icon name="pencil-square" />
                  </Button>
                  {#if note.owner == token.username}
                    <Button outline dark on:click={() => deleteNote(note.id)}>
                      <Icon name="trash" />
                    </Button>
                  {/if}
                </td>
              </tr>
              {/if}
            {/each}
          </tbody>
        </Table>
      </div>
    </Col>
  </Row>
</Container>