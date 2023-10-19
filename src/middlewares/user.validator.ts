import * as Joi from 'joi';
import * as bcrypt from 'bcrypt'
// import { User } from '../user-auth/user.model';
export class UserValidator {
  private static schema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    password: Joi.string().min(6).required(),
    email: Joi.string().email().required(),
    profilePicture: Joi.string().allow(""),
    coverPicture: Joi.string().allow(""),
    followers: Joi.array().items(Joi.string()).default([]),
    followings: Joi.array().items(Joi.string()).default([]),
    isAdmin: Joi.boolean().default(false),
    description: Joi.string().default(""),
    city: Joi.string().max(50),
    from: Joi.string().max(50),
    relationship: Joi.number().valid(1, 2, 3),
    fcmToken: Joi.string(),
    googleId: Joi.string().default(""),
    refreshToken: Joi.array().items(Joi.string()).default([]),
  });

  public static validate(user: any): Joi.ValidationResult<any> {
    return this.schema.validate(user);
  }
  public static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    const hasedpassword = bcrypt.hash(password, salt);
    return hasedpassword;
  }
  public static async Match(password1, password2): Promise<boolean> {
    const isMatch = await bcrypt.compare(password1, password2);
    return isMatch
  }


}
