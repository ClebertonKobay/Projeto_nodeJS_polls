import fastify from 'fastify';
7;
import cookie from '@fastify/cookie';
import { createPoll } from './routes/create_polls';
import { getPoll } from './routes/get_poll';
import { voteOnPoll } from './routes/vote_on_poll';

const port = 3333;

const app = fastify();

app.register(cookie, {
  secret: 'mjhgfdswerçoijnbgyrfxzaqwer',
  hook: 'onRequest',
});

app.register(createPoll);
app.register(getPoll);
app.register(voteOnPoll);

app
  .listen({
    port,
  })
  .then(() => {
    console.log(`Http server running on server ${port}`);
  });
