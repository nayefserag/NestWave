import { Controller, Post, Headers, Res } from '@nestjs/common';
import { Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { JwtService } from './jwt.service';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';

@Controller('jwt')
@ApiTags('JWT Controller')
export class JwtController {
  constructor(private readonly jwtService: JwtService) {}

  @Post('/refreshToken')
  @ApiOperation({ summary: 'Refresh JWT token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 400, description: 'No refresh token provided' })
  async refresh(@Res() res: Response, @Headers('Refresh-token') token: string): Promise<void> {
    if (!token) {
      res.status(400).json({ message: 'No refresh token provided' });
    } else {
      const decoded = jwt.decode(token, { complete: true });
      const { newToken, newRefreshToken } = await this.jwtService.refreshTokens(decoded);
      res.setHeader(process.env.JWT_TOKEN_NAME, newToken).status(200).json({
        message: 'Token refreshed successfully',
        newToken,
        newRefreshToken,
      });
    }
  }
}
