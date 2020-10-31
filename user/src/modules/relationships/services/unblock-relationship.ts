import { BadRequestError, RelationshipType } from "@flickswipe/common";
import { natsWrapper } from "../../../nats-wrapper";
import { RelationshipUnblockedPublisher } from "../events/publishers/relationship-unblocked";
import { Relationship } from "../models/relationship";

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
  await new RelationshipUnblockedPublisher(natsWrapper.client).publish({
    sourceUserId: fromUserId,
    targetUserId: toUserId,
    updatedAt: new Date(),
  });

  console.log(`${fromUserId} unblocked relationship with ${toUserId}`);
}
