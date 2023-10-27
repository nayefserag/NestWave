import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { PostValidator } from "src/Validators/post.validator";
import { PostsService } from "src/components/posts/posts.service";

@Injectable()
export class PostExistGuard implements CanActivate {
  constructor(private postService: PostsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.params.id;

    const postExist = await this.postService.findOne(userId);

    if (postExist instanceof Error) {
      const errorMessage = postExist.message;
      const response = context.switchToHttp().getResponse();
      response.status(404).json({ error: errorMessage });
      return false;
    }

    return true;
  }
}



@Injectable()
export class PostValidationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const post = request.body;

    const validation = PostValidator.validate(post);

    if (validation.error) {
      const response = context.switchToHttp().getResponse();
      response.status(400).json({ error: validation.error.details[0].message });
      return false;
    }

    return true;
  }
}

export class PostUpdateValidationGuard implements CanActivate {
    constructor() {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const post = request.body;
  
      const validation = PostValidator.validateUpdate(post);
  
      if (validation.error) {
        const response = context.switchToHttp().getResponse();
        response.status(400).json({ error: validation.error.details[0].message });
        return false;
      }
  
      return true;
    }
  }