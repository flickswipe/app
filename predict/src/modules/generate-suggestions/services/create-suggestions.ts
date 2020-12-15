import {
    AnySetting, AudioLanguagesSetting, BadRequestError, CountrySetting, GenresSetting,
    RatingSetting, ReleaseDateSetting, RuntimeSetting, SettingType, StreamLocationsSetting
} from '@flickswipe/common';

import { natsWrapper } from '../../../nats-wrapper';
import { queryMediaItems } from '../../track-ingest/services/query-media-items';
import { getSurveyResponses } from '../../track-survey/track-survey';
import { getSettings } from '../../track-user-settings/track-user-settings';
import { MediaItemsSuggestedPublisher } from '../events/publishers/media-items-suggested';
import { Suggestion, SuggestionDoc } from '../models/suggestion';
import { User } from '../models/user';

const MAX_SUGGESTIONS_TO_GENERATE = 50;

type SimpleSetting = Omit<AnySetting, "user" | "updatedAt">;

export async function createSuggestions(
  userId: string,
  clearExistingSuggestions = false
): Promise<void> {
  // get settings
  // get queue length
  const [settings, userDoc] = await Promise.all([
    getUserSettings(userId),
    User.findById(userId),
  ]);

  if (!userDoc) {
    throw new BadRequestError(`User ${userId} does not exist`);
  }

  // get previous queue length
  const prevQueueLength = userDoc.queueLength;

  // clear queue if necessary
  if (clearExistingSuggestions) {
    // delete suggestions
    await Suggestion.deleteMany({ user: userId });
  }

  // create new suggestions
  const suggestions = await getUserSuggestions(userId, settings);

  // update suggestions collection
  await Promise.all(
    suggestions.map((mediaItem) =>
      Suggestion.build({
        user: userId,
        mediaItem: mediaItem,
      }).save()
    )
  );

  // update with new queue length
  userDoc.queueLength = await Suggestion.countDocuments({ user: userId });
  await userDoc.save();

  // publish new suggestions
  // delete old suggestions
  new MediaItemsSuggestedPublisher(natsWrapper.client).publish({
    user: userId,
    mediaItems: suggestions,
    clearExistingSuggestions: clearExistingSuggestions || prevQueueLength === 0,
  });

  console.info(`User ${userId} created ${suggestions.length} new suggestions`);
}

/**
 * @param userId user to get settings for
 */
async function getUserSettings(userId: string): Promise<SimpleSetting[]> {
  const settings = (await getSettings(userId)).map((doc) => ({
    settingType: doc.settingType,
    value: doc.value,
  }));

  return settings;
}

/**
 * @param userId user to get previous suggestions for
 */
async function getPreviousSuggestions(userId: string): Promise<string[]> {
  const suggestions = (await Suggestion.find({ user: userId })).map(
    (doc: SuggestionDoc) => doc.mediaItem
  );

  return suggestions;
}

/**
 * @param userId user to get survey responses for
 */
async function getMediaItemsWithSurveyResponses(
  userId: string
): Promise<string[]> {
  const surveyResponses = (await getSurveyResponses(userId)).map(
    (doc: { mediaItem: string }) => doc.mediaItem
  );

  return surveyResponses;
}

/**
 * Create suggestions for a user
 *
 * @param userId user to get suggestions for
 * @param settings settings to restrict suggestions
 */
async function getUserSuggestions(
  userId: string,
  settings: SimpleSetting[]
): Promise<string[]> {
  // Base query
  const query = {};

  // ignore media items that are already suggested / have survey responses
  const [
    previousSuggestions,
    mediaItemsWithSurveyResponses,
  ] = await Promise.all([
    getPreviousSuggestions(userId),
    getMediaItemsWithSurveyResponses(userId),
  ]);
  const ignoreIds = Array.from(
    new Set([].concat(previousSuggestions, mediaItemsWithSurveyResponses))
  );
  if (ignoreIds.length)
    Object.assign(query, {
      _id: {
        $nin: ignoreIds,
      },
    });

  for (const setting of settings) {
    switch (setting.settingType) {
      case SettingType.Country:
        {
          const country = setting.value as CountrySetting["value"];
          // limit query with value
          Object.assign(query, {
            [`streamLocations.${country}`]: { $exists: true },
          });
        }
        break;

      case SettingType.Genres:
        {
          // process into a whitelist/blacklist
          const list = setting.value as GenresSetting["value"];
          const includeGenres: string[] = [];
          const ignoreGenres: string[] = [];
          Object.keys(list).forEach((id) => {
            const shouldInclude = list[id];

            if (shouldInclude) {
              includeGenres.push(id);
            } else {
              ignoreGenres.push(id);
            }
          });

          // limit query with lists
          Object.assign(query, {
            genres: {
              $elemMatch: Object.assign(
                {},
                includeGenres.length ? { $in: includeGenres } : {},
                ignoreGenres.length ? { $nin: ignoreGenres } : {}
              ),
            },
          });
        }
        break;

      case SettingType.AudioLanguages:
        {
          // process into a whitelist/blacklist
          const list = setting.value as AudioLanguagesSetting["value"];
          const includeAudioLanguages: string[] = [];
          const ignoreAudioLanguages: string[] = [];
          Object.keys(list).forEach((audioLanguage) => {
            const shouldInclude = list[audioLanguage];

            if (shouldInclude) {
              includeAudioLanguages.push(audioLanguage);
            } else {
              ignoreAudioLanguages.push(audioLanguage);
            }
          });

          // limit query with lists
          Object.assign(query, {
            audioLanguage: Object.assign(
              {},
              includeAudioLanguages.length
                ? { $in: includeAudioLanguages }
                : {},
              ignoreAudioLanguages.length ? { $nin: ignoreAudioLanguages } : {}
            ),
          });
        }
        break;

      case SettingType.StreamLocations:
        {
          // process into a whitelist/blacklist
          const list = setting.value as StreamLocationsSetting["value"];
          const includeStreamLocations: string[] = [];
          const ignoreStreamLocations: string[] = [];
          Object.keys(list).forEach((streamLocation) => {
            const shouldInclude = list[streamLocation];

            if (shouldInclude) {
              includeStreamLocations.push(streamLocation);
            } else {
              ignoreStreamLocations.push(streamLocation);
            }
          });
          // limit query with lists
          Object.assign(query, {
            streamLocationIds: Object.assign(
              {},
              includeStreamLocations.length
                ? { $in: includeStreamLocations }
                : {},
              ignoreStreamLocations.length
                ? { $nin: ignoreStreamLocations }
                : {}
            ),
          });
        }
        break;

      case SettingType.Rating:
        {
          let { min, max } = setting.value as RatingSetting["value"];

          if (typeof min === "undefined") {
            min = null;
          }
          if (typeof max === "undefined") {
            max = null;
          }

          // limit query with range
          Object.assign(query, {
            "rating.average": Object.assign(
              {},
              min !== null ? { $gte: min } : {},
              max !== null ? { $lte: max } : {}
            ),
          });
        }
        break;

      case SettingType.ReleaseDate:
        {
          let { min, max } = setting.value as ReleaseDateSetting["value"];

          if (typeof min === "undefined") {
            min = null;
          }
          if (typeof max === "undefined") {
            max = null;
          }

          // limit query with range
          Object.assign(query, {
            releaseDate: Object.assign(
              {},
              min !== null ? { $gte: new Date(min) } : {},
              max !== null ? { $lte: new Date(max) } : {}
            ),
          });
        }
        break;

      case SettingType.Runtime:
        {
          let { min, max } = setting.value as RuntimeSetting["value"];

          if (typeof min === "undefined") {
            min = null;
          }
          if (typeof max === "undefined") {
            max = null;
          }

          // limit query with range
          Object.assign(query, {
            runtime: Object.assign(
              {},
              min !== null ? { $gte: min } : {},
              max !== null ? { $lte: max } : {}
            ),
          });
        }
        break;
    }
  }

  // Query candidates from media item collection
  const candidates = await queryMediaItems(query, MAX_SUGGESTIONS_TO_GENERATE);
  const suggestions: string[] = candidates.map(({ id }) => id).filter((n) => n);

  console.info(`created ${suggestions.length} suggestions for ${userId}`);

  return suggestions;
}
