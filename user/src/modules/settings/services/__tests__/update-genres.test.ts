import { BadRequestError, SettingType } from "@flickswipe/common";
import { Setting, SettingDoc } from "../../models/setting";
import { updateGenres } from "../update-genres";

describe("update genres setting", () => {
  const genresSetting = {
    abcdefabcdef: true,
    bcdbcdbcdbcd: false,
  };

  describe("invalid user id", () => {
    it("should throw bad request error", async () => {
      await expect(async () => {
        await updateGenres("invalid-id", genresSetting);
      }).rejects.toThrow(BadRequestError);
    });
  });

  describe("invalid input", () => {
    it("should throw bad request error", async () => {
      await expect(async () => {
        await updateGenres("useruser", {
          "invalid-id": true,
        });
      }).rejects.toThrow(BadRequestError);
    });
  });

  describe("setting exists", () => {
    let existingDoc: SettingDoc;

    beforeEach(async () => {
      existingDoc = await Setting.build({
        settingType: SettingType.Genres,
        user: "useruseruser",
        value: {
          abcdefabcdef: false,
          bcdbcdbcdbcd: true,
        },
      }).save();
    });

    it("should update setting", async () => {
      await updateGenres("useruseruser", genresSetting);

      expect(
        await Setting.findOne({
          _id: existingDoc._id,
        })
      ).toEqual(
        expect.objectContaining({
          value: genresSetting,
        })
      );
    });
  });

  describe("setting doesn't exist", () => {
    it("should create setting", async () => {
      await updateGenres("useruseruser", genresSetting);

      expect(
        await Setting.findOne({
          settingType: SettingType.Genres,
          user: "useruseruser",
        })
      ).toEqual(
        expect.objectContaining({
          value: genresSetting,
        })
      );
    });
  });
});
