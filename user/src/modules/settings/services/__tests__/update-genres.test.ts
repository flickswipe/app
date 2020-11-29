import { BadRequestError } from "@flickswipe/common";
import { natsWrapper } from "../../../../nats-wrapper";
import { Setting, SettingDoc } from "../../models/setting";
import { updateGenres } from "../update-genres";

// sample data
import {
  GENRES_SETTING,
  GENRES_SETTING_EMPTY,
} from "../../../../test/sample-data/settings";
const INVALID_ID = "invalid-id";

describe("update genres setting", () => {
  describe("invalid conditions", () => {
    describe("invalid user id", () => {
      it("should throw error", async () => {
        // throws error
        await expect(async () => {
          await updateGenres(INVALID_ID, GENRES_SETTING.value);
        }).rejects.toThrow(BadRequestError);
      });
    });

    describe("invalid input", () => {
      it("should throw error", async () => {
        // throws error
        await expect(async () => {
          await updateGenres(GENRES_SETTING.user, {
            [INVALID_ID as any]: true,
          });
        }).rejects.toThrow(BadRequestError);
      });
    });
  });

  describe("valid conditions", () => {
    describe("setting exists", () => {
      let existingDoc: SettingDoc;
      beforeEach(async () => {
        existingDoc = await Setting.build(GENRES_SETTING_EMPTY).save();
      });

      it("should update setting", async () => {
        await updateGenres(GENRES_SETTING.user, GENRES_SETTING.value);

        // has been updated
        expect(await Setting.findById(existingDoc.id)).toEqual(
          expect.objectContaining({
            value: GENRES_SETTING.value,
          })
        );
      });

      it("should publish event", async () => {
        await updateGenres(GENRES_SETTING.user, GENRES_SETTING.value);

        // has been published
        expect(natsWrapper.client.publish).toHaveBeenCalled();
      });
    });

    describe("no setting exists", () => {
      it("should create setting", async () => {
        await updateGenres(GENRES_SETTING.user, GENRES_SETTING.value);

        // has been created
        expect(
          await Setting.findOne({
            settingType: GENRES_SETTING.settingType,
            user: GENRES_SETTING.user,
          })
        ).toEqual(
          expect.objectContaining({
            value: GENRES_SETTING.value,
          })
        );
      });

      it("should publish event", async () => {
        await updateGenres(GENRES_SETTING.user, GENRES_SETTING.value);

        // has been published
        expect(natsWrapper.client.publish).toHaveBeenCalled();
      });
    });
  });
});
