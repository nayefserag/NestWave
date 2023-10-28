import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { PostValidator } from "src/Validators/post.validator";
import { PostsService } from "src/components/posts/posts.service";

// class Logical_Error extends Error {
//   constructor(message: string) {
//     super(message)
//     this.serverErrorCode = "E_406"
//     this.statusCode = 406
//     this.errorType = "LogicalError"
//   }
// }

// class NotExist_Error extends Logical_Error {
//   constructor(message: string) {
//     super(message)
//     this.serverErrorCode = "E_406_NotExist"
//   }
// }



@Injectable()
export class PostExistGuard implements CanActivate {
  constructor(private postService: PostsService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.params.id;

    const postExist = await this.postService.findByid(userId);

    if (postExist instanceof Error) {
      const errorMessage = postExist.message;
      const response = context.switchToHttp().getResponse();
      response.status(404).json({ error: errorMessage });
      // throw new Logical_Error("Invalid length")
      return false;
    }

    return true;
  }
}

// async function errorMiddlewate(error) {
//   const message = error.message;
//   const errorType = error.errorType; || "E"
//   const status = error.status || 500;
//   const serverErrorCode = "E_500"
//   return response.status(status).json({ message, serverErrorCode, errorType });
// }



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
  constructor() { }

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