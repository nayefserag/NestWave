import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy ,VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleAuthService extends PassportStrategy(Strategy, 'google')  {
    constructor() {
        super({
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_CALLBACK_URL,
          passReqToCallback: true,
          scope: ['email', 'profile'],
        });
      }
    
      async validate(request: any, accessToken: string, refreshToken: string, profile: any, done: VerifyCallback)  {
        const user = {
          id: profile.id,
          email: profile.emails[0].value,
          name :{
            firstName: profile.name.givenName,
            lastName: profile.name.familyName
          },
          picture: profile.photos[0].value,
          accessToken
        };
        done(null, user);
      }
}
