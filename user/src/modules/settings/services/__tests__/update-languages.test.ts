import { BadRequestError } from '@flickswipe/common';

import { natsWrapper } from '../../../../nats-wrapper';
// sample data
import {
    AUDIO_LANGUAGES_SETTING, AUDIO_LANGUAGES_SETTING_EMPTY
} from '../../../../test/sample-data/settings';
import { Setting, SettingDoc } from '../../models/setting';
import { updateAudioLanguages } from '../update-languages';

const INVALID_ID = "invalid-id";

describe("update audioLanguages setting", () => {
  describe("invalid conditions", () => {
    describe("invalid user id", () => {
      it("should throw error", async () => {
        // throws error
        await expect(async () => {
          await updateAudioLanguages(INVALID_ID, AUDIO_LANGUAGES_SETTING.value);
        }).rejects.toThrow(BadRequestError);
      });
    });

    describe("invalid input", () => {
      it("should throw error", async () => {
        // throws error
        await expect(async () => {
          await updateAudioLanguages(AUDIO_LANGUAGES_SETTING.user, {
            // @ts-ignore
            [INVALID_ID]: true,
          });
        }).rejects.toThrow(BadRequestError);
      });
    });
  });

  describe("valid conditions", () => {
    describe("setting exists", () => {
      let existingDoc: SettingDoc;
      beforeEach(async () => {
        existingDoc = await Setting.build(AUDIO_LANGUAGES_SETTING_EMPTY).save();
      });

      it("should update setting", async () => {
        await updateAudioLanguages(
          AUDIO_LANGUAGES_SETTING.user,
          AUDIO_LANGUAGES_SETTING.value
        );

        // has been updated
        expect(await Setting.findById(existingDoc.id)).toEqual(
          expect.objectContaining({
            value: AUDIO_LANGUAGES_SETTING.value,
          })
        );
      });

      it("should publish event", async () => {
        await updateAudioLanguages(
          AUDIO_LANGUAGES_SETTING.user,
          AUDIO_LANGUAGES_SETTING.value
        );

        // has been published
        expect(natsWrapper.client.publish).toHaveBeenCalled();
      });
    });

    describe("no setting exists", () => {
      it("should create setting", async () => {
        await updateAudioLanguages(
          AUDIO_LANGUAGES_SETTING.user,
          AUDIO_LANGUAGES_SETTING.value
        );

        // has been created
        expect(
          await Setting.findOne({
            settingType: AUDIO_LANGUAGES_SETTING.settingType,
            user: AUDIO_LANGUAGES_SETTING.user,
          })
        ).toEqual(
          expect.objectContaining({
            value: AUDIO_LANGUAGES_SETTING.value,
          })
        );
      });

      it("should publish event", async () => {
        await updateAudioLanguages(
          AUDIO_LANGUAGES_SETTING.user,
          AUDIO_LANGUAGES_SETTING.value
        );

        // has been published
        expect(natsWrapper.client.publish).toHaveBeenCalled();
      });
    });
  });
});
