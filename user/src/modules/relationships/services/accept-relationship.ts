import {
  BadRequestError,
  RelationshipType,
  RelationshipUpdateType,
} from "@flickswipe/common";
import { natsWrapper } from "../../../nats-wrapper";
import { RelationshipUpdatedPublisher } from "../events/publishers/relationship-updated";
import { Relationship } from "../models/relationship";
import { RelationshipRequest } from "../models/relationship-request";

export async function acceptRelationship(
  originalReceiverId: string, // the user who is accepting
  originalRequesterId: string // the user who made the original request
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

  // create relationship docs
  await Relationship.insertMany([
    {
      relationshipType: RelationshipType.Active,
      sourceUser: originalRequesterId,
      targetUser: originalReceiverId,
    },
    {
      relationshipType: RelationshipType.Active,
      sourceUser: originalReceiverId,
      targetUser: originalRequesterId,
    },
  ]);

  // publish event
  await new RelationshipUpdatedPublisher(natsWrapper.client).publish({
    relationshipUpdateType: RelationshipUpdateType.Accepted,
    sourceUserId: originalReceiverId,
    targetUserId: originalRequesterId,
    updatedAt: new Date(),
  });

  console.log(
    `${originalReceiverId} accepted relationship with ${originalRequesterId}`
  );
}
