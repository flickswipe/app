import { RelationshipType } from "@flickswipe/common";
import { natsWrapper } from "../../../nats-wrapper";
import { RelationshipBlockedPublisher } from "../events/publishers/relationship-blocked";
import { Relationship } from "../models/relationship";

export async function blockRelationship(
  fromUserId: string,
  toUserId: string
): Promise<void> {
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

  // publish event
  await new RelationshipBlockedPublisher(natsWrapper.client).publish({
    sourceUserId: fromUserId,
    targetUserId: toUserId,
    updatedAt: new Date(),
  });

  console.log(`${fromUserId} blocked relationship with ${toUserId}`);
}
