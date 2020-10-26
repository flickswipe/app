import { JSDOM } from "jsdom";
import { transporterWrapper } from "../transporter-wrapper";

/**
 * Abstract class for creating custom emails
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
        "gm"
      );

      content = content.replace(pattern, value);
    });

    return content;
  }

  static makePlainText(html: string): string {
    // remove existing whitespace
    html = html.replace(/\n/g, "");
    html = html.replace(/\r/g, "");
    html = html.replace(/\t/g, "");

    // add whitespace to common block elements
    html = html.replace(/<\/td>/g, "\t");
    html = html.replace(/<\/table>/g, "\n");
    html = html.replace(/<\/tr>/g, "\n");
    html = html.replace(/<\/p>/g, "\n");
    html = html.replace(/<\/div>/g, "\n");
    html = html.replace(/<\/h>/g, "\n");
    html = html.replace(/<br>/g, "\n");
    html = html.replace(/<br( )*\/>/g, "\n");

    // extract text content
    const { window } = new JSDOM(html);
    let { textContent } = window.document.body;

    // clean up extra whitespace
    textContent = textContent.replace(/ {2}/g, "");
    textContent = textContent.replace(/\n /g, "\n");
    textContent = textContent.trim();

    return textContent;
  }

  constructor(subjectTemplate: string, htmlTemplate: string) {
    this.subjectTemplate = subjectTemplate;
    this.textTemplate = Email.makePlainText(htmlTemplate);
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
