import { BadRequestError, SettingType } from "@flickswipe/common";
import { natsWrapper } from "../../../../nats-wrapper";
import { Setting, SettingDoc } from "../../models/setting";
import { updateReleaseDate } from "../update-release-date";

describe("update release date setting", () => {
  const userId = "useruseruser";

  const releaseDateSetting = {
    min: new Date("01-01-1970"),
  };

  describe("invalid user id", () => {
    it("should throw bad request error", async () => {
      await expect(async () => {
        await updateReleaseDate("invalid-id", releaseDateSetting);
      }).rejects.toThrow(BadRequestError);
    });
  });

  describe("invalid input", () => {
    it("should throw bad request error", async () => {
      await expect(async () => {
        await updateReleaseDate("useruser", {
          min: new Date("01-01-2020"),
          max: new Date("01-01-1970"),
        });
      }).rejects.toThrow(BadRequestError);
    });
  });

  describe("setting exists", () => {
    let existingDoc: SettingDoc;

    beforeEach(async () => {
      existingDoc = await Setting.build({
        settingType: SettingType.ReleaseDate,
        user: userId,
        value: {
          max: new Date("01-01-1970"),
        },
      }).save();
    });

    it("should update setting", async () => {
      await updateReleaseDate(userId, releaseDateSetting);

      expect(
        await Setting.findOne({
          _id: existingDoc._id,
        })
      ).toEqual(
        expect.objectContaining({
          value: releaseDateSetting,
        })
      );
    });

    it("should publish event", async () => {
      await updateReleaseDate(userId, releaseDateSetting);

      expect(natsWrapper.client.publish).toHaveBeenCalled();
    });
  });

  describe("setting doesn't exist", () => {
    it("should create setting", async () => {
      await updateReleaseDate(userId, releaseDateSetting);

      expect(
        await Setting.findOne({
          settingType: SettingType.ReleaseDate,
          user: userId,
        })
      ).toEqual(
        expect.objectContaining({
          value: releaseDateSetting,
        })
      );
    });
  });

  it("should publish event", async () => {
    await updateReleaseDate(userId, releaseDateSetting);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });
});
