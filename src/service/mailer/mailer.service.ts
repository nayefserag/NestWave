import { Injectable } from '@nestjs/common';
import {  MailerConfig } from '../../config/mailer.config';
@Injectable()
export class MailerService {
  async sendOtpEmail(recipientEmail: string, otp: string) {
    const { transporter , mailOptions}= await MailerConfig(otp, recipientEmail,'./templates/otptemplate.ejs','OTP for Verification');
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }

  async sendPasswordResetEmail(recipientEmail: string, resetcode: string) {
    const { transporter , mailOptions}= await MailerConfig(resetcode, recipientEmail,'./templates/passwordreset.ejs','Password Reset Code');
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }


}
