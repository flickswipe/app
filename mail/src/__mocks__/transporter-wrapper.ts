export const transporterWrapper = {
  transporter: {
    sendMail: jest.fn().mockResolvedValue({
      messageId: "<b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>",
    }),
  },
};
