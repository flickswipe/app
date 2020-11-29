import { BadRequestError } from "@flickswipe/common";
import { natsWrapper } from "../../../../nats-wrapper";
import { Setting, SettingDoc } from "../../models/setting";
import { updateStreamLocations } from "../update-stream-locations";

// sample data
import {
  STREAM_LOCATIONS_SETTING,
  STREAM_LOCATIONS_SETTING_EMPTY,
} from "../../../../test/sample-data/settings";
const INVALID_ID = "invalid-id";
const INVALID_VALUE = {
  [INVALID_ID]: true,
};

describe("update stream locations setting", () => {
  describe("invalid conditions", () => {
    describe("invalid user id", () => {
      it("should throw error", async () => {
        // throws error
        await expect(async () => {
          await updateStreamLocations(
            INVALID_ID,
            STREAM_LOCATIONS_SETTING.value
          );
        }).rejects.toThrow(BadRequestError);
      });
    });

    describe("invalid input", () => {
      it("should throw error", async () => {
        // throws error
        await expect(async () => {
          await updateStreamLocations(
            STREAM_LOCATIONS_SETTING.user,
            INVALID_VALUE
          );
        }).rejects.toThrow(BadRequestError);
      });
    });
  });

  describe("valid conditions", () => {
    describe("setting exists", () => {
      let existingDoc: SettingDoc;
      beforeEach(async () => {
        existingDoc = await Setting.build(
          STREAM_LOCATIONS_SETTING_EMPTY
        ).save();
      });

      it("should update setting", async () => {
        await updateStreamLocations(
          STREAM_LOCATIONS_SETTING.user,
          STREAM_LOCATIONS_SETTING.value
        );

        // has been updated
        expect(await Setting.findById(existingDoc.id)).toEqual(
          expect.objectContaining({
            value: STREAM_LOCATIONS_SETTING.value,
          })
        );
      });

      it("should publish event", async () => {
        await updateStreamLocations(
          STREAM_LOCATIONS_SETTING.user,
          STREAM_LOCATIONS_SETTING.value
        );

        // has been published
        expect(natsWrapper.client.publish).toHaveBeenCalled();
      });
    });

    describe("no setting exists", () => {
      it("should create setting", async () => {
        await updateStreamLocations(
          STREAM_LOCATIONS_SETTING.user,
          STREAM_LOCATIONS_SETTING.value
        );

        // has been created
        expect(
          await Setting.findOne({
            settingType: STREAM_LOCATIONS_SETTING.settingType,
            user: STREAM_LOCATIONS_SETTING.user,
          })
        ).toEqual(
          expect.objectContaining({
            value: STREAM_LOCATIONS_SETTING.value,
          })
        );
      });

      it("should publish event", async () => {
        await updateStreamLocations(
          STREAM_LOCATIONS_SETTING.user,
          STREAM_LOCATIONS_SETTING.value
        );

        // has been published
        expect(natsWrapper.client.publish).toHaveBeenCalled();
      });
    });
  });
});
