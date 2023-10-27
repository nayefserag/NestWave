import * as Joi from 'joi';

export class PostValidator {
  private static schema = Joi.object({
    userId : Joi.string(),
    post : Joi.string().required().max(450).min(1),
    Image : Joi.array().items(Joi.string()),
    video : Joi.array().items(Joi.string()),
    comments : Joi.array().items(Joi.string()),
    likes : Joi.array().items(Joi.string()),
    hashtags : Joi.array().items(Joi.string()),
  });
  private static schemaUpdate = Joi.object({
    userId : Joi.string(),
    post : Joi.string().max(450).min(1),
    Image : Joi.array().items(Joi.string()),
    video : Joi.array().items(Joi.string()),
    comments : Joi.array().items(Joi.string()),
    likes : Joi.array().items(Joi.string()),
    hashtags : Joi.array().items(Joi.string()),
  })
  public static validate(post: any): Joi.ValidationResult<any> {
    return this.schema.validate(post);
  }
  public static validateUpdate(post: any): Joi.ValidationResult<any> {
    return this.schemaUpdate.validate(post);
  }



}
