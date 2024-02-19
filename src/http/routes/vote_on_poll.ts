import z from 'zod';
import { randomUUID } from 'crypto';
import { FastifyInstance } from 'fastify';
import { prisma } from '../../lib/prisma';
import { redis } from '../../lib/redis';
import { voting } from '../../utils/voting_pub_sub';

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

        const votes = await redis.zincrby(pollId, -1, userPreviousVoteOnPoll.pollOptionId);

        voting.publish(pollId, {
          pollOptionId: userPreviousVoteOnPoll.pollOptionId,
          votes: Number(votes),
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

    const votes = await redis.zincrby(pollId, 1, pollOptionId);

    voting.publish(pollId, {
      pollOptionId,
      votes: Number(votes),
    });

    return response.status(201).send();
  });
}
