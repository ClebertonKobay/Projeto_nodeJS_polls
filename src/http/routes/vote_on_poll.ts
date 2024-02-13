import z from 'zod';
import { prisma } from '../../lib/prisma';
import { FastifyInstance } from 'fastify';

export async function voteOnPoll(app: FastifyInstance) {
  app.post('/polls/:pollId/votes', async (request, response) => {
    const paramSchema = z.object({
      pollId: z.string().uuid(),
    });

    const bodySchema = z.object({
      pollOptionId: z.string().uuid(),
    });
    
    const { pollOptionId } = bodySchema.parse(request.body);
    
    const { pollId } = paramSchema.parse(request.params);

    
  });
}
