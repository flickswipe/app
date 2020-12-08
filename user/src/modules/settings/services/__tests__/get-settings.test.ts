import {
    ALL_SETTINGS, ALL_SETTINGS_EMPTY, AUDIO_LANGUAGES_SETTING, AUDIO_LANGUAGES_SETTING_EMPTY,
    COUNTRY_SETTING, COUNTRY_SETTING_EMPTY, GENRES_SETTING, GENRES_SETTING_EMPTY, RATING_SETTING,
    RATING_SETTING_EMPTY, RELEASE_DATE_SETTING, RELEASE_DATE_SETTING_EMPTY, RUNTIME_SETTING,
    RUNTIME_SETTING_EMPTY, STREAM_LOCATIONS_SETTING, STREAM_LOCATIONS_SETTING_EMPTY
} from '../../../../test/sample-data/settings';
// sample data
import { USER_A } from '../../../../test/sample-data/users';
import { Setting } from '../../models/setting';
import { getSettings } from '../get-settings';

describe("get settings", () => {
  describe("no settings or default settings", () => {
    it("should return all keys with empty objects", async () => {
      // has correct data
      expect(await getSettings(USER_A.id)).toEqual(ALL_SETTINGS_EMPTY);
    });
  });

  describe("no settings, but default settings exist", () => {
    it("should return all default settings", async () => {
      // has correct data
      expect(await getSettings(USER_A.id, ALL_SETTINGS)).toEqual(ALL_SETTINGS);
    });
  });

  describe("settings contain empty objects and default settings exist", () => {
    beforeEach(async () => {
      await Promise.all([
        Setting.build(COUNTRY_SETTING_EMPTY).save(),
        Setting.build(GENRES_SETTING_EMPTY).save(),
        Setting.build(AUDIO_LANGUAGES_SETTING_EMPTY).save(),
        Setting.build(RATING_SETTING_EMPTY).save(),
        Setting.build(RELEASE_DATE_SETTING_EMPTY).save(),
        Setting.build(RUNTIME_SETTING_EMPTY).save(),
        Setting.build(STREAM_LOCATIONS_SETTING_EMPTY).save(),
      ]);
    });

    it("should return all default settings", async () => {
      // has correct data
      expect(await getSettings(USER_A.id, ALL_SETTINGS)).toEqual(ALL_SETTINGS);
    });
  });

  describe("country setting and default settings exist", () => {
    beforeEach(async () => {
      await Setting.build(COUNTRY_SETTING).save();
    });

    it("should return country setting alongside default values", async () => {
      // has correct data
      expect(await getSettings(USER_A.id, ALL_SETTINGS_EMPTY)).toEqual(
        Object.assign(ALL_SETTINGS_EMPTY, {
          country: COUNTRY_SETTING.value,
        })
      );
    });
  });

  describe("genres settings and default settings exist", () => {
    beforeEach(async () => {
      await Setting.build(GENRES_SETTING).save();
    });

    it("should return genres settings alongside default values", async () => {
      // has correct data
      expect(await getSettings(USER_A.id, ALL_SETTINGS_EMPTY)).toEqual(
        Object.assign(ALL_SETTINGS_EMPTY, {
          genres: GENRES_SETTING.value,
        })
      );
    });
  });

  describe("audioLanguages settings and default settings exist", () => {
    beforeEach(async () => {
      await Setting.build(AUDIO_LANGUAGES_SETTING).save();
    });

    it("should return audioLanguages settings alongside default values", async () => {
      // has correct data
      expect(await getSettings(USER_A.id, ALL_SETTINGS_EMPTY)).toEqual(
        Object.assign(ALL_SETTINGS_EMPTY, {
          audioLanguages: AUDIO_LANGUAGES_SETTING.value,
        })
      );
    });
  });

  describe("rating settings and default settings exist", () => {
    beforeEach(async () => {
      await Setting.build(RATING_SETTING).save();
    });

    it("should return rating settings alongside default values", async () => {
      // has correct data
      expect(await getSettings(USER_A.id, ALL_SETTINGS_EMPTY)).toEqual(
        Object.assign(ALL_SETTINGS_EMPTY, {
          rating: RATING_SETTING.value,
        })
      );
    });
  });

  describe("releaseDate settings and default settings exist", () => {
    beforeEach(async () => {
      await Setting.build(RELEASE_DATE_SETTING).save();
    });

    it("should return releaseDate settings alongside default values", async () => {
      // has correct data
      expect(await getSettings(USER_A.id, ALL_SETTINGS_EMPTY)).toEqual(
        Object.assign(ALL_SETTINGS_EMPTY, {
          releaseDate: RELEASE_DATE_SETTING.value,
        })
      );
    });
  });

  describe("runtime settings and default settings exist", () => {
    beforeEach(async () => {
      await Setting.build(RUNTIME_SETTING).save();
    });

    it("should return runtime settings alongside default values", async () => {
      // has correct data
      expect(await getSettings(USER_A.id, ALL_SETTINGS_EMPTY)).toEqual(
        Object.assign(ALL_SETTINGS_EMPTY, {
          runtime: RUNTIME_SETTING.value,
        })
      );
    });
  });

  describe("stream locations settings and default settings exist", () => {
    beforeEach(async () => {
      await Setting.build(STREAM_LOCATIONS_SETTING).save();
    });

    it("should return stream locations settings alongside default values", async () => {
      // has correct data
      expect(await getSettings(USER_A.id, ALL_SETTINGS_EMPTY)).toEqual(
        Object.assign(ALL_SETTINGS_EMPTY, {
          streamLocations: STREAM_LOCATIONS_SETTING.value,
        })
      );
    });
  });
});
