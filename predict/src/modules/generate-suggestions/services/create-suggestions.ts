import { AnySetting } from "@flickswipe/common";
import { natsWrapper } from "../../../nats-wrapper";
import { getSettings } from "../../track-user-settings/track-user-settings";
import { MediaItemsSuggestedPublisher } from "../events/publishers/media-items-suggested";
import { User } from "../models/user";

type SimpleSetting = Omit<AnySetting, "user" | "updatedAt">;

export async function createSuggestions(
  userId: string,
  clearExistingSuggestions = false
): Promise<void> {
  // get settings
  const settings = await getUserSettings(userId);

  // create new suggestions
  const suggestions = await getUserSuggestions(userId, settings);

  // update queue length
  const userDoc = await User.findById(userId);

  if (clearExistingSuggestions) {
    userDoc.queueLength = 0;
  }

  userDoc.queueLength += suggestions.length;
  await userDoc.save();

  // publish new suggestions
  new MediaItemsSuggestedPublisher(natsWrapper.client).publish({
    user: userId,
    mediaItems: suggestions,
    clearExistingSuggestions: clearExistingSuggestions,
  });
}

/**
 * @param userId user to get settings for
 */
async function getUserSettings(userId: string): Promise<SimpleSetting[]> {
  const settings = (await getSettings(userId)).map((doc) => ({
    settingType: doc.settingType,
    value: doc.value,
  }));

  return settings;
}

/**
 * @param userId user to get suggestions for
 */
async function getUserSuggestions(
  userId: string,
  settings: SimpleSetting[]
): Promise<string[]> {
  const suggestions: string[] = [];

  console.log("Got userId", userId);
  console.log("Got settings", settings);

  // TODO

  console.log(`created suggestions for #${userId}`);

  return suggestions;
}
