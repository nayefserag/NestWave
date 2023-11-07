import { Module, Query } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './components/user-auth/user.module';
import { MailerService } from './service/mailer/mailer.service';
import { MailerModule } from './service/mailer/mailer.module';
import { JwtService } from './service/jwt/jwt.service';
import { JwtModule } from './service/jwt/jwt.module';
import { OtpService } from './service/otp/otp.service';
import { GoogleAuthService } from './config/google-auth.config';
import { PassportModule } from '@nestjs/passport';
import { PostsModule } from './components/posts/posts.module';
import { UserOperationsService } from './components/user.operations/user.operations.service';
import { UserOperationsModule } from './components/user.operations/user.operations.module';
import { FirebaseService } from './service/firebase/firebase.service';
import * as path from 'path';
import { AcceptLanguageResolver, CookieResolver, HeaderResolver, I18nModule, QueryResolver } from 'nestjs-i18n';

@Module({
  imports: [
    ConfigModule.forRoot(),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: './src/i18n',
        watch: true,
        locale: ['en' , 'ar' , 'fr', 'es'],
      },

      resolvers: [

        // HeaderResolver,
        // QueryResolver,
        // AcceptLanguageResolver
        new QueryResolver(["lang", "l"]),
        new HeaderResolver(["lang"]),
      ]
    }),
    MongooseModule.forRoot(process.env.MONGO_URL),
    PassportModule.register({ defaultStrategy: 'google' }),
    UserModule,
    MailerModule,
    JwtModule,
    PostsModule,
    UserOperationsModule,

  ],
  controllers: [AppController],
  providers: [AppService, MailerService, JwtService, OtpService, GoogleAuthService, UserOperationsService, FirebaseService],
})
export class AppModule { }
