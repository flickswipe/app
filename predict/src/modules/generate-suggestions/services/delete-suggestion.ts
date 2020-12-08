import { BadRequestError } from '@flickswipe/common';

import { Suggestion } from '../models/suggestion';
import { User } from '../models/user';

export async function deleteSuggestion(
  userId: string,
  mediaItem: string
): Promise<void> {
  // get user
  const userDoc = await User.findById(userId);

  if (!userDoc) {
    throw new BadRequestError(`User #${userId} doesn't exist`);
  }

  // delete suggestions
  await Suggestion.deleteMany({ user: userId, mediaItem });

  // update userDoc
  userDoc.queueLength = await Suggestion.countDocuments({ user: userId });
  await userDoc.save();
}
