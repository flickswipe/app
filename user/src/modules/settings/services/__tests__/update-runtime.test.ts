import { BadRequestError, SettingType } from "@flickswipe/common";
import { natsWrapper } from "../../../../nats-wrapper";
import { Setting, SettingDoc } from "../../models/setting";
import { updateRuntime } from "../update-runtime";

describe("update runtime setting", () => {
  const userId = "useruseruser";

  const runtimeSetting = {
    min: 30,
    max: 180,
  };

  describe("invalid user id", () => {
    it("should throw bad request error", async () => {
      await expect(async () => {
        await updateRuntime("invalid-id", runtimeSetting);
      }).rejects.toThrow(BadRequestError);
    });
  });

  describe("invalid input", () => {
    it("should throw bad request error", async () => {
      await expect(async () => {
        await updateRuntime("useruser", {
          min: 100,
          max: 0,
        });
      }).rejects.toThrow(BadRequestError);
    });
  });

  describe("setting exists", () => {
    let existingDoc: SettingDoc;

    beforeEach(async () => {
      existingDoc = await Setting.build({
        settingType: SettingType.Runtime,
        user: userId,
        value: {
          min: 0,
          max: 999,
        },
      }).save();
    });

    it("should update setting", async () => {
      await updateRuntime(userId, runtimeSetting);

      expect(
        await Setting.findOne({
          _id: existingDoc._id,
        })
      ).toEqual(
        expect.objectContaining({
          value: runtimeSetting,
        })
      );
    });

    it("should publish event", async () => {
      await updateRuntime(userId, runtimeSetting);

      expect(natsWrapper.client.publish).toHaveBeenCalled();
    });
  });

  describe("setting doesn't exist", () => {
    it("should create setting", async () => {
      await updateRuntime(userId, runtimeSetting);

      expect(
        await Setting.findOne({
          settingType: SettingType.Runtime,
          user: userId,
        })
      ).toEqual(
        expect.objectContaining({
          value: runtimeSetting,
        })
      );
    });
  });

  it("should publish event", async () => {
    await updateRuntime(userId, runtimeSetting);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });
});
