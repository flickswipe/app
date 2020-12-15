import { BadRequestError } from '@flickswipe/common';

import { Suggestion } from '../models/suggestion';
import { User } from '../models/user';

export async function deleteSuggestions(userId: string): Promise<void> {
  // get user
  const userDoc = await User.findById(userId);

  if (!userDoc) {
    throw new BadRequestError(`User ${userId} doesn't exist`);
  }

  // delete suggestions
  await Suggestion.deleteMany({ user: userId });

  // update userDoc
  userDoc.queueLength = 0;
  await userDoc.save();

  console.info(`User ${userId} deleted all suggestions`);
}
