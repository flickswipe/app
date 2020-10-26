import nodemailer, { Transporter, SentMessageInfo } from "nodemailer";

class TransporterWrapper {
  private _transporter?: Transporter;

  isEtherealAccount = false;

  /**
   * @returns {Transporter} nodemailer instance
   */
  get transporter(): Transporter {
    if (!this._transporter) {
      throw new Error(`Cannot access nodemailer transporter before connecting`);
    }

    return this._transporter;
  }

  connect(
    port: number,
    host: string,
    user: string,
    pass: string,
    defaults: any = {}
  ): Promise<void> {
    // create transporter
    this._transporter = nodemailer.createTransport(
      {
        pool: true,
        host: host,
        port: port,
        secure: port === 465,
        auth: {
          user: user,
          pass: pass,
        },
      },
      defaults
    );

    // flag if we are simulating email
    if (host === "smtp.ethereal.email" && port === 587) {
      this.isEtherealAccount = true;
    }

    // verify connection
    return new Promise((resolve, reject) => {
      this.transporter.verify(function (error) {
        if (error) {
          return reject(error);
        }

        console.log("Connected to mail server");
        resolve();
      });
    });
  }

  async sendMail(mailOptions: any): Promise<void | SentMessageInfo> {
    const info = await this.transporter.sendMail(mailOptions);

    console.info(`Sent ${mailOptions.subject} to ${mailOptions.to}`);

    if (this.isEtherealAccount) {
      console.log(
        `Ethereal email preview URL: `,
        nodemailer.getTestMessageUrl(info)
      );
    }

    return info;
  }
}

/**
 * Export
 */
export const transporterWrapper = new TransporterWrapper();
