import { Module } from '@nestjs/common';
import { JwtController } from './jwt.controller';
import { UserService } from 'src/user-auth/user.service';
import { JwtService } from './jwt.service';
import { User, UserSchema } from 'src/user-auth/user.model';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from 'src/user-auth/user.module';

@Module({
  imports: 
  [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UserModule
  ],
  providers: [JwtService, UserService],
  controllers: [JwtController]
})
export class JwtModule {}
