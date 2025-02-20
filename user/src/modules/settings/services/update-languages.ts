import {
  BadRequestError,
  AudioLanguagesSetting,
  SettingType,
} from "@flickswipe/common";
import mongoose from "mongoose";
import { natsWrapper } from "../../../nats-wrapper";
import { UserUpdatedSettingPublisher } from "../events/publishers/user-updated-setting";
import { Setting } from "../models/setting";

export async function updateAudioLanguages(
  userId: string,
  value: AudioLanguagesSetting["value"]
): Promise<void> {
  // validate
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new BadRequestError(`Invalid user id "${userId}"`);
  }

  Object.keys(value).forEach((audioLanguage) => {
    if (!`${audioLanguage}`.match(/^[a-z]{2}$/)) {
      throw new BadRequestError(`Invalid audioLanguage "${audioLanguage}"`);
    }
  });

  // update
  const existingDoc = await Setting.findOne({
    settingType: SettingType.AudioLanguages,
    user: userId,
  });

  if (existingDoc) {
    existingDoc.value = value;
    await existingDoc.save();
  } else {
    // create
    await Setting.build({
      settingType: SettingType.AudioLanguages,
      user: userId,
      value: value,
    }).save();
  }

  // publish event
  new UserUpdatedSettingPublisher(natsWrapper.client).publish({
    settingType: SettingType.AudioLanguages,
    user: userId,
    value: value,
    updatedAt: new Date(),
  });
}
