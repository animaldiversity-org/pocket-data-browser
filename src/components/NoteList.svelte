<script>

  import { liveQuery } from "dexie";
  import { pocketDB } from '../lib/storage';
  import NoteManager from "../lib/NoteManager";

  import { Table, TabContent, TabPane } from 'sveltestrap';
  import { Col, Container, Row } from 'sveltestrap';
  import { Button, Icon } from 'sveltestrap';
  import {
    ButtonDropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle
  } from 'sveltestrap';

  import * as dayjs from 'dayjs';

  export let config;

  let notes = liveQuery(
    () => pocketDB.notesdb.where('deletedAt').equals('0000-00-00T00:00:00+0000').reverse().sortBy('createdAt')
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
      if ( activity ) {
        seen[activity] = true;
      }
    })
    config.activityData.forEach((activity) => {
      console.log(":::", activity);
      if ( seen[activity] ) {
        results.push(activity);
      }
    })
    return results;
  }

  $: possibleActivities = _filterPossibleActivities($notes || []);

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
      <h1>Notes</h1>
    </Col>
  </Row>
  <Row>
    <Col>
      <TabContent pills>
        <TabPane tabId="our-data" tab="Our Data" active>
          <form>
            <div class="row d-flex g-3 align-items-center justify-content-end">
              {#if possibleActivities.length}
                <div class="col-auto">
                  <ButtonDropdown>
                    <DropdownToggle color="secondary" caret class="btn-sm">
                      Filter by Activity
                    </DropdownToggle>
                    <DropdownMenu>
                      {#each possibleActivities as activity}
                        <DropdownItem>{activity}</DropdownItem>                    
                      {/each}
                    </DropdownMenu>
                  </ButtonDropdown>
                </div>
              {/if}
              <div class="col-auto">
                <button class="btn btn-secondary btn-sm">Download</button>
              </div>
            </div>
          </form>
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
                    <Button outline dark on:click={() => deleteNote(note.id)}>
                      <Icon name="trash" />
                    </Button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </Table>
        </TabPane>
        <TabPane tabId="example-data" tab="Example Data">

        </TabPane>
      </TabContent>
    </Col>
  </Row>
</Container>