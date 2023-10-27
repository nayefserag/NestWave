// user-validation.guard.ts
import { Injectable, CanActivate, ExecutionContext, Param } from '@nestjs/common';
import { UserValidator } from 'src/Validators/user.validator';
import { PasswordValidator } from './password.validator';
import { OtpService } from 'src/service/otp/otp.service';
import { MailerService } from 'src/service/mailer/mailer.service';
import { UserService } from 'src/components/user-auth/user.service';

@Injectable()
export class UserValidationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.body;

    const validation = UserValidator.validate(user);

    if (validation.error) {
      const response = context.switchToHttp().getResponse();
      response.status(400).json({ error: validation.error.details[0].message });
      return false;
    }

    return true;
  }
}
@Injectable()
// export class UserUpdateValidationGuard implements CanActivate {
//   canActivate(context: ExecutionContext): boolean {
//     const request = context.switchToHttp().getRequest();
//     const validation = UserValidator.validateUpdate(request.body);

//     if (validation.error) {
//       const response = context.switchToHttp().getResponse();
//       response.status(400).json({ error: validation.error.details[0].message });
//       return false;
//     }

//     return true;
//   }
// }
export class UserUpdateValidationGuard implements CanActivate {
    constructor(private readonly otpService: OtpService, private readonly mailerService: MailerService) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const user = request.body;
  
      const validation = UserValidator.validateUpdate(user);
  
      if (validation.error) {
        const response = context.switchToHttp().getResponse();
        response.status(400).json({ error: validation.error.details[0].message });
        return false;
      }
  
      return true;
    }
  }

@Injectable()
export class UserExistGuard implements CanActivate {
  constructor(private userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.params.id;

    const userExist = await this.userService.findUserById(userId);

    if (userExist instanceof Error) {
      const errorMessage = userExist.message;
      const response = context.switchToHttp().getResponse();
      response.status(404).json({ error: errorMessage });
      return false;
    }

    return true;
  }
}

