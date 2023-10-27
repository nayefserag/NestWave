import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { CommentValidator } from "src/Validators/comment.validator";

@Injectable()
export class CommentValidationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const comment = request.body;

    const validation = CommentValidator.validate(comment);

    if (validation.error) {
      const response = context.switchToHttp().getResponse();
      response.status(400).json({ error: validation.error.details[0].message });
      return false;
    }

    return true;
  }
}

export class CommentUpdateValidationGuard implements CanActivate {
    constructor() {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const comment = request.body;
  
      const validation = CommentValidator.validateUpdate(comment);
  
      if (validation.error) {
        const response = context.switchToHttp().getResponse();
        response.status(400).json({ error: validation.error.details[0].message });
        return false;
      }
  
      return true;
    }
  }