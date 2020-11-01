import {
  BadRequestError,
  GenresSetting,
  SettingType,
} from "@flickswipe/common";
import { Types } from "mongoose";
import { Setting } from "../models/setting";

export async function updateGenres(
  userId: string,
  value: GenresSetting["value"]
): Promise<void> {
  // validate
  if (!Types.ObjectId.isValid(userId)) {
    throw new BadRequestError(`Invalid user id "${userId}"`);
  }

  Object.keys(value).forEach((genreId) => {
    if (!Types.ObjectId.isValid(genreId)) {
      throw new BadRequestError(`Invalid genre id "${genreId}"`);
    }
  });

  // update
  const existingDoc = await Setting.findOne({
    settingType: SettingType.Genres,
    user: userId,
  });

  if (existingDoc) {
    existingDoc.value = value;
    await existingDoc.save();
    return;
  }

  // create
  await Setting.build({
    settingType: SettingType.Genres,
    user: userId,
    value: value,
  }).save();
}
