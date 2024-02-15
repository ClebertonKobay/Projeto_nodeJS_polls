import z from 'zod';
import { randomUUID } from 'crypto';
import { FastifyInstance } from 'fastify';
import { prisma } from '../../lib/prisma';

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

    let { sessionId } = request.cookies;

    if (sessionId) {
      const userPreviousVoteOnPoll = await prisma.vote.findUnique({
        where: {
          sessionId_pollId: {
            sessionId,
            pollId,
          },
        },
      });

      if (
        userPreviousVoteOnPoll &&
        userPreviousVoteOnPoll.pollOptionId !== pollOptionId
      ) {
        await prisma.vote.delete({
          where: {
            id: userPreviousVoteOnPoll.id,
          },
        });
      } else if (userPreviousVoteOnPoll) {
        return response.status(400).send('You already voted on this poll!');
      }
    }

    if (!sessionId) {
      sessionId = randomUUID();

      response.setCookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, //30 dias
        signed: true,
        httpOnly: true,
      });
    }

    await prisma.vote.create({
      data: {
        sessionId,
        pollId,
        pollOptionId,
      },
    });

    return response.status(201).send();
  });
}
