import { currentUser, NotFoundError, requireAuth } from "@flickswipe/common";

import express, { Request, Response } from "express";
import { cancelRelationship } from "../modules/relationships/relationships";
import { User } from "../modules/track-auth/models/user";

const router = express.Router();

/**
 * @api {post} /api/en/user/relationships/:id/cancel
 * @apiName CancelInvite
 * @apiGroup CancelInvite
 *
 * @apiDescription
 * Unblocks a user.
 *
 * @apiParam {string} id the user whose invitation to cancel
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
 *   "message": "User canceled"
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
    const targetUserDoc = await User.findOne({ _id: targetUserId });

    if (!targetUserDoc) {
      throw new NotFoundError();
    }

    // cancel relationship
    await cancelRelationship(currentUser.id, targetUserId);

    res.status(200).send({
      message: `User canceled`,
    });
  }
);

export { router as inviteCancelRouter };
