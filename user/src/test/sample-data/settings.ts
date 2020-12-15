import mongoose from 'mongoose';

import {
    AudioLanguagesSetting, CountrySetting, GenresSetting, RatingSetting, ReleaseDateSetting,
    RuntimeSetting, SettingType, StreamLocationsSetting
} from '@flickswipe/common';

import { SettingsPayload } from '../../modules/settings/settings';
import { GENRE_A, GENRE_B } from './genres';
import { USER_A } from './users';

export const COUNTRY_SETTING: Omit<CountrySetting, "updatedAt"> = {
  settingType: SettingType.Country,
  user: USER_A.id,
  value: "us",
};

export const COUNTRY_SETTING_EMPTY: Omit<
  CountrySetting,
  "updatedAt"
> = Object.assign({}, COUNTRY_SETTING, { value: "" });

export const GENRES_SETTING: Omit<GenresSetting, "updatedAt"> = {
  settingType: SettingType.Genres,
  user: USER_A.id,
  value: {
    [GENRE_A.id]: true,
    [GENRE_B.id]: false,
  },
};

export const GENRES_SETTING_EMPTY: Omit<
  GenresSetting,
  "updatedAt"
> = Object.assign({}, GENRES_SETTING, {
  value: {},
});

export const AUDIO_LANGUAGES_SETTING: Omit<
  AudioLanguagesSetting,
  "updatedAt"
> = {
  settingType: SettingType.AudioLanguages,
  user: USER_A.id,
  value: {
    en: true,
    es: false,
  } as AudioLanguagesSetting["value"],
};

export const AUDIO_LANGUAGES_SETTING_EMPTY: Omit<
  AudioLanguagesSetting,
  "updatedAt"
> = Object.assign({}, AUDIO_LANGUAGES_SETTING, { value: {} });

export const RATING_SETTING: Omit<RatingSetting, "updatedAt"> = {
  settingType: SettingType.Rating,
  user: USER_A.id,
  value: {
    min: 5,
  },
};

export const RATING_SETTING_EMPTY: Omit<
  RatingSetting,
  "updatedAt"
> = Object.assign({}, RATING_SETTING, {
  value: {},
});

export const RELEASE_DATE_SETTING: Omit<ReleaseDateSetting, "updatedAt"> = {
  settingType: SettingType.ReleaseDate,
  user: USER_A.id,
  value: {
    min: new Date("01-01-1970"),
  },
};

export const RELEASE_DATE_SETTING_EMPTY: Omit<
  ReleaseDateSetting,
  "updatedAt"
> = Object.assign({}, RELEASE_DATE_SETTING, { value: {} });

export const RUNTIME_SETTING: Omit<RuntimeSetting, "updatedAt"> = {
  settingType: SettingType.Runtime,
  user: USER_A.id,
  value: {
    min: 90,
  },
};

export const RUNTIME_SETTING_EMPTY: Omit<
  RuntimeSetting,
  "updatedAt"
> = Object.assign({}, RUNTIME_SETTING, { value: {} });

export const STREAM_LOCATIONS_SETTING: Omit<
  StreamLocationsSetting,
  "updatedAt"
> = {
  settingType: SettingType.StreamLocations,
  user: USER_A.id,
  value: {
    [mongoose.Types.ObjectId("netflixnetfl").toHexString()]: true,
    [mongoose.Types.ObjectId("amazonamazon").toHexString()]: false,
  },
};

export const STREAM_LOCATIONS_SETTING_EMPTY: Omit<
  StreamLocationsSetting,
  "updatedAt"
> = Object.assign({}, STREAM_LOCATIONS_SETTING, { value: {} });

export const ALL_SETTINGS: SettingsPayload = {
  country: COUNTRY_SETTING.value,
  genres: GENRES_SETTING.value,
  audioLanguages: AUDIO_LANGUAGES_SETTING.value,
  rating: RATING_SETTING.value,
  releaseDate: RELEASE_DATE_SETTING.value,
  runtime: RUNTIME_SETTING.value,
  streamLocations: STREAM_LOCATIONS_SETTING.value,
};

export const ALL_SETTINGS_EMPTY: SettingsPayload = {
  country: COUNTRY_SETTING_EMPTY.value,
  genres: GENRES_SETTING_EMPTY.value,
  audioLanguages: AUDIO_LANGUAGES_SETTING_EMPTY.value,
  rating: RATING_SETTING_EMPTY.value,
  releaseDate: RELEASE_DATE_SETTING_EMPTY.value,
  runtime: RUNTIME_SETTING_EMPTY.value,
  streamLocations: STREAM_LOCATIONS_SETTING_EMPTY.value,
};
