import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { User, UserSchema } from '../../model/user.model';
import { UserController } from './user.controller';
import { MailerService } from 'src/service/mailer/mailer.service';
import { JwtService } from 'src/service/jwt/jwt.service';
import { OtpService } from 'src/service/otp/otp.service';
import { PassportModule } from '@nestjs/passport';
import { GoogleAuthService } from 'src/config/google-auth.config';
import { Comment, CommentSchema } from 'src/model/comment.model';
import { PostSchema, Posts } from 'src/model/posts.model';

@Module({
  imports:
    [
      MongooseModule.forFeature([{ name: Posts.name, schema: PostSchema }]),
      MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
      MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      PassportModule.register({ defaultStrategy: 'google' }),
    ],
  providers: [UserService, MailerService, OtpService, JwtService, GoogleAuthService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule { }
