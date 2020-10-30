import { RelationshipType } from "@flickswipe/common";
import { natsWrapper } from "../../../nats-wrapper";
import { RelationshipRejectedPublisher } from "../events/publishers/relationship-rejected";
import { Relationship } from "../models/relationship";

export async function rejectRelationship(
  originalReceiverId: string,
  originalRequesterId: string
): Promise<boolean> {
  // Delete both relationships
  try {
    await Relationship.deleteMany({
      $or: [
        {
          relationshipType: { $ne: RelationshipType.Blocked },
          sourceUser: originalReceiverId,
          targetUser: originalRequesterId,
        },
        {
          relationshipType: { $ne: RelationshipType.Blocked },
          sourceUser: originalRequesterId,
          targetUser: originalReceiverId,
        },
      ],
    });
  } catch (err) {
    console.error(`Couldn't reject relationship`, err);
    return false;
  }

  // publish event
  new RelationshipRejectedPublisher(natsWrapper.client).publish({
    sourceUserId: originalReceiverId,
    targetUserId: originalRequesterId,
  });

  return true;
}
