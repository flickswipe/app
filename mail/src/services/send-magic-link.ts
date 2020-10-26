import { EmailTokenCreatedEvent } from "@flickswipe/common";
import { Email } from "./email";

/**
 * Initialize
 */
const magicLinkEmail = new Email(
  `Sign into FlickSwipe with code %%token%%`,
  `
  Hi!

  <p>It looks like you're trying to sign into flickswipe.app.</p>
  <p>If that's the case, you can use the following code:<p>
  <p>%%token%%</p>
  <p>Or you can access this <a href="%%url%%">link</a> in the same browser that
  you made the request on.</p>
  <p>Happy swiping!</p>
  <p>The Flickswipe Team</p>
  `
);

/**
 * Create email from template and send it
 */
export async function sendMagicLink(
  data: EmailTokenCreatedEvent["data"]
): Promise<void> {
  magicLinkEmail.send(data.email, {
    email: data.email,
    url: data.url,
    token: data.token,
  });
}
