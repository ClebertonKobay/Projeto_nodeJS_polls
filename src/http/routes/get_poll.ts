import z, { object, string } from 'zod';
import { prisma } from '../../lib/prisma';
import { FastifyInstance } from 'fastify';
import { redis } from '../../lib/redis';

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

    if (!poll) {
      return response.status(400).send({ message: 'Poll not found' });
    }

    const result = await redis.zrange(pollId, 0, -1, 'WITHSCORES');

    const votes = result.reduce((obj, value, index) => {
      if (index % 2 === 0) {
        const score = result[index + 1];
        Object.assign(obj, { [value]: score });
      }
      return obj;
    }, {} as Record<string, number>);

    return response.status(200).send({
      poll: {
        id: poll.id,
        title: poll.title,
        options: poll.options.map((option) => {
          return {
            id: option.id,
            title: option.title,
            score: option.id in votes ? votes[option.id] : 0,
          };
        }),
      },
    });
  });
}
