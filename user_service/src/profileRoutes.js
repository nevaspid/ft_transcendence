import { updateUserAvatar } from './usersService.js';

export default async function profileRoutes(fastify) {
  fastify.patch('/api/profile/avatar', {

    preHandler: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['avatar_url'],
        properties: {
          avatar_url: { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      const userId = request.user.id;
      const { avatar_url } = request.body;
        console.log('Avatar reçu:', avatar_url);
      if (!(avatar_url.startsWith('/avatars/') || avatar_url.startsWith('/uploads/choices/'))) {
        return reply.status(400).send({ error: 'Avatar invalide' });
        }

      try {
        await updateUserAvatar(userId, avatar_url);
        return reply.send({ avatarUrl: avatar_url });
      } catch (err) {
        request.log.error(err);
        return reply.status(500).send({ error: 'Erreur serveur' });
      }
    }
  });
}
