import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user-auth/user.module';
import { MailerService } from './service/mailer/mailer.service';
import { MailerModule } from './service/mailer/mailer.module';
import { JwtService } from './service/jwt/jwt.service';
import { JwtModule } from './service/jwt/jwt.module';
import { OtpService } from './service/otp/otp.service';
@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URL),
    UserModule,
    MailerModule,
    JwtModule,

  ],
  controllers: [AppController],
  providers: [AppService, MailerService, JwtService, OtpService],
})
export class AppModule { }
