import { BadRequestError, iso6391, SettingType } from "@flickswipe/common";
import { natsWrapper } from "../../../../nats-wrapper";
import { Setting, SettingDoc } from "../../models/setting";
import { updateLanguages } from "../update-languages";

describe("update languages setting", () => {
  const userId = "useruseruser";

  const languagesSetting = {
    en: true,
    es: false,
  } as Record<iso6391, boolean>;

  describe("invalid user id", () => {
    it("should throw bad request error", async () => {
      await expect(async () => {
        await updateLanguages("invalid-id", languagesSetting);
      }).rejects.toThrow(BadRequestError);
    });
  });

  describe("invalid input", () => {
    it("should throw bad request error", async () => {
      await expect(async () => {
        await updateLanguages("useruser", {
          // @ts-ignore
          "invalid-id": true,
        });
      }).rejects.toThrow(BadRequestError);
    });
  });

  describe("setting exists", () => {
    let existingDoc: SettingDoc;

    beforeEach(async () => {
      existingDoc = await Setting.build({
        settingType: SettingType.Languages,
        user: userId,
        value: {
          en: false,
          es: true,
        } as Record<iso6391, boolean>,
      }).save();
    });

    it("should update setting", async () => {
      await updateLanguages(userId, languagesSetting);

      expect(
        await Setting.findOne({
          _id: existingDoc._id,
        })
      ).toEqual(
        expect.objectContaining({
          value: languagesSetting,
        })
      );
    });

    it("should publish event", async () => {
      await updateLanguages(userId, languagesSetting);

      expect(natsWrapper.client.publish).toHaveBeenCalled();
    });
  });

  describe("setting doesn't exist", () => {
    it("should create setting", async () => {
      await updateLanguages(userId, languagesSetting);

      expect(
        await Setting.findOne({
          settingType: SettingType.Languages,
          user: userId,
        })
      ).toEqual(
        expect.objectContaining({
          value: languagesSetting,
        })
      );
    });

    it("should publish event", async () => {
      await updateLanguages(userId, languagesSetting);

      expect(natsWrapper.client.publish).toHaveBeenCalled();
    });
  });
});
