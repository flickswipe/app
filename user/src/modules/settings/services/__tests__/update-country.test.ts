import { BadRequestError } from "@flickswipe/common";
import { natsWrapper } from "../../../../nats-wrapper";
import { Setting, SettingDoc } from "../../models/setting";
import { updateCountry } from "../update-country";

// sample data
import {
  COUNTRY_SETTING,
  COUNTRY_SETTING_EMPTY,
} from "../../../../test/sample-data/settings";
const INVALID_ID = "invalid-id";

describe("update country setting", () => {
  describe("invalid conditions", () => {
    describe("invalid id", () => {
      it("should throw error", async () => {
        // throws error
        await expect(async () => {
          await updateCountry(INVALID_ID, COUNTRY_SETTING.value);
        }).rejects.toThrow(BadRequestError);
      });
    });
  });

  describe("valid conditions", () => {
    describe("setting exists", () => {
      let existingDoc: SettingDoc;
      beforeEach(async () => {
        existingDoc = await Setting.build(COUNTRY_SETTING_EMPTY).save();
      });

      it("should update setting", async () => {
        await updateCountry(COUNTRY_SETTING.user, COUNTRY_SETTING.value);

        // has been updated
        expect(await Setting.findById(existingDoc.id)).toEqual(
          expect.objectContaining({
            value: COUNTRY_SETTING.value,
          })
        );
      });

      it("should publish event", async () => {
        await updateCountry(COUNTRY_SETTING.user, COUNTRY_SETTING.value);

        // has been published
        expect(natsWrapper.client.publish).toHaveBeenCalled();
      });
    });

    describe("no setting exist", () => {
      it("should create setting", async () => {
        await updateCountry(COUNTRY_SETTING.user, COUNTRY_SETTING.value);

        // has been created
        expect(
          await Setting.findOne({
            settingType: COUNTRY_SETTING.settingType,
            user: COUNTRY_SETTING.user,
          })
        ).toEqual(
          expect.objectContaining({
            value: COUNTRY_SETTING.value,
          })
        );
      });

      it("should publish event", async () => {
        await updateCountry(COUNTRY_SETTING.user, COUNTRY_SETTING.value);

        // has been published
        expect(natsWrapper.client.publish).toHaveBeenCalled();
      });
    });
  });
});
