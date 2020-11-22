import { BadRequestError, SettingType } from "@flickswipe/common";
import { natsWrapper } from "../../../../nats-wrapper";
import { Setting, SettingDoc } from "../../models/setting";
import { updateStreamLocations } from "../update-stream-locations";

describe("update stream locations setting", () => {
  const userId = "useruseruser";

  const streamLocationsSetting = {
    abcdefabcdef: true,
    bcdbcdbcdbcd: false,
  };

  describe("invalid user id", () => {
    it("should throw bad request error", async () => {
      await expect(async () => {
        await updateStreamLocations("invalid-id", streamLocationsSetting);
      }).rejects.toThrow(BadRequestError);
    });
  });

  describe("invalid input", () => {
    it("should throw bad request error", async () => {
      await expect(async () => {
        await updateStreamLocations("useruser", {
          "invalid-id": true,
        });
      }).rejects.toThrow(BadRequestError);
    });
  });

  describe("setting exists", () => {
    let existingDoc: SettingDoc;

    beforeEach(async () => {
      existingDoc = await Setting.build({
        settingType: SettingType.StreamLocations,
        user: userId,
        value: {
          abcdefabcdef: false,
          bcdbcdbcdbcd: true,
        },
      }).save();
    });

    it("should update setting", async () => {
      await updateStreamLocations(userId, streamLocationsSetting);

      expect(
        await Setting.findOne({
          _id: existingDoc._id,
        })
      ).toEqual(
        expect.objectContaining({
          value: streamLocationsSetting,
        })
      );
    });

    it("should publish event", async () => {
      await updateStreamLocations(userId, streamLocationsSetting);

      expect(natsWrapper.client.publish).toHaveBeenCalled();
    });
  });

  describe("setting doesn't exist", () => {
    it("should create setting", async () => {
      await updateStreamLocations(userId, streamLocationsSetting);

      expect(
        await Setting.findOne({
          settingType: SettingType.StreamLocations,
          user: userId,
        })
      ).toEqual(
        expect.objectContaining({
          value: streamLocationsSetting,
        })
      );
    });

    it("should publish event", async () => {
      await updateStreamLocations(userId, streamLocationsSetting);

      expect(natsWrapper.client.publish).toHaveBeenCalled();
    });
  });
});
