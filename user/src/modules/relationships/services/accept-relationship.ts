import { BadRequestError, RelationshipType } from "@flickswipe/common";
import { natsWrapper } from "../../../nats-wrapper";
import { RelationshipAcceptedPublisher } from "../events/publishers/relationship-accepted";
import { Relationship } from "../models/relationship";

export async function acceptRelationship(
  originalReceiverId: string, // the user who is accepting
  originalRequesterId: string // the user who made the original request
): Promise<boolean> {
  // get existing relationships
  let originalRequesterRel;
  let originalReceiverRel;
  try {
    originalRequesterRel = await Relationship.findOne({
      sourceUser: originalRequesterId,
      targetUser: originalReceiverId,
    });

    originalReceiverRel = await Relationship.findOne({
      sourceUser: originalReceiverId,
      targetUser: originalRequesterId,
    });
  } catch (err) {
    console.error(`Couldn't get relationship`, err);
    return false;
  }

  // a request is characterised as one relationship that has been accepted, and
  // another that is pending
  if (
    !(
      originalRequesterRel?.relationshipType === RelationshipType.Accepted &&
      originalReceiverRel?.relationshipType === RelationshipType.Pending
    )
  ) {
    throw new BadRequestError(`Relationship request doesn't exist.`);
  }

  // update request
  originalReceiverRel.relationshipType = RelationshipType.Accepted;
  try {
    await originalReceiverRel.save();
  } catch (err) {
    console.error(`Couldn't accept relationship request`);
    return false;
  }

  // publish event
  new RelationshipAcceptedPublisher(natsWrapper.client).publish({
    sourceUserId: originalReceiverId,
    targetUserId: originalRequesterId,
  });

  return true;
}
