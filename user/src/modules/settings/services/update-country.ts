import {
  BadRequestError,
  CountrySetting,
  SettingType,
} from "@flickswipe/common";
import mongoose from "mongoose";
import { natsWrapper } from "../../../nats-wrapper";
import { UserUpdatedSettingPublisher } from "../events/publishers/user-updated-setting";
import { Setting } from "../models/setting";

export async function updateCountry(
  userId: string,
  value: CountrySetting["value"]
): Promise<void> {
  // validate
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new BadRequestError(`Invalid user id "${userId}"`);
  }

  // update
  const existingDoc = await Setting.findOne({
    settingType: SettingType.Country,
    user: userId,
  });

  if (existingDoc) {
    existingDoc.value = value;
    await existingDoc.save();
  } else {
    // create
    await Setting.build({
      settingType: SettingType.Country,
      user: userId,
      value: value,
    }).save();
  }

  // publish event
  new UserUpdatedSettingPublisher(natsWrapper.client).publish({
    settingType: SettingType.Country,
    user: userId,
    value: value,
    updatedAt: new Date(),
  });
}
