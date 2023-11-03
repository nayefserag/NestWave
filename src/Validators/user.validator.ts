import * as Joi from 'joi';

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
    isVerified: Joi.boolean().default(false),
    otp: Joi.string(),
    id: Joi.string(),
    resetcode: Joi.string()
  });
  private static schemaUpdate = Joi.object({
    name: Joi.string().min(3).max(30),
    password: Joi.string().min(6),
    email: Joi.string().email(),
    profilePicture: Joi.string().allow(""),
    coverPicture: Joi.string().allow(""),
    followers: Joi.array().items(Joi.string()),
    followings: Joi.array().items(Joi.string()),
    isAdmin: Joi.boolean(),
    description: Joi.string(),
    city: Joi.string().max(50),
    from: Joi.string().max(50),
    relationship: Joi.number().valid(1, 2, 3),
    fcmToken: Joi.string(),
    googleId: Joi.string(),
    refreshToken: Joi.array().items(Joi.string()),
    isVerified: Joi.boolean(),
    otp: Joi.string(),
    id: Joi.string(),
    resetcode: Joi.string()
  })
  public static validate(user: any): Joi.ValidationResult<any> {
    return this.schema.validate(user);
  }
  public static validateUpdate(user: any): Joi.ValidationResult<any> {
    return this.schemaUpdate.validate(user);
  }



}
