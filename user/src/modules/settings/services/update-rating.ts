import mongoose from 'mongoose';

import { BadRequestError, RatingSetting, settingsDiffer, SettingType } from '@flickswipe/common';

import { natsWrapper } from '../../../nats-wrapper';
import { UserUpdatedSettingPublisher } from '../events/publishers/user-updated-setting';
import { Setting } from '../models/setting';

export async function updateRating(
  userId: string,
  value: RatingSetting["value"]
): Promise<void> {
  // validate
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new BadRequestError(`Invalid user id "${userId}"`);
  }

  if (value.min && typeof value.min !== "number") {
    throw new BadRequestError(`Rating: min must be a number`);
  }

  if (value.max && typeof value.max !== "number") {
    throw new BadRequestError(`Rating: max must be a number`);
  }

  if (
    typeof value.min !== "undefined" &&
    typeof value.max !== "undefined" &&
    value.min > value.max
  ) {
    throw new BadRequestError(`Rating: min must be lower or equal to max`);
  }

  // update
  const existingDoc = await Setting.findOne({
    settingType: SettingType.Rating,
    user: userId,
  });

  if (existingDoc) {
    // don't update if no effect
    if (!settingsDiffer(SettingType.Rating, existingDoc.value, value)) {
      return;
    }

    existingDoc.value = value;
    await existingDoc.save();
  } else {
    // create
    await Setting.build({
      settingType: SettingType.Rating,
      user: userId,
      value: value,
    }).save();
  }

  // publish event
  new UserUpdatedSettingPublisher(natsWrapper.client).publish({
    settingType: SettingType.Rating,
    user: userId,
    value: value,
    updatedAt: new Date(),
  });

  console.info(`User ${userId} updated setting ${SettingType.Rating}`);
}
