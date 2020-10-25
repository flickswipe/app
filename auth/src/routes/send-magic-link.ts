import {
  BadRequestError,
  currentUser,
  EmailTokenType,
  mongodbCatch,
  validateRequest,
} from "@flickswipe/common";

import express, { Request, Response } from "express";
import { body } from "express-validator";

import { EmailTokenUrl } from "../services/email-token-url";

const router = express.Router();

/**
 * @api {post} /api/en/auth/send-magic-link
 * @apiName SendMagicLink
 * @apiGroup SendMagicLink
 *
 * @apiDescription
 * Creates new `SignIn` email token and publishes `EmailTokenCreated` event.
 *
 * @apiParam {string} email (required)
 *
 * @apiErrorExample {json}  400 Bad Request
 * {
 *   "errors": [
 *      // Present when params are missing or invalid
 *      { message: "Email must be valid", field: "email" },
 *      // Present when user already authenticated
 *      { message: "User already signed in" }
 *   ]
 * }
 *
 * @apiSuccessExample {json} 202 Accepted
 * {
 *   "message": "Magic link generated"
 * }
 */
router.post(
  "/api/en/auth/send-magic-link",
  [body("email").isEmail().withMessage(`Email must be valid`)],
  validateRequest,
  currentUser,
  async (req: Request, res: Response) => {
    const { currentUser, useragent: userAgent } = req;
    const { email } = req.body;

    // only for unauthorized users
    if (currentUser) {
      throw new BadRequestError(`User already signed in`);
    }

    // generate email token
    await EmailTokenUrl.generateFromEmail(
      EmailTokenType.SignIn,
      email,
      userAgent?.source || ""
    ).catch(mongodbCatch);

    res.status(202).send({
      message: `Magic link generated`,
    });
  }
);

/**
 * Exports
 */
export { router as sendMagicLinkRouter };
