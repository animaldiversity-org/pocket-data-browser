<script>

  import { liveQuery } from "dexie";
  import { indexedDB } from '../lib/indexedDB';
  import NoteManager from "../lib/NoteManager";

  import { Table } from 'sveltestrap';
  import { Col, Container, Row } from 'sveltestrap';
  import { Button, Icon } from 'sveltestrap';

  let notes = liveQuery(
    () => indexedDB.notesdb.where('deleted').equals('false').reverse().sortBy('datetime')
  );

  function deleteNote(uuid) {
    if ( window.confirm("Are you sure you want to delete this note?") ) {
      console.log("-- deleting", uuid);
      NoteManager.deleteNote(uuid);
    }
  }
  
  function _formatDate(datetime) {
    let date = new Date(datetime);
    // return date.toLocaleString();
    let hh = date.getHours();
    let ampm = 'AM';
    if ( hh > 12 ) {
      ampm = 'PM';
      hh -= 12;
    }
    let mm = date.getMinutes();
    return `${date.toLocaleDateString()}<br />${hh}:${mm} ${ampm}`;
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
      <Table striped hover>
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
              <td class="td--date">{@html _formatDate(note.datetime)}</td>
              <td style="white-space: nowrap">
                <Button outline dark href="/notes/{note.uuid}">
                  <Icon name="pencil-square" />
                </Button>
                <Button outline dark on:click={() => deleteNote(note.uuid)}>
                  <Icon name="trash" />
                </Button>
              </td>
            </tr>
          {/each}
        </tbody>
      </Table>
    </Col>
  </Row>
</Container>