import { BadRequestError } from '@flickswipe/common';

import { natsWrapper } from '../../../../nats-wrapper';
// sample data
import {
    RELEASE_DATE_SETTING, RELEASE_DATE_SETTING_EMPTY
} from '../../../../test/sample-data/settings';
import { Setting, SettingDoc } from '../../models/setting';
import { updateReleaseDate } from '../update-release-date';

const INVALID_ID = "invalid-id";
const INVALID_VALUE_A = {
  min: [] as any,
  max: 0,
};
const INVALID_VALUE_B = {
  min: 100,
  max: [] as any,
};
const INVALID_VALUE_C = {
  min: new Date("01-01-2020"),
  max: new Date("01-01-1970"),
};

describe("update release date setting", () => {
  describe("invalid conditions", () => {
    describe("invalid user id", () => {
      it("should throw error", async () => {
        // throws error
        await expect(async () => {
          await updateReleaseDate(INVALID_ID, RELEASE_DATE_SETTING.value);
        }).rejects.toThrow(BadRequestError);
      });
    });

    describe("min is not a number", () => {
      it("should throw error", async () => {
        // throws error
        await expect(async () => {
          await updateReleaseDate(
            RELEASE_DATE_SETTING.user,
            INVALID_VALUE_A as any
          );
        }).rejects.toThrow(BadRequestError);
      });
    });
    describe("max is not a number", () => {
      it("should throw error", async () => {
        // throws error
        await expect(async () => {
          await updateReleaseDate(
            RELEASE_DATE_SETTING.user,
            INVALID_VALUE_B as any
          );
        }).rejects.toThrow(BadRequestError);
      });
    });
    describe("max is greater than min", () => {
      it("should throw error", async () => {
        // throws error
        await expect(async () => {
          await updateReleaseDate(RELEASE_DATE_SETTING.user, INVALID_VALUE_C);
        }).rejects.toThrow(BadRequestError);
      });
    });
  });

  describe("valid conditions", () => {
    describe("setting exists", () => {
      let existingDoc: SettingDoc;
      beforeEach(async () => {
        existingDoc = await Setting.build(RELEASE_DATE_SETTING_EMPTY).save();
      });

      it("should update setting", async () => {
        await updateReleaseDate(
          RELEASE_DATE_SETTING.user,
          RELEASE_DATE_SETTING.value
        );

        // has been updated
        expect(await Setting.findById(existingDoc.id)).toEqual(
          expect.objectContaining({
            value: RELEASE_DATE_SETTING.value,
          })
        );
      });

      it("should publish event", async () => {
        await updateReleaseDate(
          RELEASE_DATE_SETTING.user,
          RELEASE_DATE_SETTING.value
        );

        // has been published
        expect(natsWrapper.client.publish).toHaveBeenCalled();
      });
    });

    describe("no setting exists", () => {
      it("should create setting", async () => {
        await updateReleaseDate(
          RELEASE_DATE_SETTING.user,
          RELEASE_DATE_SETTING.value
        );

        // has been created
        expect(
          await Setting.findOne({
            settingType: RELEASE_DATE_SETTING.settingType,
            user: RELEASE_DATE_SETTING.user,
          })
        ).toEqual(
          expect.objectContaining({
            value: RELEASE_DATE_SETTING.value,
          })
        );
      });
    });

    it("should publish event", async () => {
      await updateReleaseDate(
        RELEASE_DATE_SETTING.user,
        RELEASE_DATE_SETTING.value
      );

      // has been published
      expect(natsWrapper.client.publish).toHaveBeenCalled();
    });
  });
});
