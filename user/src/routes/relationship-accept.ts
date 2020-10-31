import { currentUser, NotFoundError, requireAuth } from "@flickswipe/common";

import express, { Request, Response } from "express";
import { acceptRelationship } from "../modules/relationships/relationships";
import { getUser } from "../modules/track-auth/track-auth";

const router = express.Router();

/**
 * @api {post} /api/en/user/relationships/:id/accept
 * @apiName RelationshipAccept
 * @apiGroup RelationshipAccept
 *
 * @apiDescription
 * Unblocks a user.
 *
 * @apiParam {string} id the user whose relationship request to accept
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
 *   "message": "Relationship request accepted"
 * }
 */
router.post(
  "/api/en/user/relationships/:id/accept",
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

    // accept relationship
    await acceptRelationship(currentUser.id, targetUserId);

    res.status(200).send({
      message: `Relationship request accepted`,
    });
  }
);

export { router as relationshipAcceptRouter };
