import mongoose from "mongoose";
import { BadRequestError, SettingType } from "@flickswipe/common";
import { natsWrapper } from "../../../../nats-wrapper";
import { MediaItem } from "../../../track-ingest/models/media-item";
import { SurveyResponse } from "../../../track-survey/models/survey-response";
import { Setting } from "../../../track-user-settings/models/setting";
import { Suggestion } from "../../models/suggestion";
import { User } from "../../models/user";
import { createSuggestions } from "../create-suggestions";

// sample data
import { USER_A, USER_B } from "../../../../test/sample-data/users";
import {
  MEDIA_ITEM_A,
  MEDIA_ITEM_B,
} from "../../../../test/sample-data/media-items";

const expectOnlyOneCorrectSuggestionDocToExist = async () => {
  expect(
    await Suggestion.findOne({
      user: USER_A.id,
      mediaItem: MEDIA_ITEM_A.id,
    })
  ).not.toBeNull();

  // has only one correct doc
  expect(await Suggestion.countDocuments()).toBe(1);
};

const expectTwoSuggestionDocsToExist = async () => {
  // has suggested media item a
  expect(
    await Suggestion.findOne({
      user: USER_A.id,
      mediaItem: MEDIA_ITEM_A.id,
    })
  ).not.toBeNull();

  // has suggested media item b
  expect(
    await Suggestion.findOne({
      user: USER_A.id,
      mediaItem: MEDIA_ITEM_B.id,
    })
  ).not.toBeNull();

  // has exactly two docs
  expect(await Suggestion.countDocuments()).toBe(2);
};

describe("create suggestions", () => {
  beforeEach(async () => {
    await Promise.all([
      User.build({ id: USER_A.id }).save(),
      MediaItem.build(MEDIA_ITEM_A).save(),
      MediaItem.build(MEDIA_ITEM_B).save(),
    ]);
  });

  it("should throw a BadRequestError if user doesn't exist", async () => {
    // throws error
    await expect(() => createSuggestions(USER_B.id)).rejects.toThrowError(
      BadRequestError
    );
  });

  it("should filter out media items that are in suggestions", async () => {
    await Suggestion.build({
      user: USER_A.id,
      mediaItem: MEDIA_ITEM_B.id,
    }).save();

    await createSuggestions(USER_A.id);

    // has suggested media item a
    expect(
      await Suggestion.findOne({
        user: USER_A.id,
        mediaItem: MEDIA_ITEM_A.id,
      })
    ).not.toBeNull();

    // has exactly two suggestions
    expect(await Suggestion.countDocuments()).toBe(2);
  });

  it("should filter out media items that have survey responses", async () => {
    await SurveyResponse.build({
      user: USER_A.id,
      mediaItem: MEDIA_ITEM_B.id,
    }).save();

    await createSuggestions(USER_A.id);

    await expectOnlyOneCorrectSuggestionDocToExist();
  });

  it("should filter out media items by country setting", async () => {
    const MediaItemACountry = Object.keys(MEDIA_ITEM_A.streamLocations)[0];

    await Setting.build({
      settingType: SettingType.Country,
      user: USER_A.id,
      value: MediaItemACountry,
    }).save();

    await createSuggestions(USER_A.id);

    await expectOnlyOneCorrectSuggestionDocToExist();
  });

  it("should filter out media items by whitelist genres setting", async () => {
    const MediaItemAGenre = MEDIA_ITEM_A.genres[0];

    await Setting.build({
      settingType: SettingType.Genres,
      user: USER_A.id,
      value: {
        [MediaItemAGenre]: true,
      },
    }).save();

    await createSuggestions(USER_A.id);

    await expectOnlyOneCorrectSuggestionDocToExist();
  });

  it("should filter out media items by blacklist genres setting", async () => {
    const MediaItemBGenre = MEDIA_ITEM_B.genres[0];

    await Setting.build({
      settingType: SettingType.Genres,
      user: USER_A.id,
      value: {
        [MediaItemBGenre]: false,
      },
    }).save();

    await createSuggestions(USER_A.id);

    await expectOnlyOneCorrectSuggestionDocToExist();
  });

  it("should filter out media items by whitelist/blacklist genres setting", async () => {
    const MediaItemAGenre = MEDIA_ITEM_A.genres[0];
    const MediaItemBGenre = MEDIA_ITEM_B.genres[0];

    await Setting.build({
      settingType: SettingType.Genres,
      user: USER_A.id,
      value: {
        [MediaItemAGenre]: true,
        [MediaItemBGenre]: false,
      },
    }).save();

    await createSuggestions(USER_A.id);

    await expectOnlyOneCorrectSuggestionDocToExist();
  });

  it("should filter out media items by whitelist languages setting", async () => {
    await Setting.build({
      settingType: SettingType.Languages,
      user: USER_A.id,
      value: {
        [MEDIA_ITEM_A.language]: true,
      },
    }).save();

    await createSuggestions(USER_A.id);

    await expectOnlyOneCorrectSuggestionDocToExist();
  });

  it("should filter out media items by blacklist languages setting", async () => {
    await Setting.build({
      settingType: SettingType.Languages,
      user: USER_A.id,
      value: {
        [MEDIA_ITEM_B.language]: false,
      },
    }).save();

    await createSuggestions(USER_A.id);

    await expectOnlyOneCorrectSuggestionDocToExist();
  });

  it("should filter out media items by whitelist/blacklist languages setting", async () => {
    await Setting.build({
      settingType: SettingType.Languages,
      user: USER_A.id,
      value: {
        [MEDIA_ITEM_A.language]: true,
        [MEDIA_ITEM_B.language]: false,
      },
    }).save();

    await createSuggestions(USER_A.id);

    await expectOnlyOneCorrectSuggestionDocToExist();
  });

  it("should filter out media items by whitelist streamLocations setting", async () => {
    const MediaItemAStreamLocation = Object.values(
      MEDIA_ITEM_A.streamLocations
    )[0][0];

    await Setting.build({
      settingType: SettingType.StreamLocations,
      user: USER_A.id,
      value: {
        [MediaItemAStreamLocation.id]: true,
      },
    }).save();

    await createSuggestions(USER_A.id);

    await expectOnlyOneCorrectSuggestionDocToExist();
  });

  it("should filter out media items by blacklist streamLocations setting", async () => {
    const MediaItemBStreamLocation = Object.values(
      MEDIA_ITEM_B.streamLocations
    )[0][0];

    await Setting.build({
      settingType: SettingType.StreamLocations,
      user: USER_A.id,
      value: {
        [MediaItemBStreamLocation.id]: false,
      },
    }).save();

    await createSuggestions(USER_A.id);

    await expectOnlyOneCorrectSuggestionDocToExist();
  });

  it("should filter out media items by whitelist/blacklist streamLocations setting", async () => {
    const MediaItemAStreamLocation = Object.values(
      MEDIA_ITEM_A.streamLocations
    )[0][0];
    const MediaItemBStreamLocation = Object.values(
      MEDIA_ITEM_B.streamLocations
    )[0][0];

    await Setting.build({
      settingType: SettingType.StreamLocations,
      user: USER_A.id,
      value: {
        [MediaItemAStreamLocation.id]: true,
        [MediaItemBStreamLocation.id]: false,
      },
    }).save();

    await createSuggestions(USER_A.id);

    await expectOnlyOneCorrectSuggestionDocToExist();
  });

  it("should filter out media items by min rating setting", async () => {
    await Setting.build({
      settingType: SettingType.Rating,
      user: USER_A.id,
      value: {
        min: MEDIA_ITEM_A.rating.average - 1,
      },
    }).save();

    await createSuggestions(USER_A.id);

    await expectOnlyOneCorrectSuggestionDocToExist();
  });

  it("should filter out media items by min/max rating setting", async () => {
    await Setting.build({
      settingType: SettingType.Rating,
      user: USER_A.id,
      value: {
        min: MEDIA_ITEM_A.rating.average - 1,
        max: MEDIA_ITEM_A.rating.average + 1,
      },
    }).save();

    await createSuggestions(USER_A.id);

    await expectOnlyOneCorrectSuggestionDocToExist();
  });

  it("should filter out media items by min releaseDate setting", async () => {
    await Setting.build({
      settingType: SettingType.ReleaseDate,
      user: USER_A.id,
      value: {
        min: new Date(MEDIA_ITEM_A.releaseDate.getTime() - 86600),
      },
    }).save();

    await createSuggestions(USER_A.id);

    await expectOnlyOneCorrectSuggestionDocToExist();
  });

  it("should filter out media items by min/max releaseDate setting", async () => {
    await Setting.build({
      settingType: SettingType.ReleaseDate,
      user: USER_A.id,
      value: {
        min: new Date(MEDIA_ITEM_A.releaseDate.getTime() - 86600),
        max: new Date(MEDIA_ITEM_A.releaseDate.getTime() + 86600),
      },
    }).save();

    await createSuggestions(USER_A.id);

    await expectOnlyOneCorrectSuggestionDocToExist();
  });

  it("should filter out media items by min runtime setting", async () => {
    await Setting.build({
      settingType: SettingType.Runtime,
      user: USER_A.id,
      value: {
        min: MEDIA_ITEM_A.runtime - 1,
      },
    }).save();

    await createSuggestions(USER_A.id);

    await expectOnlyOneCorrectSuggestionDocToExist();
  });

  it("should filter out media items by min/max runtime setting", async () => {
    await Setting.build({
      settingType: SettingType.Runtime,
      user: USER_A.id,
      value: {
        min: MEDIA_ITEM_A.runtime - 1,
        max: MEDIA_ITEM_A.runtime + 1,
      },
    }).save();

    await createSuggestions(USER_A.id);

    await expectOnlyOneCorrectSuggestionDocToExist();
  });

  describe("clear suggestions", () => {
    beforeEach(async () => {
      await Suggestion.build({
        user: USER_A.id,
        mediaItem: mongoose.Types.ObjectId().toHexString(),
      }).save();
    });

    it("should clear suggestions", async () => {
      await createSuggestions(USER_A.id, true);
      await expectTwoSuggestionDocsToExist();
    });

    it("should update queue length correctly", async () => {
      await createSuggestions(USER_A.id, true);

      expect(await User.findById(USER_A.id)).toEqual(
        expect.objectContaining({
          queueLength: 2,
        })
      );
    });

    it("should publish an event", async () => {
      await createSuggestions(USER_A.id, true);

      // has been published
      expect(natsWrapper.client.publish).toHaveBeenCalled();
    });
  });

  describe("add suggestions", () => {
    beforeEach(async () => {
      await Suggestion.build({
        user: USER_A.id,
        mediaItem: mongoose.Types.ObjectId().toHexString(),
      }).save();
    });

    it("should not clear suggestions", async () => {
      await createSuggestions(USER_A.id, false);

      // has exactly 3 documents
      expect(await Suggestion.countDocuments()).toBe(3);
    });

    it("should update queue length correctly", async () => {
      await createSuggestions(USER_A.id, false);

      // has been updated
      expect(await User.findById(USER_A.id)).toEqual(
        expect.objectContaining({
          queueLength: 3,
        })
      );
    });

    it("should publish an event", async () => {
      await createSuggestions(USER_A.id, false);

      // has been published
      expect(natsWrapper.client.publish).toHaveBeenCalled();
    });
  });
});
