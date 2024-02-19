import { FastifyInstance } from 'fastify';
import { voting } from '../../utils/voting_pub_sub';
import z from 'zod';

export async function pollResults(app: FastifyInstance) {
  app.get(
    '/polls/:pollId/results',
    { websocket: true },
    (connection, request) => {
      const paramSchema = z.object({ pollId: z.string().uuid() });

      const { pollId } = paramSchema.parse(request.params);

      voting.subscribe(pollId, (message) => {
        connection.socket.send(JSON.stringify(message));
      });
    }
  );
}
