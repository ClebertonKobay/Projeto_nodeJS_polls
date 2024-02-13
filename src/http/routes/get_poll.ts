import z from 'zod';
import { prisma } from '../../lib/prisma';
import { FastifyInstance } from 'fastify';

export async function getPoll(app: FastifyInstance) {
  app.get('/polls/:pollId', async (request, response) => {
    const paramSchema = z.object({
      pollId: z.string().uuid(),
    });

    const { pollId } = paramSchema.parse(request.params);

    const poll = await prisma.poll.findUniqueOrThrow({
      where: {
        id: pollId,
      },
      include: {
        options: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return response.status(200).send(poll);
  });
}
