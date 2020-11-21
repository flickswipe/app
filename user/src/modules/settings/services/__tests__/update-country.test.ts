import { BadRequestError, SettingType } from "@flickswipe/common";
import { Setting, SettingDoc } from "../../models/setting";
import { updateCountry } from "../update-country";

describe("update country setting", () => {
  describe("invalid user id", () => {
    it("should throw bad request error", async () => {
      await expect(async () => {
        await updateCountry("invalid-id", "us");
      }).rejects.toThrow(BadRequestError);
    });
  });

  describe("setting exists", () => {
    let existingDoc: SettingDoc;

    beforeEach(async () => {
      existingDoc = await Setting.build({
        settingType: SettingType.Country,
        user: "useruseruser",
        value: "uk",
      }).save();
    });

    it("should update setting", async () => {
      await updateCountry("useruseruser", "us");

      expect(
        await Setting.findOne({
          _id: existingDoc._id,
        })
      ).toEqual(
        expect.objectContaining({
          value: "us",
        })
      );
    });
  });

  describe("setting doesn't exist", () => {
    it("should create setting", async () => {
      await updateCountry("useruseruser", "us");

      expect(
        await Setting.findOne({
          settingType: SettingType.Country,
          user: "useruseruser",
        })
      ).toEqual(
        expect.objectContaining({
          value: "us",
        })
      );
    });
  });
});
