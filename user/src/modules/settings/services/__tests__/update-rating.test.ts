import { BadRequestError } from "@flickswipe/common";
import { natsWrapper } from "../../../../nats-wrapper";
import { Setting, SettingDoc } from "../../models/setting";
import { updateRating } from "../update-rating";

// sample data
import {
  RATING_SETTING,
  RATING_SETTING_EMPTY,
} from "../../../../test/sample-data/settings";
const INVALID_ID = "invalid-id";
const INVALID_VALUE_A = {
  min: "100",
  max: 0,
};
const INVALID_VALUE_B = {
  min: 100,
  max: "0",
};
const INVALID_VALUE_C = {
  min: 100,
  max: 0,
};

describe("update rating setting", () => {
  describe("invalid conditions", () => {
    describe("invalid user id", () => {
      it("should throw error", async () => {
        // throws error
        await expect(async () => {
          await updateRating(INVALID_ID, RATING_SETTING.value);
        }).rejects.toThrow(BadRequestError);
      });
    });

    describe("min is not a number", () => {
      it("should throw error", async () => {
        // throws error
        await expect(async () => {
          await updateRating(RATING_SETTING.user, INVALID_VALUE_A as any);
        }).rejects.toThrow(BadRequestError);
      });
    });

    describe("max is not a number", () => {
      it("should throw error", async () => {
        // throws error
        await expect(async () => {
          await updateRating(RATING_SETTING.user, INVALID_VALUE_B as any);
        }).rejects.toThrow(BadRequestError);
      });
    });

    describe("max is greater than min", () => {
      it("should throw error", async () => {
        // throws error
        await expect(async () => {
          await updateRating(RATING_SETTING.user, INVALID_VALUE_C);
        }).rejects.toThrow(BadRequestError);
      });
    });
  });
  describe("valid conditions", () => {
    describe("setting exists", () => {
      let existingDoc: SettingDoc;
      beforeEach(async () => {
        existingDoc = await Setting.build(RATING_SETTING_EMPTY).save();
      });

      it("should update setting", async () => {
        await updateRating(RATING_SETTING.user, RATING_SETTING.value);

        // has been updated
        expect(await Setting.findById(existingDoc.id)).toEqual(
          expect.objectContaining({
            value: RATING_SETTING.value,
          })
        );
      });

      it("should publish event", async () => {
        await updateRating(RATING_SETTING.user, RATING_SETTING.value);

        // has been published
        expect(natsWrapper.client.publish).toHaveBeenCalled();
      });
    });

    describe("no setting exists", () => {
      it("should create setting", async () => {
        await updateRating(RATING_SETTING.user, RATING_SETTING.value);

        // has been created
        expect(
          await Setting.findOne({
            settingType: RATING_SETTING_EMPTY.settingType,
            user: RATING_SETTING.user,
          })
        ).toEqual(
          expect.objectContaining({
            value: RATING_SETTING.value,
          })
        );
      });
    });

    it("should publish event", async () => {
      await updateRating(RATING_SETTING.user, RATING_SETTING.value);

      // has been published
      expect(natsWrapper.client.publish).toHaveBeenCalled();
    });
  });
});
