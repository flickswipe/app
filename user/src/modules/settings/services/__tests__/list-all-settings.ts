import {
  GenresSetting,
  LanguagesSetting,
  RatingSetting,
  ReleaseDateSetting,
  RuntimeSetting,
  SettingType,
  StreamLocationsSetting,
} from "@flickswipe/common";
import { Setting } from "../../models/setting";
import { listAllSettings, SettingsPayload } from "../list-all-settings";

const defaultSettings: SettingsPayload = {
  genres: {
    abcdefabcdef: true,
    bcdbcdbcdbcd: false,
  },
  languages: {
    en: true,
  } as SettingsPayload["languages"],
  rating: {
    min: 7,
  },
  releaseDate: {
    min: new Date("01-01-1970"),
  },
  runtime: {
    max: 120,
  },
  streamLocations: {
    netflixnetfl: true,
    amazonamazon: true,
  },
};

const sampleGenresSettingValue = {
  abcdefabcdef: true,
  bcdbcdbcdbcd: false,
} as GenresSetting["value"];

const sampleLanguagesSettingValue = {
  en: true,
  es: false,
} as LanguagesSetting["value"];

const sampleRatingSettingValue = {
  min: 5,
} as RatingSetting["value"];

const sampleReleaseDateSettingValue = {
  min: new Date("01-01-1970"),
} as ReleaseDateSetting["value"];

const sampleRuntimeSettingValue = {
  min: 90,
} as RuntimeSetting["value"];

const sampleStreamLocationsSettingValue = {
  netflixnetfl: true,
  amazonamazon: false,
} as StreamLocationsSetting["value"];

describe("get settings", () => {
  describe("no settings or default settings", () => {
    it("should return all keys with empty objects", async () => {
      const result = await listAllSettings("useruseruser");

      expect(result).toEqual({
        genres: {},
        languages: {},
        rating: {},
        releaseDate: {},
        runtime: {},
        streamLocations: {},
      });
    });
  });

  describe("no settings, but default settings exist", () => {
    it("should return all default settings", async () => {
      const result = await listAllSettings("useruseruser", defaultSettings);

      expect(result).toEqual(defaultSettings);
    });
  });

  describe("settings contain empty objects and default settings exist", () => {
    it("should return all default settings", async () => {
      await Setting.build({
        settingType: SettingType.Genres,
        user: "useruseruser",
        value: {},
      }).save();

      await Setting.build({
        settingType: SettingType.Languages,
        user: "useruseruser",
        value: {},
      }).save();

      await Setting.build({
        settingType: SettingType.Rating,
        user: "useruseruser",
        value: {},
      }).save();

      await Setting.build({
        settingType: SettingType.ReleaseDate,
        user: "useruseruser",
        value: {},
      }).save();

      await Setting.build({
        settingType: SettingType.Runtime,
        user: "useruseruser",
        value: {},
      }).save();

      await Setting.build({
        settingType: SettingType.StreamLocations,
        user: "useruseruser",
        value: {},
      }).save();

      const result = await listAllSettings("useruseruser", defaultSettings);

      expect(result).toEqual(defaultSettings);
    });
  });

  describe("genres settings and default settings exist", () => {
    it("should return a genres settings alongside default values", async () => {
      await Setting.build({
        settingType: SettingType.Genres,
        user: "useruseruser",
        value: sampleGenresSettingValue,
      }).save();

      const result = await listAllSettings("useruseruser", defaultSettings);
      const expectedResult = Object.assign({}, defaultSettings, {
        genres: sampleGenresSettingValue,
      });

      expect(result).toEqual(expectedResult);
    });
  });

  describe("languages settings and default settings exist", () => {
    it("should return a languages settings alongside default values", async () => {
      await Setting.build({
        settingType: SettingType.Languages,
        user: "useruseruser",
        value: sampleLanguagesSettingValue,
      }).save();

      const result = await listAllSettings("useruseruser", defaultSettings);
      const expectedResult = Object.assign({}, defaultSettings, {
        languages: sampleLanguagesSettingValue,
      });

      expect(result).toEqual(expectedResult);
    });
  });

  describe("rating settings and default settings exist", () => {
    it("should return a rating settings alongside default values", async () => {
      await Setting.build({
        settingType: SettingType.Rating,
        user: "useruseruser",
        value: sampleRatingSettingValue,
      }).save();

      const result = await listAllSettings("useruseruser", defaultSettings);
      const expectedResult = Object.assign({}, defaultSettings, {
        rating: sampleRatingSettingValue,
      });

      expect(result).toEqual(expectedResult);
    });
  });

  describe("releaseDate settings and default settings exist", () => {
    it("should return a releaseDate settings alongside default values", async () => {
      await Setting.build({
        settingType: SettingType.ReleaseDate,
        user: "useruseruser",
        value: sampleReleaseDateSettingValue,
      }).save();

      const result = await listAllSettings("useruseruser", defaultSettings);
      const expectedResult = Object.assign({}, defaultSettings, {
        releaseDate: sampleReleaseDateSettingValue,
      });

      expect(result).toEqual(expectedResult);
    });
  });

  describe("runtime settings and default settings exist", () => {
    it("should return a runtime settings alongside default values", async () => {
      await Setting.build({
        settingType: SettingType.Runtime,
        user: "useruseruser",
        value: sampleRuntimeSettingValue,
      }).save();

      const result = await listAllSettings("useruseruser", defaultSettings);
      const expectedResult = Object.assign({}, defaultSettings, {
        runtime: sampleRuntimeSettingValue,
      });

      expect(result).toEqual(expectedResult);
    });
  });

  describe("stream locations settings and default settings exist", () => {
    it("should return a stream locations settings alongside default values", async () => {
      await Setting.build({
        settingType: SettingType.StreamLocations,
        user: "useruseruser",
        value: sampleStreamLocationsSettingValue,
      }).save();

      const result = await listAllSettings("useruseruser", defaultSettings);
      const expectedResult = Object.assign({}, defaultSettings, {
        streamLocations: sampleStreamLocationsSettingValue,
      });

      expect(result).toEqual(expectedResult);
    });
  });
});
