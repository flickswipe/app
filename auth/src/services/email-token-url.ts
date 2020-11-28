import {
  BadRequestError,
  EmailTokenType,
  TooManyRequestsError,
} from "@flickswipe/common";

import { ObjectId } from "mongodb";

import { EmailToken, EmailTokenAttrs } from "../models/email-token";
import { User } from "../models/user";
import { natsWrapper } from "../nats-wrapper";
import { Token } from "../services/token";

import { EmailTokenCreatedPublisher } from "../events/publishers/email-token-created";

/**
 * Module Constants
 */
// date constants
const NOW = new Date().getTime();
const ONE_DAY = 24 * 60 * 60 * 1000;

// config throttling
const THROTTLE_SINCE_DATE = new Date(NOW - ONE_DAY);
const THROTTLE_MAX_REQUESTS = 3;

// config expiration
const TOKENS_EXPIRE_AFTER_DAYS = 1;

/**
 * Generate email token, save to database, and return URL as a reference
 *
 * @param emailTokenType type of token to generate
 * @param userId id of token owner
 * @param userAgent user agent of browser (must be same during confirmation)
 * @param payload token payload
 *
 * @throws {BadRequestError} no target email supplied
 * @throws {TooManyRequestsError} request is throttled
 *
 * @returns {string} url that, once visited, will consume the token
 */
const generateEmailTokenUrl = async (
  emailTokenType: EmailTokenAttrs["emailTokenType"],
  userId: string,
  userAgent = "",
  payload: EmailTokenAttrs["payload"] = null
): Promise<string> => {
  // get target email
  let email = payload?.email;

  if (!email) {
    const user = await User.findById(userId);
    email = user && user.email;
  }

  if (!email) {
    throw new BadRequestError(
      `Can't generate email token url: no target email`
    );
  }

  // throttle token creation
  const numEmailTokens = await EmailToken.countDocuments({
    user: userId,
    createdAt: {
      $gt: THROTTLE_SINCE_DATE,
    },
  });
  if (numEmailTokens >= THROTTLE_MAX_REQUESTS) {
    throw new TooManyRequestsError();
  }

  // generate token
  const token = await Token.generate(6);
  const encoded = Buffer.from(`${emailTokenType}:${userId}:${token}`).toString(
    "base64"
  );

  // generate confirmation url
  const { HOST } = process.env;
  const url = `${HOST}/email-token/${encoded}`;

  // handle expiration
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + TOKENS_EXPIRE_AFTER_DAYS);

  // save document
  const emailToken = EmailToken.build({
    emailTokenType: emailTokenType,
    user: userId,
    userAgent: userAgent || "unknown",
    token: token,
    url: url,
    payload: payload,
    expiresAt: expiresAt,
  });
  await emailToken.save();

  // publish event
  // other services should listen and use payload to send an email
  new EmailTokenCreatedPublisher(natsWrapper.client).publish({
    id: emailToken.id,
    emailTokenType: emailToken.emailTokenType,
    email: email,
    token: emailToken.token,
    url: emailToken.url,
    expiresAt: emailToken.expiresAt,
  });

  return url;
};

/**
 * Handle creation of email token URLs from various types of data
 */
export class EmailTokenUrl {
  /**
   * @param emailTokenType type of token to generate
   * @param email email of token owner
   * @param userAgent user agent of browser requesting token
   * @param payload token payload (optional)
   *
   * @throws {BadRequestError} no user with supplied email
   *
   * @returns {string} url that, once visited, will consume the token
   */
  static async generateFromEmail(
    emailTokenType: EmailTokenType.SignIn,
    email: string,
    userAgent = "",
    payload: EmailTokenAttrs["payload"] = null
  ): Promise<string> {
    // get user id
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return await generateEmailTokenUrl(
        emailTokenType,
        existingUser.id,
        userAgent,
        payload
      );
    }

    // magic links automatically create a new user
    if (emailTokenType === EmailTokenType.SignIn) {
      const newUser = await User.build({ email }).save();
      return await generateEmailTokenUrl(
        emailTokenType,
        newUser.id,
        userAgent,
        payload
      );
    }

    // other links fail
    throw new BadRequestError(
      `Can't generate email token url: invalid email ${email}`
    );
  }

  /**
   * @param emailTokenType type of token to generate
   * @param userId id of token owner
   * @param userAgent user agent of browser requesting token
   * @param payload token payload (optional)
   *
   * @throws {BadRequestError} no user with supplied email
   *
   * @returns {string} url that, once visited, will consume the token
   */
  static async generateFromUserId(
    emailTokenType: EmailTokenAttrs["emailTokenType"],
    userId: string,
    userAgent = "",
    payload: EmailTokenAttrs["payload"] = null
  ): Promise<string> {
    // check object id is valid
    if (!ObjectId.isValid(userId)) {
      throw new BadRequestError(
        `Can't generate email token url: invalid user id "${userId}"`
      );
    }

    // check user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new BadRequestError(
        `Can't generate email token url: invalid user id "${userId}"`
      );
    }

    return await generateEmailTokenUrl(
      emailTokenType,
      userId,
      userAgent,
      payload
    );
  }
}
