import { BadRequestError, SettingType } from "@flickswipe/common";
import { natsWrapper } from "../../../../nats-wrapper";
import { MediaItem } from "../../../track-ingest/models/media-item";
import { SurveyResponse } from "../../../track-survey/models/survey-response";
import { Setting } from "../../../track-user-settings/models/setting";
import { Suggestion } from "../../models/suggestion";
import { User } from "../../models/user";
import { createSuggestions } from "../create-suggestions";

const expectOnlyOneCorrectSuggestionDocToExist = async () => {
  expect(
    await Suggestion.findOne({
      user: "aaabbbcccddd",
      mediaItem: "ab1234567890ab1234567890",
    })
  ).not.toBeNull();

  expect(await Suggestion.countDocuments()).toBe(1);
};

const expectTwoSuggestionDocsToExist = async () => {
  expect(
    await Suggestion.findOne({
      user: "aaabbbcccddd",
      mediaItem: "ab1234567890ab1234567890",
    })
  ).not.toBeNull();

  expect(
    await Suggestion.findOne({
      user: "aaabbbcccddd",
      mediaItem: "bc1234567890ab1234567890",
    })
  ).not.toBeNull();

  expect(await Suggestion.countDocuments()).toBe(2);
};

describe("create suggestions", () => {
  beforeEach(async () => {
    // create user
    await User.build({
      id: "aaabbbcccddd",
    }).save();

    // create target media item
    await MediaItem.build({
      id: "ab1234567890ab1234567890",
      tmdbMovieId: 123,
      imdbId: "tt1234567",
      title: "My Movie",
      images: {
        poster: "https://example.com/",
        backdrop: "https://example.com/",
      },
      genres: ["bc1234567890ab1234567890"],
      rating: {
        average: 100,
        count: 101,
        popularity: 102,
      },
      language: "en",
      releaseDate: new Date("2020-01-01"),
      runtime: 103,
      plot: "My movie plit...",
      streamLocations: {
        us: [
          {
            id: "0987654321234567890",
            name: "Netflix",
            url: "https://example.com/",
          },
        ],
      },
    }).save();

    // create media item to filter out
    await MediaItem.build({
      id: "bc1234567890ab1234567890",
      tmdbMovieId: 321,
      imdbId: "tt7654321",
      title: "My Ignored Movie",
      images: {
        poster: "https://example.com/",
        backdrop: "https://example.com/",
      },
      genres: ["cd1234567890ab1234567890"],
      rating: {
        average: 50,
        count: 51,
        popularity: 52,
      },
      language: "es",
      releaseDate: new Date("1980-01-01"),
      runtime: 54,
      plot: "My movie plot...",
      streamLocations: {
        uk: [
          {
            id: "123456789098",
            name: "Amazon Prime",
            url: "https://example.com/",
          },
        ],
      },
    }).save();
  });

  it("should throw a BadRequestError if user doesn't exist", async () => {
    await expect(() => createSuggestions("bbbcccdddeee")).rejects.toThrowError(
      BadRequestError
    );
  });

  it("should filter out media items that are in suggestions", async () => {
    await Suggestion.build({
      user: "aaabbbcccddd",
      mediaItem: "bc1234567890ab1234567890",
    }).save();

    await createSuggestions("aaabbbcccddd");

    expect(
      await Suggestion.findOne({
        user: "aaabbbcccddd",
        mediaItem: "ab1234567890ab1234567890",
      })
    ).not.toBeNull();

    expect(await Suggestion.countDocuments()).toBe(2);
  });

  it("should filter out media items that have survey responses", async () => {
    await SurveyResponse.build({
      user: "aaabbbcccddd",
      mediaItem: "bc1234567890ab1234567890",
    }).save();

    await createSuggestions("aaabbbcccddd");

    await expectOnlyOneCorrectSuggestionDocToExist();
  });

  it("should filter out media items by country setting", async () => {
    await Setting.build({
      settingType: SettingType.Country,
      user: "aaabbbcccddd",
      value: "us",
    }).save();

    await createSuggestions("aaabbbcccddd");

    await expectOnlyOneCorrectSuggestionDocToExist();
  });

  it("should filter out media items by whitelist genres setting", async () => {
    await Setting.build({
      settingType: SettingType.Genres,
      user: "aaabbbcccddd",
      value: {
        bc1234567890ab1234567890: true,
      },
    }).save();

    await createSuggestions("aaabbbcccddd");

    await expectOnlyOneCorrectSuggestionDocToExist();
  });

  it("should filter out media items by blacklist genres setting", async () => {
    await Setting.build({
      settingType: SettingType.Genres,
      user: "aaabbbcccddd",
      value: {
        cd1234567890ab1234567890: false,
      },
    }).save();

    await createSuggestions("aaabbbcccddd");

    await expectOnlyOneCorrectSuggestionDocToExist();
  });

  it("should filter out media items by whitelist/blacklist genres setting", async () => {
    await Setting.build({
      settingType: SettingType.Genres,
      user: "aaabbbcccddd",
      value: {
        bc1234567890ab1234567890: true,
        cd1234567890ab1234567890: false,
      },
    }).save();

    await createSuggestions("aaabbbcccddd");

    await expectOnlyOneCorrectSuggestionDocToExist();
  });

  it("should filter out media items by whitelist languages setting", async () => {
    await Setting.build({
      settingType: SettingType.Languages,
      user: "aaabbbcccddd",
      value: {
        en: true,
      },
    }).save();

    await createSuggestions("aaabbbcccddd");

    await expectOnlyOneCorrectSuggestionDocToExist();
  });

  it("should filter out media items by blacklist languages setting", async () => {
    await Setting.build({
      settingType: SettingType.Languages,
      user: "aaabbbcccddd",
      value: {
        es: false,
      },
    }).save();

    await createSuggestions("aaabbbcccddd");

    await expectOnlyOneCorrectSuggestionDocToExist();
  });

  it("should filter out media items by whitelist/blacklist languages setting", async () => {
    await Setting.build({
      settingType: SettingType.Languages,
      user: "aaabbbcccddd",
      value: {
        en: true,
        es: false,
      },
    }).save();

    await createSuggestions("aaabbbcccddd");

    await expectOnlyOneCorrectSuggestionDocToExist();
  });

  it("should filter out media items by whitelist streamLocations setting", async () => {
    await Setting.build({
      settingType: SettingType.StreamLocations,
      user: "aaabbbcccddd",
      value: {
        "0987654321234567890": true,
      },
    }).save();

    await createSuggestions("aaabbbcccddd");

    await expectOnlyOneCorrectSuggestionDocToExist();
  });

  it("should filter out media items by blacklist streamLocations setting", async () => {
    await Setting.build({
      settingType: SettingType.StreamLocations,
      user: "aaabbbcccddd",
      value: {
        "123456789098": false,
      },
    }).save();

    await createSuggestions("aaabbbcccddd");

    await expectOnlyOneCorrectSuggestionDocToExist();
  });

  it("should filter out media items by whitelist/blacklist streamLocations setting", async () => {
    await Setting.build({
      settingType: SettingType.StreamLocations,
      user: "aaabbbcccddd",
      value: {
        "0987654321234567890": true,
        "123456789098": false,
      },
    }).save();

    await createSuggestions("aaabbbcccddd");

    await expectOnlyOneCorrectSuggestionDocToExist();
  });

  it("should filter out media items by min rating setting", async () => {
    await Setting.build({
      settingType: SettingType.Rating,
      user: "aaabbbcccddd",
      value: {
        min: 75,
      },
    }).save();

    await createSuggestions("aaabbbcccddd");

    await expectOnlyOneCorrectSuggestionDocToExist();
  });

  it("should filter out media items by min/max rating setting", async () => {
    await Setting.build({
      settingType: SettingType.Rating,
      user: "aaabbbcccddd",
      value: {
        min: 75,
        max: 150,
      },
    }).save();

    await createSuggestions("aaabbbcccddd");

    await expectOnlyOneCorrectSuggestionDocToExist();
  });

  it("should filter out media items by min releaseDate setting", async () => {
    await Setting.build({
      settingType: SettingType.ReleaseDate,
      user: "aaabbbcccddd",
      value: {
        min: new Date("2000-01-01"),
      },
    }).save();

    await createSuggestions("aaabbbcccddd");

    await expectOnlyOneCorrectSuggestionDocToExist();
  });

  it("should filter out media items by min/max releaseDate setting", async () => {
    await Setting.build({
      settingType: SettingType.ReleaseDate,
      user: "aaabbbcccddd",
      value: {
        min: new Date("2000-01-01"),
        max: new Date("2030-01-01"),
      },
    }).save();

    await createSuggestions("aaabbbcccddd");

    await expectOnlyOneCorrectSuggestionDocToExist();
  });

  it("should filter out media items by min runtime setting", async () => {
    await Setting.build({
      settingType: SettingType.Runtime,
      user: "aaabbbcccddd",
      value: {
        min: 100,
      },
    }).save();

    await createSuggestions("aaabbbcccddd");

    await expectOnlyOneCorrectSuggestionDocToExist();
  });

  it("should filter out media items by min/max runtime setting", async () => {
    await Setting.build({
      settingType: SettingType.Runtime,
      user: "aaabbbcccddd",
      value: {
        min: 100,
        max: 200,
      },
    }).save();

    await createSuggestions("aaabbbcccddd");

    await expectOnlyOneCorrectSuggestionDocToExist();
  });

  describe("clear suggestions", () => {
    beforeEach(async () => {
      await Suggestion.build({
        user: "aaabbbcccddd",
        mediaItem: "bc1234567890ab1234567890",
      }).save();
    });

    it("should clear suggestions", async () => {
      // ONLY PERMIT ONE SETTING
      await Setting.build({
        settingType: SettingType.Runtime,
        user: "aaabbbcccddd",
        value: {
          min: 100,
          max: 200,
        },
      }).save();

      await createSuggestions("aaabbbcccddd", true);

      await expectOnlyOneCorrectSuggestionDocToExist();
    });

    it("should update queue length correctly", async () => {
      // ONLY PERMIT ONE SETTING
      await Setting.build({
        settingType: SettingType.Runtime,
        user: "aaabbbcccddd",
        value: {
          min: 100,
          max: 200,
        },
      }).save();

      await createSuggestions("aaabbbcccddd", true);

      expect(await User.findById("aaabbbcccddd")).toEqual(
        expect.objectContaining({
          queueLength: 1,
        })
      );
    });
  });

  describe("add suggestions", () => {
    it("should clear suggestions", async () => {
      await createSuggestions("aaabbbcccddd", false);

      await expectTwoSuggestionDocsToExist();
    });

    it("should update queue length correctly", async () => {
      await createSuggestions("aaabbbcccddd", false);

      expect(await User.findById("aaabbbcccddd")).toEqual(
        expect.objectContaining({
          queueLength: 2,
        })
      );
    });
  });

  it("should publish an event", async () => {
    await createSuggestions("aaabbbcccddd");

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });
});
