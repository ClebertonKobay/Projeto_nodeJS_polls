import fastify from 'fastify';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { createPoll } from './routes/create_polls';
import { getPoll } from './routes/get_poll';

const port = 3333;

const app = fastify();

app.register(createPoll);
app.register(getPoll);

app
  .listen({
    port,
  })
  .then(() => {
    console.log(`Http server running on server ${port}`);
  });
