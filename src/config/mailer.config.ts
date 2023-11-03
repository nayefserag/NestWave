import * as nodemailer from 'nodemailer';
import * as ejs from 'ejs';
import { readFileSync } from 'fs';
export async function MailerConfig(otp : string , recipientEmail: string, filelocation: string ,subject: string) {
    const transporter = nodemailer.createTransport({
       service: 'Gmail', 
       auth: {
         user: process.env.EMAIL_ADDRES_OTP,
         pass: process.env.PASSWORD_EMAIL_ADDRES_OTP,
       },
     });
    const template = ejs.compile(readFileSync(filelocation, 'utf-8'));
    const emailHtml = template({ otp });
    const mailOptions = {
        from: 'Nayf Serag',
        to: recipientEmail,
        subject: subject,
        html: emailHtml,
      };
    return {transporter , mailOptions}
}
