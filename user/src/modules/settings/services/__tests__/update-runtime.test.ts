import { BadRequestError } from "@flickswipe/common";
import { natsWrapper } from "../../../../nats-wrapper";
import { Setting, SettingDoc } from "../../models/setting";
import { updateRuntime } from "../update-runtime";

// sample data
import {
  RUNTIME_SETTING,
  RUNTIME_SETTING_EMPTY,
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

describe("update runtime setting", () => {
  describe("invalid conditions", () => {
    describe("invalid user id", () => {
      it("should throw error", async () => {
        // throws error
        await expect(async () => {
          await updateRuntime(INVALID_ID, RUNTIME_SETTING.value);
        }).rejects.toThrow(BadRequestError);
      });
    });

    describe("min is not a number", () => {
      it("should throw error", async () => {
        // throws error
        await expect(async () => {
          await updateRuntime(RUNTIME_SETTING.user, INVALID_VALUE_A as any);
        }).rejects.toThrow(BadRequestError);
      });
    });

    describe("max is not a number", () => {
      it("should throw error", async () => {
        // throws error
        await expect(async () => {
          await updateRuntime(RUNTIME_SETTING.user, INVALID_VALUE_B as any);
        }).rejects.toThrow(BadRequestError);
      });
    });

    describe("max is greater than min", () => {
      it("should throw error", async () => {
        // throws error
        await expect(async () => {
          await updateRuntime(RUNTIME_SETTING.user, INVALID_VALUE_C);
        }).rejects.toThrow(BadRequestError);
      });
    });
  });

  describe("valid conditions", () => {
    describe("setting exists", () => {
      let existingDoc: SettingDoc;
      beforeEach(async () => {
        existingDoc = await Setting.build(RUNTIME_SETTING_EMPTY).save();
      });

      it("should update setting", async () => {
        await updateRuntime(RUNTIME_SETTING.user, RUNTIME_SETTING.value);

        // has been updated
        expect(await Setting.findById(existingDoc.id)).toEqual(
          expect.objectContaining({
            value: RUNTIME_SETTING.value,
          })
        );
      });

      it("should publish event", async () => {
        await updateRuntime(RUNTIME_SETTING.user, RUNTIME_SETTING.value);

        // has been published
        expect(natsWrapper.client.publish).toHaveBeenCalled();
      });
    });

    describe("no setting exists", () => {
      it("should create setting", async () => {
        await updateRuntime(RUNTIME_SETTING.user, RUNTIME_SETTING.value);

        // has been created
        expect(
          await Setting.findOne({
            settingType: RUNTIME_SETTING.settingType,
            user: RUNTIME_SETTING.user,
          })
        ).toEqual(
          expect.objectContaining({
            value: RUNTIME_SETTING.value,
          })
        );
      });
    });

    it("should publish event", async () => {
      await updateRuntime(RUNTIME_SETTING.user, RUNTIME_SETTING.value);

      // has been published
      expect(natsWrapper.client.publish).toHaveBeenCalled();
    });
  });
});
