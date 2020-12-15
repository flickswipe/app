import mongoose from 'mongoose';

import {
    BadRequestError, ReleaseDateSetting, settingsDiffer, SettingType
} from '@flickswipe/common';

import { natsWrapper } from '../../../nats-wrapper';
import { UserUpdatedSettingPublisher } from '../events/publishers/user-updated-setting';
import { Setting } from '../models/setting';

export async function updateReleaseDate(
  userId: string,
  value: ReleaseDateSetting["value"]
): Promise<void> {
  // parse strings into date objects
  if (typeof value.min === "string") {
    value.min = new Date(value.min);
  }

  if (typeof value.max === "string") {
    value.max = new Date(value.max);
  }

  // parse date objects into timestamps
  // mongodb was throwing a weird error with dates for some reason
  if (value.min instanceof Date) {
    value.min = value.min.getTime();
  }

  if (value.max instanceof Date) {
    value.max = value.max.getTime();
  }

  // validate timestamps
  if (value.min && typeof value.min !== "number") {
    throw new BadRequestError(`Release date: min must be a number`);
  }

  if (value.max && typeof value.max !== "number") {
    throw new BadRequestError(`Release date: max must be a number`);
  }

  // validate
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new BadRequestError(`Invalid user id "${userId}"`);
  }

  if (
    typeof value.min !== "undefined" &&
    typeof value.max !== "undefined" &&
    value.min > value.max
  ) {
    throw new BadRequestError(
      `Release date: min must be lower or equal to max`
    );
  }

  // update
  const existingDoc = await Setting.findOne({
    settingType: SettingType.ReleaseDate,
    user: userId,
  });

  if (existingDoc) {
    // don't update if no effect
    if (!settingsDiffer(SettingType.ReleaseDate, existingDoc.value, value)) {
      return;
    }

    existingDoc.value = value;
    await existingDoc.save();
  } else {
    // create
    await Setting.build({
      settingType: SettingType.ReleaseDate,
      user: userId,
      value: value,
    }).save();
  }

  // publish event
  new UserUpdatedSettingPublisher(natsWrapper.client).publish({
    settingType: SettingType.ReleaseDate,
    user: userId,
    value: value,
    updatedAt: new Date(),
  });

  console.info(`User ${userId} updated setting ${SettingType.ReleaseDate}`);
}
