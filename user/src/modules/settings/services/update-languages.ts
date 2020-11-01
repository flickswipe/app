import {
  BadRequestError,
  LanguagesSetting,
  SettingType,
} from "@flickswipe/common";
import { Types } from "mongoose";
import { Setting } from "../models/setting";

export async function updateLanguages(
  userId: string,
  value: LanguagesSetting["value"]
): Promise<void> {
  // validate
  if (!Types.ObjectId.isValid(userId)) {
    throw new BadRequestError(`Invalid user id "${userId}"`);
  }

  Object.keys(value).forEach((language) => {
    if (!`${value}`.match(/[a-z]{2}/)) {
      throw new BadRequestError(`Invalid language "${language}"`);
    }
  });

  // update
  const existingDoc = await Setting.findOne({
    settingType: SettingType.Languages,
    user: userId,
  });

  if (existingDoc) {
    existingDoc.value = value;
    await existingDoc.save();
    return;
  }

  // create
  await Setting.build({
    settingType: SettingType.Languages,
    user: userId,
    value: value,
  }).save();
}
