import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import {  MailerConfig } from '../../config/mailer.config';
import {OtpConfig} from '../../config/otp.config';
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
@Injectable()
export class OtpService {
  generateOTP(): { secret: string; otp: string } {
    const secret = speakeasy.generateSecret({ length:OtpConfig.length, name: OtpConfig.otpName });
    const otp = speakeasy.totp({
      secret: secret.base32,
      encoding: OtpConfig.encodingOTP,
    });
    return {
      secret: secret.base32,
      otp,
    };
  }
}