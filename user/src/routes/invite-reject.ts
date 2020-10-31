import { currentUser, NotFoundError, requireAuth } from "@flickswipe/common";

import express, { Request, Response } from "express";
import { rejectRelationship } from "../modules/relationships/relationships";
import { User } from "../modules/track-auth/models/user";

const router = express.Router();

/**
 * @api {post} /api/en/user/relationships/:id/reject
 * @apiName RejectInvite
 * @apiGroup RejectInvite
 *
 * @apiDescription
 * Unblocks a user.
 *
 * @apiParam {string} id the user whose invitation to reject
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
 *   "message": "User rejected"
 * }
 */
router.post(
  "/api/en/user/relationships/:id/reject",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { currentUser } = req;
    const { id: targetUserId } = req.params;

    // get target user
    const targetUserDoc = await User.findOne({ _id: targetUserId });

    if (!targetUserDoc) {
      throw new NotFoundError();
    }

    // reject relationship
    await rejectRelationship(currentUser.id, targetUserId);

    res.status(200).send({
      message: `User rejected`,
    });
  }
);

export { router as inviteRejectRouter };
