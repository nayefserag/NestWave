import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy ,VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleAuthService extends PassportStrategy(Strategy, 'google')  {
    constructor() {
        super({
          clientID: '284168300741-5v80cuvpvud7ocs749m9rp0266pfavcg.apps.googleusercontent.com',
          clientSecret: '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',
          callbackURL: 'http://localhost:3000/users/google/callback',
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
