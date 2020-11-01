import { currentUser, NotFoundError, requireAuth } from "@flickswipe/common";

import express, { Request, Response } from "express";
import { requestRelationship } from "../modules/relationships/relationships";
import { getUser } from "../modules/track-auth/track-auth";

const router = express.Router();

/**
 * @api {post} /api/en/user/relationships/:id/request
 * @apiName RelationshipCreate
 * @apiGroup RelationshipCreate
 *
 * @apiDescription
 * Unblocks a user.
 *
 * @apiParam {string} id the user with whom to request relationship
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
 *   "message": "Relationship request created"
 * }
 */
router.post(
  "/api/en/user/relationships/:id/request",
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

    // request relationship
    await requestRelationship(currentUser.id, targetUserId);

    res.status(200).send({
      message: `Relationship request created`,
    });
  }
);

export { router as relationshipRequestRouter };
