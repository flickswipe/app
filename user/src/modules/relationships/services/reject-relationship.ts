import { BadRequestError } from "@flickswipe/common";
import { natsWrapper } from "../../../nats-wrapper";
import { RelationshipRejectedPublisher } from "../events/publishers/relationship-rejected";
import { RelationshipRequest } from "../models/relationship-request";

export async function rejectRelationship(
  originalReceiverId: string,
  originalRequesterId: string
): Promise<void> {
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
  await new RelationshipRejectedPublisher(natsWrapper.client).publish({
    sourceUserId: originalRequesterId,
    targetUserId: originalReceiverId,
    updatedAt: new Date(),
  });

  console.log(
    `${originalReceiverId} rejected relationship with ${originalRequesterId}`
  );
}
