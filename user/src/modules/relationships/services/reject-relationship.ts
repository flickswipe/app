import { BadRequestError, RelationshipUpdateType } from '@flickswipe/common';

import { natsWrapper } from '../../../nats-wrapper';
import { RelationshipUpdatedPublisher } from '../events/publishers/relationship-updated';
import { RelationshipRequest } from '../models/relationship-request';

export async function rejectRelationship(
  originalReceiverId: string,
  originalRequesterId: string
): Promise<void> {
  // make sure ids are different
  if (originalReceiverId === originalRequesterId) {
    throw new BadRequestError(`Two different IDs must be supplied`);
  }

  // check opposite request exists
  const oppositeRequestDoc = await RelationshipRequest.findOne({
    sourceUser: originalRequesterId,
    targetUser: originalReceiverId,
    complete: false,
  }).sort({ createdAt: -1 });

  if (!oppositeRequestDoc) {
    throw new BadRequestError(`Relationship request doesn't exist`);
  }

  // update request as complete
  oppositeRequestDoc.complete = true;
  await oppositeRequestDoc.save();

  // publish event
  await new RelationshipUpdatedPublisher(natsWrapper.client).publish({
    relationshipUpdateType: RelationshipUpdateType.Rejected,
    sourceUserId: originalRequesterId,
    targetUserId: originalReceiverId,
    updatedAt: new Date(),
  });

  console.info(
    `${originalReceiverId} rejected relationship with ${originalRequesterId}`
  );
}
