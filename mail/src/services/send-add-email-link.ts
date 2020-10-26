import { EmailTokenCreatedEvent } from "@flickswipe/common";
import { Email } from "./email";

/**
 * Define email templates
 */
class AddEmailLinkEmail extends Email {
  subjectTemplate = `Add this email to your FlickSwipe account`;
  bodyTemplate = `
  Hi!

  <p>It looks like you're trying to add this email address to your account on 
  flickswipe.app.</p>
  <p>If that's the case, you can use the following code to confirm this email:<p>
  <p>%%token%%</p>
  <p>Or you can access this <a href="%%url%%">link</a> in the same browser that
  you made the request on.</p>
  <p>Happy swiping!</p>
  <p>The Flickswipe Team</p>
  `;
}

/**
 * Initialize
 */
const addEmailLinkEmail = new AddEmailLinkEmail();

/**
 * Create email from data and send it
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
