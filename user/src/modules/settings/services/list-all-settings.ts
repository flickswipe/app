import {
  GenresSetting,
  LanguagesSetting,
  RatingSetting,
  ReleaseDateSetting,
  RuntimeSetting,
  StreamLocationsSetting,
} from "@flickswipe/common";
import { Setting, SettingDoc } from "../models/setting";
import camelCase from "camelcase";

export type SettingsPayload = {
  [key: string]: any;
  genres: GenresSetting["value"];
  languages: LanguagesSetting["value"];
  rating: RatingSetting["value"];
  releaseDate: ReleaseDateSetting["value"];
  runtime: RuntimeSetting["value"];
  streamLocations: StreamLocationsSetting["value"];
};

export async function listAllSettings(
  userId: string,
  defaultSettings: SettingsPayload | null = null
): Promise<SettingsPayload> {
  let settingsPayload: Partial<SettingsPayload> = {};

  // get existing settings and add to payload
  const existingDocs = await Setting.find({
    user: userId,
  });

  existingDocs.forEach((settingDoc: SettingDoc) => {
    // get key/value pair from setting doc
    const { settingType: key, value } = settingDoc;

    // ignore empty objects (so that we fallback to default settings)
    if (!value || Object.keys(value).length === 0) {
      return;
    }

    // convert to payload format
    settingsPayload[camelCase(key)] = value;
  });

  // add default settings
  settingsPayload = Object.assign(
    {
      genres: {},
      languages: {},
      rating: {},
      releaseDate: {},
      runtime: {},
      streamLocations: {},
    },
    defaultSettings,
    settingsPayload
  );

  return settingsPayload as SettingsPayload;
}
