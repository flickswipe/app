import { User } from '../models/user';

const ENFORCED_MAX_QUEUE_LENGTH = 50;

export async function getNextUserToProcess(
  opts: {
    maxQueueLength?: number;
  } = {}
): Promise<{
  id: string;
} | null> {
  const user = await User.findOne({
    queueLength: {
      $lt:
        opts.maxQueueLength < ENFORCED_MAX_QUEUE_LENGTH
          ? opts.maxQueueLength
          : ENFORCED_MAX_QUEUE_LENGTH,
    },
  }).sort({ queueLength: "asc", updatedAt: "desc" });

  return user
    ? {
        id: user.id,
      }
    : null;
}
