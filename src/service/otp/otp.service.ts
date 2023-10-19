import { Injectable } from '@nestjs/common';
import {OtpConfig} from '../../config/otp.config';
import * as speakeasy from 'speakeasy';
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


