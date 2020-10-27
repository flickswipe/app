import { transporterWrapper } from "../transporter-wrapper";
import { makePlainText } from "./make-plain-text";

/**
 * Create and send html emails from simple templates.
 */
export class Email {
  static readonly delimiters = ["%%", "%%"];

  subjectTemplate: string;
  textTemplate: string;
  htmlTemplate: string;

  static hydrate(content: string, data: Record<string, string>): string {
    const [leftDelimiter, rightDelimiter] = Email.delimiters;

    Object.keys(data).forEach((key) => {
      const value = data[key];
      const pattern = new RegExp(
        `${leftDelimiter}${key}${rightDelimiter}`,
        "gmi"
      );

      content = content.replace(pattern, value);
    });

    return content;
  }

  constructor(subjectTemplate: string, htmlTemplate: string) {
    this.subjectTemplate = makePlainText(subjectTemplate);
    this.textTemplate = makePlainText(htmlTemplate);
    this.htmlTemplate = htmlTemplate;
  }

  send(targetEmail: string, data: Record<string, string>): Promise<any> {
    const subject = Email.hydrate(this.subjectTemplate, data);
    const text = Email.hydrate(this.textTemplate, data);
    const html = Email.hydrate(this.htmlTemplate, data);

    return transporterWrapper.sendMail({
      to: targetEmail,
      subject: subject,
      text: text,
      html: html,
    });
  }
}
