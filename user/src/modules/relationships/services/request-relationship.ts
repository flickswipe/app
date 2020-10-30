import { BadRequestError, RelationshipType } from "@flickswipe/common";
import { natsWrapper } from "../../../nats-wrapper";
import { RelationshipRequestedPublisher } from "../events/publishers/relationship-requested";
import { Relationship } from "../models/relationship";

export async function requestRelationship(
  fromUserId: string,
  toUserId: string
): Promise<boolean> {
  // get existing relationships
  let fromRelationship;
  let toRelationship;
  try {
    fromRelationship = await Relationship.findOne({
      sourceUser: fromUserId,
      targetUser: toUserId,
    });

    toRelationship = await Relationship.findOne({
      sourceUser: toUserId,
      targetUser: fromUserId,
    });
  } catch (err) {
    console.error(`Couldn't check existing relationships`, err);
    return false;
  }

  if (fromRelationship || toRelationship) {
    throw new BadRequestError(`A relationship already exists.`);
  }

  try {
    // user who makes the request is marked as accepted automatically
    await Relationship.build({
      relationshipType: RelationshipType.Accepted,
      sourceUser: fromUserId,
      targetUser: toUserId,
    }).save();

    // user who receives the request is marked as pending
    await Relationship.build({
      relationshipType: RelationshipType.Pending,
      sourceUser: fromUserId,
      targetUser: toUserId,
    }).save();
  } catch (err) {
    console.error(`Couldn't create relationship request`, err);
    return false;
  }

  // publish event
  new RelationshipRequestedPublisher(natsWrapper.client).publish({
    sourceUserId: fromUserId,
    targetUserId: toUserId,
  });

  return true;
}
