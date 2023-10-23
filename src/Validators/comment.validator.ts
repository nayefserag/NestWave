import * as Joi from 'joi';

export class CommentValidator {
  private static schema = Joi.object({
    text: Joi.string().required().max(450).min(1),
    likes: Joi.object({
      number: Joi.number().integer().min(0),
      persons: Joi.array().items(Joi.string()),
    }),
    userId: Joi.string().required(),
  });

  private static schemaUpdate = Joi.object({
    text: Joi.string().max(450).min(1),
    likes: Joi.object({
      number: Joi.number().integer().min(0),
      persons: Joi.array().items(Joi.string()),
    }),
  });

  public static validate(comment: any): Joi.ValidationResult<any> {
    return this.schema.validate(comment);
  }

  public static validateUpdate(comment: any): Joi.ValidationResult<any> {
    return this.schemaUpdate.validate(comment);
  }
}
