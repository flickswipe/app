import express, { Request, Response } from 'express';
import { body } from 'express-validator';

import {
    BadRequestError, currentUser, EmailTokenType, mongodbCatch, requireAuth, validateIso6391Param,
    validateRequest
} from '@flickswipe/common';

import { User } from '../models/user';
import { EmailTokenUrl } from '../services/classes/email-token-url';

const router = express.Router();

/**
 * @api {post} /api/en/auth/send-add-email-link
 * @apiName SendAddEmailLink
 * @apiGroup SendAddEmailLink
 *
 * @apiDescription
 * Creates new `AddEmail` email token and publishes `EmailTokenCreated` event.
 *
 * @apiParam {string} email (required)
 *
 * @apiErrorExample {json}  400 Bad Request
 * {
 *   "errors": [
 *      // Present when params are missing or invalid
 *      { message: "Email must be valid", field: "email" },
 *      // Present when user already has an email
 *      { message: "Cannot add email; user already has one" }
 *   ]
 * }
 *
 * @apiSuccessExample {json} 202 Accepted
 * {
 *   "message": "Add email link generated"
 * }
 */
router.post(
  "/api/:iso6391/auth/send-add-email-link",
  [
    validateIso6391Param("iso6391"),
    body("email").isEmail().withMessage(`Email must be valid`),
  ],
  validateRequest,
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { currentUser, useragent: userAgent } = req;

    if (currentUser!.email) {
      throw new BadRequestError(`Cannot add email; user already has one`);
    }

    const { email } = req.body;

    // check email is not in use
    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      throw new BadRequestError(`Email already in use`);
    }

    // generate email token
    await EmailTokenUrl.generateFromUserId(
      EmailTokenType.AddEmail,
      currentUser.id!,
      userAgent?.source || "",
      {
        email,
      }
    ).catch(mongodbCatch);

    res.status(202).send({
      message: `Add email link generated`,
    });

    console.info(`User ${currentUser.id} generated add email link`);
  }
);

export { router as usersSendAddEmailLinkRouter };
