import { ExecutionContext, Injectable, NotFoundException, Type } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, model } from 'mongoose';;
import { Comment, CommentDocument } from 'src/model/comment.model';
import { PostDocument, Posts } from 'src/model/posts.model';
import { User, UserDocument } from 'src/model/user.model';

export function ExistGuard(entityServiceType: Type<any>) {
  @Injectable()
  class EntityExistGuard {
    public entityService: any;
    constructor(
      @InjectModel(User.name) public UserModel: Model<UserDocument>,
      @InjectModel(Posts.name) public readonly PostModel: Model<PostDocument>,
      @InjectModel(Comment.name) public readonly CommentModel: Model<CommentDocument>
    ) {
      this.entityService = new entityServiceType;
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const entityId = request.params.id;
      const entityemail = request.body.email;
      let model: any;
      if (this.entityService.constructor.name == 'UserService') {

         model = this.UserModel
      }
      else  {
        model = this.PostModel
      }
      var entityExist = await this.entityService.findByid(entityId, model);
      if (entityemail) {
         entityExist = await this.entityService.findUser(entityemail, model);
      }
      
      if (entityExist instanceof Error) {
        throw new NotFoundException(entityExist.message);
      }

      return true;
    }
  }

  return EntityExistGuard;
}