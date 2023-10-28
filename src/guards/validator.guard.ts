import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class ValidationGuard implements CanActivate {
  constructor(private readonly validator: any) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const entity = request.body;

    const validation = this.validator.validate(entity);

    if (validation.error) {
      const response = context.switchToHttp().getResponse();
      response.status(400).json({ error: validation.error.details[0].message });
      return false;
    }

    return true;
  }
}
