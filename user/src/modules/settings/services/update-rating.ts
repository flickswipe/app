import {
  BadRequestError,
  RatingSetting,
  SettingType,
} from "@flickswipe/common";
import { Types } from "mongoose";
import { natsWrapper } from "../../../nats-wrapper";
import { UserUpdatedSettingPublisher } from "../events/publishers/user-updated-setting";
import { Setting } from "../models/setting";

export async function updateRating(
  userId: string,
  value: RatingSetting["value"]
): Promise<void> {
  // validate
  if (!Types.ObjectId.isValid(userId)) {
    throw new BadRequestError(`Invalid user id "${userId}"`);
  }

  if (value.min && value.max && value.min > value.max) {
    throw new BadRequestError(`Min must be lower or equal to max"`);
  }

  // update
  const existingDoc = await Setting.findOne({
    settingType: SettingType.Rating,
    user: userId,
  });

  if (existingDoc) {
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
}
