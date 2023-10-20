import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { UserService } from 'src/components/user-auth/user.service';

@Injectable()
export class JwtService {
  constructor(private readonly userService: UserService) { }

  async generateToken(user: any, expires: string): Promise<string> {
    const token = jwt.sign({
      id: user._id,
      isAdmin: user.isAdmin,
      isVerified: user.isVerified

    }, process.env.JWT_SECRET_KEY, {
      expiresIn: expires
    });
    return token;
  }

  async verifyToken(token: string): Promise<any> { //need more work
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async refreshTokens(decode: any): Promise<{ newToken: string; newRefreshToken: string; }> {
    const newToken = jwt.sign(
      { decode },
      process.env.JWT_SECRET_KEY,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION })

    const newRefreshToken = jwt.sign(
      { decode },
      process.env.JWT_SECRET_KEY,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION })

    await this.userService.updateToken(decode.payload.id, newRefreshToken);

    return {
      newToken,
      newRefreshToken,

    }
  }
}

