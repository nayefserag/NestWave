import { Module } from '@nestjs/common';
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
@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URL),
    PassportModule.register({ defaultStrategy: 'google' }),
    UserModule,
    MailerModule,
    JwtModule,
    PostsModule,
    UserOperationsModule,

  ],
  controllers: [AppController],
  providers: [AppService, MailerService, JwtService, OtpService, GoogleAuthService, UserOperationsService],
})
export class AppModule { }
