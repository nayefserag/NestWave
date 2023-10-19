import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as ejs from 'ejs';
import { readFileSync } from 'fs';
import * as speakeasy from 'speakeasy';
@Injectable()
export class MailerService {
  async sendOtpEmail(recipientEmail: string, otp: string) {
    const transporter = nodemailer.createTransport({
      service: 'Gmail', 
      auth: {
        user: process.env.EMAIL_ADDRES_OTP,
        pass: process.env.PASSWORD_EMAIL_ADDRES_OTP,
      },
    });
    const template = ejs.compile(readFileSync('./src/service/mailer/mailtemplate.ejs', 'utf-8'));

    const emailHtml = template({ otp });

    // Define email options
    const mailOptions = {
      from: 'Nayf Serag',
      to: recipientEmail,
      subject: 'OTP for Verification',
      html: emailHtml,
    };

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
    const secret = speakeasy.generateSecret({ length: 20, name: process.env.OTP_NAME });
    const otp = speakeasy.totp({
      secret: secret.base32,
      encoding: process.env.ENCODING_OTP,
    });

    return {
      secret: secret.base32,
      otp,
    };
  }
}