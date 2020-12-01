import {
  CountrySetting,
  GenresSetting,
  AudioLanguagesSetting,
  RatingSetting,
  ReleaseDateSetting,
  RuntimeSetting,
  StreamLocationsSetting,
} from "@flickswipe/common";
import { Setting, SettingDoc } from "../models/setting";
import camelCase from "camelcase";
import cloneDeep from "clone-deep";

export type SettingsPayload = {
  [key: string]: any;
  country: CountrySetting["value"];
  genres: GenresSetting["value"];
  audioLanguages: AudioLanguagesSetting["value"];
  rating: RatingSetting["value"];
  releaseDate: ReleaseDateSetting["value"];
  runtime: RuntimeSetting["value"];
  streamLocations: StreamLocationsSetting["value"];
};

export async function getSettings(
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
      country: "",
      genres: {},
      audioLanguages: {},
      rating: {},
      releaseDate: {},
      runtime: {},
      streamLocations: {},
    },
    cloneDeep(defaultSettings),
    settingsPayload
  );

  return settingsPayload as SettingsPayload;
}
