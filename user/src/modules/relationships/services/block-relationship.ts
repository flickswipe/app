import {
  BadRequestError,
  RelationshipType,
  RelationshipUpdateType,
} from "@flickswipe/common";
import { natsWrapper } from "../../../nats-wrapper";
import { RelationshipUpdatedPublisher } from "../events/publishers/relationship-updated";
import { Relationship } from "../models/relationship";
import { RelationshipRequest } from "../models/relationship-request";

export async function blockRelationship(
  fromUserId: string,
  toUserId: string
): Promise<void> {
  // make sure ids are different
  if (fromUserId === toUserId) {
    throw new BadRequestError(`Two different IDs must be supplied`);
  }

  // check if current relationship exists
  const existingRelationshipDoc = await Relationship.findOne({
    sourceUser: fromUserId,
    targetUser: toUserId,
  });

  if (existingRelationshipDoc) {
    // update
    existingRelationshipDoc.relationshipType = RelationshipType.Blocked;
    await existingRelationshipDoc.save();
  } else {
    // create
    await Relationship.build({
      relationshipType: RelationshipType.Blocked,
      sourceUser: fromUserId,
      targetUser: toUserId,
    }).save();
  }

  // delete opposite active relationship if it exists
  await Relationship.deleteOne({
    relationshipType: RelationshipType.Active,
    sourceUser: toUserId,
    targetUser: fromUserId,
  });

  // delete any open requests
  await RelationshipRequest.deleteMany({
    sourceUser: toUserId,
    targetUser: fromUserId,
    complete: false,
  });

  await RelationshipRequest.deleteMany({
    sourceUser: fromUserId,
    targetUser: toUserId,
    complete: false,
  });

  // publish event
  await new RelationshipUpdatedPublisher(natsWrapper.client).publish({
    relationshipUpdateType: RelationshipUpdateType.Blocked,
    sourceUserId: fromUserId,
    targetUserId: toUserId,
    updatedAt: new Date(),
  });

  console.log(`${fromUserId} blocked relationship with ${toUserId}`);
}
