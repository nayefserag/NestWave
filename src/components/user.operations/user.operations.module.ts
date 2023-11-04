import { Module } from '@nestjs/common';
import { UserOperationsController } from './user.operations.controller';
import { User, UserSchema } from '../../model/user.model';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from '../user-auth/user.service';
import { UserModule } from '../user-auth/user.module';
import { UserOperationsService } from './user.operations.service';
import { Comment ,CommentSchema } from 'src/model/comment.model';
import { PostSchema, Posts } from 'src/model/posts.model';
import { FirebaseService } from 'src/service/firebase/firebase.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Posts.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    UserModule
  ],
  providers: [UserService, UserOperationsService,FirebaseService],
  controllers: [UserOperationsController]
})
export class UserOperationsModule { }
