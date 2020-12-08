import { EmailTokenCreatedEvent } from '@flickswipe/common';

import { Email } from './classes/email';

const [L, R] = Email.delimiters;

/**
 * Initialize
 */
const addEmailLinkEmail = new Email(
  `Add this email to your FlickSwipe account`,
  `
  Hi!

  <p>It looks like you're trying to add this email address to your account on 
  flickswipe.app.</p>
  <p>If that's the case, you can use the following code to confirm this email:<p>
  <p>${L}token${R}</p>
  <p>Or you can access this <a href="${L}url${R}">link</a> in the same browser that
  you made the request on.</p>
  <p>Happy swiping!</p>

  <p>The Flickswipe Team</p>
  `
);

/**
 * Create email from template and send it
 */
export async function sendAddEmailLink(
  data: EmailTokenCreatedEvent["data"]
): Promise<void> {
  addEmailLinkEmail.send(data.email, {
    email: data.email,
    url: data.url,
    token: data.token,
  });
}
