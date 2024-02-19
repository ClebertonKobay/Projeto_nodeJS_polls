import fastify from 'fastify';
7;
import cookie from '@fastify/cookie';
import { createPoll } from './routes/create_polls';
import { getPoll } from './routes/get_poll';
import { voteOnPoll } from './routes/vote_on_poll';
import { fastifyWebsocket } from '@fastify/websocket';
import { pollResults } from './ws/poll_results';

const port = 3333;

const app = fastify();

app.register(cookie, {
  secret: 'mjhgfdswerçoijnbgyrfxzaqwer',
  hook: 'onRequest',
});


app.register(createPoll);
app.register(getPoll);
app.register(voteOnPoll);

app.register(fastifyWebsocket);
app.register(pollResults);

app
  .listen({
    port,
  })
  .then(() => {
    console.log(`Http server running on server ${port}`);
  });
