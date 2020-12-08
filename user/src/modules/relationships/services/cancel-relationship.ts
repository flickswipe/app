import { BadRequestError, RelationshipUpdateType } from '@flickswipe/common';

import { natsWrapper } from '../../../nats-wrapper';
import { RelationshipUpdatedPublisher } from '../events/publishers/relationship-updated';
import { RelationshipRequest } from '../models/relationship-request';

export async function cancelRelationship(
  originalRequesterId: string,
  originalReceiverId: string
): Promise<void> {
  // make sure ids are different
  if (originalRequesterId === originalReceiverId) {
    throw new BadRequestError(`Two different IDs must be supplied`);
  }

  // check relationship request exists
  const existingRequestDoc = await RelationshipRequest.findOne({
    sourceUser: originalRequesterId,
    targetUser: originalReceiverId,
    complete: false,
  }).sort({ createdAt: -1 });

  if (!existingRequestDoc) {
    throw new BadRequestError(`Relationship request doesn't exist`);
  }

  // update request as complete
  existingRequestDoc.complete = true;
  await existingRequestDoc.save();

  // publish event
  await new RelationshipUpdatedPublisher(natsWrapper.client).publish({
    relationshipUpdateType: RelationshipUpdateType.Cancelled,
    sourceUserId: originalRequesterId,
    targetUserId: originalReceiverId,
    updatedAt: new Date(),
  });

  console.info(
    `${originalRequesterId} cancelled relationship with ${originalReceiverId}`
  );
}
