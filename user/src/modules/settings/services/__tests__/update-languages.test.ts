import { BadRequestError } from "@flickswipe/common";
import { natsWrapper } from "../../../../nats-wrapper";
import { Setting, SettingDoc } from "../../models/setting";
import { updateLanguages } from "../update-languages";

// sample data
import {
  LANGUAGES_SETTING,
  LANGUAGES_SETTING_EMPTY,
} from "../../../../test/sample-data/settings";
const INVALID_ID = "invalid-id";

describe("update languages setting", () => {
  describe("invalid conditions", () => {
    describe("invalid user id", () => {
      it("should throw error", async () => {
        // throws error
        await expect(async () => {
          await updateLanguages(INVALID_ID, LANGUAGES_SETTING.value);
        }).rejects.toThrow(BadRequestError);
      });
    });

    describe("invalid input", () => {
      it("should throw error", async () => {
        // throws error
        await expect(async () => {
          await updateLanguages(LANGUAGES_SETTING.user, {
            // @ts-ignore
            [INVALID_ID]: true,
          });
        }).rejects.toThrow(BadRequestError);
      });
    });
  });

  describe("valid conditions", () => {
    describe("setting exists", () => {
      let existingDoc: SettingDoc;
      beforeEach(async () => {
        existingDoc = await Setting.build(LANGUAGES_SETTING_EMPTY).save();
      });

      it("should update setting", async () => {
        await updateLanguages(LANGUAGES_SETTING.user, LANGUAGES_SETTING.value);

        // has been updated
        expect(await Setting.findById(existingDoc.id)).toEqual(
          expect.objectContaining({
            value: LANGUAGES_SETTING.value,
          })
        );
      });

      it("should publish event", async () => {
        await updateLanguages(LANGUAGES_SETTING.user, LANGUAGES_SETTING.value);

        // has been published
        expect(natsWrapper.client.publish).toHaveBeenCalled();
      });
    });

    describe("no setting exists", () => {
      it("should create setting", async () => {
        await updateLanguages(LANGUAGES_SETTING.user, LANGUAGES_SETTING.value);

        // has been created
        expect(
          await Setting.findOne({
            settingType: LANGUAGES_SETTING.settingType,
            user: LANGUAGES_SETTING.user,
          })
        ).toEqual(
          expect.objectContaining({
            value: LANGUAGES_SETTING.value,
          })
        );
      });

      it("should publish event", async () => {
        await updateLanguages(LANGUAGES_SETTING.user, LANGUAGES_SETTING.value);

        // has been published
        expect(natsWrapper.client.publish).toHaveBeenCalled();
      });
    });
  });
});
