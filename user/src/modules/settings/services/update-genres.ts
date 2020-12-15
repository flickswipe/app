import mongoose from 'mongoose';

import { BadRequestError, GenresSetting, settingsDiffer, SettingType } from '@flickswipe/common';

import { natsWrapper } from '../../../nats-wrapper';
import { UserUpdatedSettingPublisher } from '../events/publishers/user-updated-setting';
import { Setting } from '../models/setting';

export async function updateGenres(
  userId: string,
  value: GenresSetting["value"]
): Promise<void> {
  // validate
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new BadRequestError(`Invalid user id "${userId}"`);
  }

  Object.keys(value).forEach((tmdbGenreId) => {
    let result = null;
    try {
      result = parseInt(tmdbGenreId, 10);
    } catch (err) {
      result = null;
    }

    if (typeof result !== "number" || isNaN(result)) {
      throw new BadRequestError(`Invalid genre id "${tmdbGenreId}"`);
    }
  });

  // update
  const existingDoc = await Setting.findOne({
    settingType: SettingType.Genres,
    user: userId,
  });

  if (existingDoc) {
    // don't update if no effect
    if (!settingsDiffer(SettingType.Genres, existingDoc.value, value)) {
      return;
    }

    existingDoc.value = value;
    await existingDoc.save();
  } else {
    // create
    await Setting.build({
      settingType: SettingType.Genres,
      user: userId,
      value: value,
    }).save();
  }

  // publish event
  new UserUpdatedSettingPublisher(natsWrapper.client).publish({
    settingType: SettingType.Genres,
    user: userId,
    value: value,
    updatedAt: new Date(),
  });

  console.info(`User ${userId} updated setting ${SettingType.Genres}`);
}
