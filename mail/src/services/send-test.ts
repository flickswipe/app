import { Email } from "./email";

const [L, R] = Email.delimiters;

/**
 * Initialize
 */
const testEmail = new Email(
  `Test email ${L}date${R}`,
  `
  If you're seeing this, the mail server is able to send outbound emails.
  `
);

/**
 * Create email from template and send it
 */
export async function sendTestEmail(): Promise<void> {
  testEmail.send("christopherdrifter@gmail.com", {
    date: new Date().toDateString(),
  });
}
