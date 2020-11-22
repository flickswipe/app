import { BadRequestError, SettingType } from "@flickswipe/common";
import { natsWrapper } from "../../../../nats-wrapper";
import { Setting, SettingDoc } from "../../models/setting";
import { updateRating } from "../update-rating";

describe("update rating setting", () => {
  const userId = "useruseruser";

  const ratingSetting = {
    min: 0,
    max: 10,
  };

  describe("invalid user id", () => {
    it("should throw bad request error", async () => {
      await expect(async () => {
        await updateRating("invalid-id", ratingSetting);
      }).rejects.toThrow(BadRequestError);
    });
  });

  describe("invalid input", () => {
    it("should throw bad request error", async () => {
      await expect(async () => {
        await updateRating("useruser", {
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
        settingType: SettingType.Rating,
        user: userId,
        value: {
          min: 3,
          max: 6,
        },
      }).save();
    });

    it("should update setting", async () => {
      await updateRating(userId, ratingSetting);

      expect(
        await Setting.findOne({
          _id: existingDoc._id,
        })
      ).toEqual(
        expect.objectContaining({
          value: ratingSetting,
        })
      );
    });

    it("should publish event", async () => {
      await updateRating(userId, ratingSetting);

      expect(natsWrapper.client.publish).toHaveBeenCalled();
    });
  });

  describe("setting doesn't exist", () => {
    it("should create setting", async () => {
      await updateRating(userId, ratingSetting);

      expect(
        await Setting.findOne({
          settingType: SettingType.Rating,
          user: userId,
        })
      ).toEqual(
        expect.objectContaining({
          value: ratingSetting,
        })
      );
    });
  });

  it("should publish event", async () => {
    await updateRating(userId, ratingSetting);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });
});
