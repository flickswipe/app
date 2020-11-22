import { User } from "../models/user";

export async function getUserWithSmallestQueue(
  maxQueueLength = 50
): Promise<{
  id: string;
} | null> {
  const user = await User.findOne({
    queueLength: {
      $lt: maxQueueLength,
    },
  }).sort({ queueLength: "asc", updatedAt: "desc" });

  return user
    ? {
        id: user.id,
      }
    : null;
}
