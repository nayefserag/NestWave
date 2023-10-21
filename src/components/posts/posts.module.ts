import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { Posts, PostSchema } from './posts.model';
import { UserService } from '../user-auth/user.service';
import { UserModule } from '../user-auth/user.module';
import { User ,UserSchema} from '../user-auth/user.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Posts.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UserModule
  ],
  providers: [PostsService,UserService],
  controllers: [PostsController],
})
export class PostsModule {}
