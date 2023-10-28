import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class ValidationGuard implements CanActivate {
  constructor(private options: ValidationGuardOptions) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const entity = request.body;
    let validation :any
    if(this.options.validatorupdate){
        validation = this.options.validator.validateUpdate(entity);
    }
    else{
     validation = this.options.validator.validate(entity);
    }
    if (validation.error) {
      const response = context.switchToHttp().getResponse();
      response.status(400).json({ error: validation.error.details[0].message });
      return false;
    }

    return true;
  }
}
export interface ValidationGuardOptions {
  validator: any;
  validatorupdate?: boolean;
}