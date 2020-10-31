import { BadRequestError } from "@flickswipe/common";
import { natsWrapper } from "../../../nats-wrapper";
import { RelationshipCancelledPublisher } from "../events/publishers/relationship-cancelled";
import { RelationshipRequest } from "../models/relationship-request";

export async function cancelRelationship(
  originalRequesterId: string,
  originalReceiverId: string
): Promise<void> {
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
  await new RelationshipCancelledPublisher(natsWrapper.client).publish({
    sourceUserId: originalRequesterId,
    targetUserId: originalReceiverId,
    updatedAt: new Date(),
  });

  console.log(
    `${originalRequesterId} cancelled relationship with ${originalReceiverId}`
  );
}
