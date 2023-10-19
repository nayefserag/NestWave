import { Controller, Get, Post, Body, Res ,Req,UseGuards, Patch, Param ,Headers} from '@nestjs/common';
import { Response } from 'express'; 
import { UserService } from './user.service';
import * as jwt from 'jsonwebtoken';
import { User, UserDocument } from './user.model';
import { UserValidator } from '../middlewares/user.validator';
import { MailerService ,OtpService} from '../service/mailer/mailer.service';
import { JwtService } from 'src/service/jwt/jwt.service';
import { UserUpdates } from 'src/dtos/update-user.dto';
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly mailerService: MailerService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService
    ) {}

  @Post('/newuser')
  async create(@Body() user: User, @Res() res: Response): Promise<void> {
    const validation =  UserValidator.validate(user);
    if (validation.error) {
      res.status(400).json({ error: validation.error.details[0].message });
    }

    else{
    const userExist = await this.userService.findUser(user.email);
    if(userExist!=null){
      res.status(401).json("This Email User Is Already Exist Try Another Email")
    }

    else {
      const newUser = await this.userService.create(user);
      const token = await this.jwtService.generateToken(newUser,'1h');
      const refreshToken =await this.jwtService.generateToken(newUser,'3d');
      const otpData = this.otpService.generateOTP()
      newUser.otp = otpData.otp
      newUser.refreshToken = refreshToken
      newUser.save()
      this.mailerService.sendOtpEmail(user.email, otpData.otp);

      res.header(process.env.JWT_TOKEN_NAME ,token).status(201).json({
        message: `Welcome ${newUser.name} To My App ^_^`,
        newUser,
        token,
        refreshToken,

    });
    }
  }
  }
  @Post('/verifyotp')
  async verifyOtp(@Body() requestBody: { email: string, otp: string }, @Res() res: Response): Promise<void> {
    const { email, otp } = requestBody; 
    const user = await this.userService.findUser(email);
    if (!user) {
      res.status(404).json("User not found.");
    }
  
    if (otp === user.otp) {
      user.isVerified = true;
      const newUser = await this.userService.update(user);
      const newtoken = await this.jwtService.generateToken(newUser,'1h');
      const newRefreshToke =await this.jwtService.generateToken(newUser,'3d');
  
      await this.userService.updateToken(newUser._id,newRefreshToke);
     
      res.setHeader(process.env.REFRESH_TOKEN_NAME ,newRefreshToke).setHeader(process.env.JWT_TOKEN_NAME ,newtoken).status(200).json("User successfully verified.");
    } else {
      res.status(401).json("Invalid OTP.");
    }
  }
  @Get('/login')
  async findUser(@Body() requestBody: { email: string , password: string}, @Res() res: Response): Promise<void>
  {
    const user = await this.userService.findUser(requestBody.email)
    if (user == null){
      res.status(404).json("This Email Not Found")
    }
    else{
      const isMatch = await UserValidator.Match(requestBody.password ,user.password )
      if (isMatch){
        const token = await this.jwtService.generateToken(user,'1h');
        const refreshToken =await this.jwtService.generateToken(user,'24h');
        user.refreshToken = refreshToken;
        await user.save()
        res.header(process.env.JWT_TOKEN_NAME ,token).status(200).json({
        message:`Welcome To My App ${user.name} ^_^`,
        token,
      })
      }
      else{
        res.status(401).json("Wrong Password Please Try Again :(")
      }
    }

  }
  
  @Get('/allusers')
  async findAll(@Res() res: Response): Promise<void> {
    const users = await this.userService.findAll();
    
    if (users.length === 0) {
      res.status(200).json({ message: 'No users found' });
    } else {
      res.status(200).json(users);
    }
  }

  @Patch('/update/:id') 
  async updateUser(@Body() user: UserUpdates,@Param('id') id: string ,@Res() res: Response): Promise<void> {

    const userExist = await this.userService.findUserById(id);
    if (userExist === null) {
      res.status(404).json("User Not Found");
    } else if (userExist instanceof Error) {
      res.status(400).json("Invalid ObjectId");
    } else {
      const validation = UserValidator.validateUpdate(user);

      if (validation.error) {
        res.status(400).json({ error: validation.error.details[0].message });
      } else {
        if (user.password){
          user.password = await UserValidator.hashPassword(user.password)
        }
        if(user.email){
          const otpData = this.otpService.generateOTP()
          this.mailerService.sendOtpEmail(user.email, otpData.otp);
          user.otp = otpData.otp
          user.isVerified = false
        }
        await this.userService.updateUser(user, id);
        res.status(200).json("User Updated Successfully");
      }
    }
  }
}




