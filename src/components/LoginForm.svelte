<script>
  
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();


  import { Col, Container, Row } from 'sveltestrap';
  import { FormGroup, Form, Label, Input, Button, Icon } from 'sveltestrap';

  import AuthManager from '../lib/AuthManager';

  let username;
  let password;

  async function handleSubmit() {
    let token = await AuthManager.login(username, password);
    console.log('-- LoginForm', token);
    dispatch('auth', { token: token });
  }

</script>

<style>

</style>

<Container>
    <Row>
    <Col>
      <h1>Log in</h1>
    </Col>
  </Row>
  <Row>
    <Col>
      <form on:submit|preventDefault={handleSubmit}>
        <FormGroup>
          <Label for="username">E-Mail Address / Username</Label>
          <Input 
            type="text" 
            name="username" 
            id="username" 
            autocapitalize="none"
            bind:value={username} />
        </FormGroup>
        <FormGroup>
          <Label for="password">Password</Label>
          <Input 
            type="password" 
            name="password" 
            id="password"
            autocapitalize="none"
            bind:value={password} />
        </FormGroup>
        <Button color="primary" size="lg">Submit</Button>
      </form>
    </Col>
  </Row>
  <!-- <Row>
    <Col>
      <p class="mt-5">
        <a href="/forgot-password">Forgot password?</a>
      </p>
    </Col>
  </Row> -->
</Container>