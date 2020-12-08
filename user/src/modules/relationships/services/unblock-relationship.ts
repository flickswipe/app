import { BadRequestError, RelationshipType, RelationshipUpdateType } from '@flickswipe/common';

import { natsWrapper } from '../../../nats-wrapper';
import { RelationshipUpdatedPublisher } from '../events/publishers/relationship-updated';
import { Relationship } from '../models/relationship';

export async function unblockRelationship(
  fromUserId: string,
  toUserId: string
): Promise<void> {
  // make sure ids are different
  if (fromUserId === toUserId) {
    throw new BadRequestError(`Two different IDs must be supplied`);
  }

  // check if current relationship exists
  const existingRelationshipDoc = await Relationship.findOne({
    relationshipType: RelationshipType.Blocked,
    sourceUser: fromUserId,
    targetUser: toUserId,
  });

  if (!existingRelationshipDoc) {
    throw new BadRequestError(`User is not blocked`);
  }

  // delete relationship
  await Relationship.deleteOne({
    relationshipType: RelationshipType.Blocked,
    sourceUser: fromUserId,
    targetUser: toUserId,
  });

  // publish event
  await new RelationshipUpdatedPublisher(natsWrapper.client).publish({
    relationshipUpdateType: RelationshipUpdateType.Unblocked,
    sourceUserId: fromUserId,
    targetUserId: toUserId,
    updatedAt: new Date(),
  });

  console.info(
    `User ${fromUserId} unblocked relationship with user ${toUserId}`
  );
}
