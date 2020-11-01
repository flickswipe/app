import {
  BadRequestError,
  ReleaseDateSetting,
  SettingType,
} from "@flickswipe/common";
import { Types } from "mongoose";
import { Setting } from "../models/setting";

export async function updateReleaseDate(
  userId: string,
  value: ReleaseDateSetting["value"]
): Promise<void> {
  // parse into timestamps
  // mongodb was throwing a weird error with dates for some reason
  if (value.min instanceof Date) {
    value.min = value.min.getTime();
  }

  if (value.max instanceof Date) {
    value.max = value.max.getTime();
  }

  // validate
  if (!Types.ObjectId.isValid(userId)) {
    throw new BadRequestError(`Invalid user id "${userId}"`);
  }

  if (value.min && value.max && value.min > value.max) {
    throw new BadRequestError(`Min must be lower or equal to max"`);
  }

  // update
  const existingDoc = await Setting.findOne({
    settingType: SettingType.ReleaseDate,
    user: userId,
  });

  if (existingDoc) {
    existingDoc.value = value;
    await existingDoc.save();
    return;
  }

  // create
  await Setting.build({
    settingType: SettingType.ReleaseDate,
    user: userId,
    value: value,
  }).save();
}
