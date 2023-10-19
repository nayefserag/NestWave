import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { User, UserSchema } from './user.model';
import { UserController } from './user.controller';
import { MailerService } from 'src/service/mailer/mailer.service';
import { JwtService } from 'src/service/jwt/jwt.service';
import { OtpService } from 'src/service/otp/otp.service';
@Module({
  imports: 
  [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [UserService ,MailerService,OtpService ,JwtService ],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
