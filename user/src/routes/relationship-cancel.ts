import { currentUser, NotFoundError, requireAuth } from "@flickswipe/common";

import express, { Request, Response } from "express";
import { cancelRelationship } from "../modules/relationships/relationships";
import { getUser } from "../modules/track-auth/track-auth";

const router = express.Router();

/**
 * @api {post} /api/en/user/relationships/:id/cancel
 * @apiName RelationshipCancel
 * @apiGroup RelationshipCancel
 *
 * @apiDescription
 * Unblocks a user.
 *
 * @apiParam {string} id the user whose relationship request to cancel
 *
 * @apiErrorExample {json}  401 Not authorized
 * {
 *   "errors": [
 *      { message: "Not authorized" },
 *   ]
 * }
 *
 * @apiErrorExample {json}  404 Not found
 * {
 *   "errors": [
 *      { message: "Not found" },
 *   ]
 * }
 *
 * @apiSuccessExample {json} 200 OK
 * {
 *   "message": "Relationship request cancelled"
 * }
 */
router.post(
  "/api/en/user/relationships/:id/cancel",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { currentUser } = req;
    const { id: targetUserId } = req.params;

    // get target user
    const targetUserDoc = await getUser(targetUserId);

    if (!targetUserDoc) {
      throw new NotFoundError();
    }

    // cancel relationship
    await cancelRelationship(currentUser.id, targetUserId);

    res.status(200).send({
      message: `Relationship request cancelled`,
    });
  }
);

export { router as relationshipCancelRouter };
