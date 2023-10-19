import { Injectable } from '@nestjs/common';
import {  MailerConfig } from '../../config/mailer.config';
@Injectable()
export class MailerService {
  async sendOtpEmail(recipientEmail: string, otp: string) {
    const { transporter , mailOptions}= await MailerConfig(otp, recipientEmail);
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }
}
