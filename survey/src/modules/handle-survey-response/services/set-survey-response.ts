import { BadRequestError, InterestType } from '@flickswipe/common';

import { natsWrapper } from '../../../nats-wrapper';
import { getMediaItem } from '../../track-ingest/track-ingest';
import { MediaItemRatedPublisher } from '../events/publishers/media-item-rated';
import { SurveyResponse } from '../models/survey-response';

export async function setSurveyResponse(
  user: string,
  mediaItem: string,
  interestType: InterestType,
  rating: number = null
): Promise<void> {
  // check media item exists
  const mediaItemDoc = await getMediaItem(mediaItem);

  if (!mediaItemDoc) {
    throw new BadRequestError(`Media item doesn't exist`);
  }

  // get existing doc
  const existingDoc = await SurveyResponse.findOne({ user, mediaItem });

  if (existingDoc) {
    // overwrite existing doc
    existingDoc.interestType = interestType;
    existingDoc.rating = rating;

    await existingDoc.save();
  } else {
    // create doc
    await SurveyResponse.build({
      user,
      mediaItem,
      interestType,
      rating,
    }).save();
  }

  // publish event
  await new MediaItemRatedPublisher(natsWrapper.client).publish({
    id: mediaItem,
    user: user,
    interestType: interestType,
    rating: rating,
    updatedAt: new Date(),
  });

  console.info(`User ${user} rated media item ${mediaItem}`);
}
