import {
  StreamLocationsSetting,
  SettingType,
  BadRequestError,
} from "@flickswipe/common";
import mongoose from "mongoose";
import { natsWrapper } from "../../../nats-wrapper";
import { UserUpdatedSettingPublisher } from "../events/publishers/user-updated-setting";
import { Setting } from "../models/setting";

export async function updateStreamLocations(
  userId: string,
  value: StreamLocationsSetting["value"]
): Promise<void> {
  // validate
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new BadRequestError(`Invalid user id "${userId}"`);
  }

  Object.keys(value).forEach((streamLocationId) => {
    if (!mongoose.Types.ObjectId.isValid(streamLocationId)) {
      throw new BadRequestError(
        `Invalid streamLocation id "${streamLocationId}"`
      );
    }
  });

  // update
  const existingDoc = await Setting.findOne({
    settingType: SettingType.StreamLocations,
    user: userId,
  });

  if (existingDoc) {
    existingDoc.value = value;
    await existingDoc.save();
  } else {
    // create
    await Setting.build({
      settingType: SettingType.StreamLocations,
      user: userId,
      value: value,
    }).save();
  }

  // publish event
  new UserUpdatedSettingPublisher(natsWrapper.client).publish({
    settingType: SettingType.StreamLocations,
    user: userId,
    value: value,
    updatedAt: new Date(),
  });
}
