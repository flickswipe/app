import {
  BadRequestError,
  CountrySetting,
  SettingType,
} from "@flickswipe/common";
import { Types } from "mongoose";
import { Setting } from "../models/setting";

export async function updateCountry(
  userId: string,
  value: CountrySetting["value"]
): Promise<void> {
  // validate
  if (!Types.ObjectId.isValid(userId)) {
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
    return;
  }

  // create
  await Setting.build({
    settingType: SettingType.Country,
    user: userId,
    value: value,
  }).save();
}
