import * as bcrypt from 'bcrypt'
export class PasswordValidator {
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