import { Controller, Get, Post, Body, Res, Req, UseGuards, Patch, Param  } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiBadRequestResponse, ApiNotFoundResponse, ApiUnauthorizedResponse, ApiOkResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { UserService } from './user.service';
import { User } from '../../model/user.model';
import { UserValidator } from '../../Validators/user.validator';
import { PasswordValidator } from '../../middlewares/password.validator';
import { MailerService } from '../../service/mailer/mailer.service';
import { JwtService } from 'src/service/jwt/jwt.service';
import { UserUpdates } from 'src/dtos/update-user.dto';
import { OtpService } from 'src/service/otp/otp.service';
import { AuthGuard } from '@nestjs/passport';
import { ExistGuard } from 'src/guards/exist.guard';
import { ValidationGuard } from 'src/guards/validator.guard';
@Controller('users')
@ApiTags('User Controller')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly mailerService: MailerService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService
  ) { }

  @Post('/newuser')
  @UseGuards(new ValidationGuard({ validator: UserValidator, validatorupdate: false }))
  @ApiOperation({ summary: 'Create a new user' })
  @ApiCreatedResponse({ description: 'User created successfully' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async create(@Body() user: User, @Res() res: Response): Promise<void> {

    const userExist = await this.userService.findUser(user.email);
    if (userExist instanceof Error) {
      const newUser = await this.userService.create(user);
      const token = await this.jwtService.generateToken(newUser, process.env.ACCESS_TOKEN_EXPIRATION_TIME);
      const refreshToken = await this.jwtService.generateToken(newUser, process.env.REFRESH_TOKEN_EXPIRATION_TIME);
      const otpData = this.otpService.generateOTP()
      newUser.otp = otpData.otp
      newUser.refreshToken = refreshToken
      newUser.save()
      this.mailerService.sendOtpEmail(user.email, otpData.otp);

      res.header(process.env.JWT_TOKEN_NAME, token).status(201).json({
        message: `Welcome ${newUser.name} To My App  We Sent OTP To ${user.email} Please Verify Your Email ^_^`,
        newUser,
        token,
        refreshToken,

      });
    }
    else {
      res.status(401).json("This Email Already Exist");

    }

  }


  @Post('/verifyotp')
  @ApiOperation({ summary: 'Verify OTP for a user' })
  @ApiOkResponse({ description: 'User successfully verified' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'User not found' })
  async verifyOtp(@Body() requestBody: { email: string, otp: string }, @Res() res: Response): Promise<void> {
    const { email, otp } = requestBody;
    const user = await this.userService.findUser(email);
    if (user instanceof Error) {
      res.status(404).json(user.message);
    }
    else {
      if (otp === user.otp) {
        user.isVerified = true;
        const newUser = await this.userService.update(user);
        const newtoken = await this.jwtService.generateToken(newUser, process.env.ACCESS_TOKEN_EXPIRATION_TIME);
        const newRefreshToke = await this.jwtService.generateToken(newUser, process.env.REFRESH_TOKEN_EXPIRATION_TIME);

        await this.userService.updateToken(newUser._id, newRefreshToke);

        res.setHeader(process.env.REFRESH_TOKEN_NAME, newRefreshToke).setHeader(process.env.JWT_TOKEN_NAME, newtoken).status(200).json("User successfully verified.");
      } else {
        res.status(401).json("Invalid OTP.");
      }
    }
  }


  @Get('/login')
  @ApiOperation({ summary: 'User login' })
  @ApiOkResponse({ description: 'User logged in successfully' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'User not found' })
  async login(@Body() req: { email: string, password: string }, @Res() res: Response): Promise<void> {
    const user = await this.userService.findUser(req.email)
    if (user instanceof Error) {
      res.status(404).json(user.message)
    }
    else if (user.password == undefined) {
      res.status(403).json("Try To Login With Google And Update Your Credentials")

    }

    else {
      const isMatch = await PasswordValidator.Match(req.password, user.password)
      if (isMatch) {
        const token = await this.jwtService.generateToken(user, process.env.ACCESS_TOKEN_EXPIRATION_TIME);
        const refreshToken = await this.jwtService.generateToken(user, process.env.REFRESH_TOKEN_EXPIRATION_TIME);
        user.refreshToken = refreshToken;
        await user.save()
        res.header(process.env.JWT_TOKEN_NAME, token).status(200).json({
          message: `Welcome To My App ${user.name} ^_^`,
          token,
        })
      }
      else {
        res.status(401).json("Wrong Password Please Try Again :(")
      }
    }

  }



  @Get('/allusers')
  @ApiOperation({ summary: 'Get all users' })
  @ApiOkResponse({ description: 'Users retrieved successfully' })
  @ApiNotFoundResponse({ description: 'No users found' })
  async findAll(@Res() res: Response): Promise<void> {
    const users = await this.userService.findAll();

    if (users.length === 0) {
      res.status(200).json({ message: 'No users found' });
    } else {
      res.status(200).json(users);
    }
  }



  @Patch('/update/:id')
  @UseGuards(ExistGuard(UserService))
  @UseGuards(new ValidationGuard({ validator: UserValidator, validatorupdate: true }))
  @ApiOperation({ summary: 'Update a user' })
  @ApiOkResponse({ description: 'User updated successfully' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'User not found' })
  async updateUser(@Body() user: UserUpdates, @Param('id') id: string, @Res() res: Response): Promise<void> {
    if (user.password) {
      user.password = await PasswordValidator.hashPassword(user.password)
    }
    if (user.email) {
      const otpData = this.otpService.generateOTP()
      this.mailerService.sendOtpEmail(user.email, otpData.otp);
      user.otp = otpData.otp
      user.isVerified = false
    }
    await this.userService.updateUser(user, id);
    res.status(200).json("User Updated Successfully");
  }


  @Get('/google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Login with Google' })
  async googleAuth() {
  }



  @Get('/google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google authentication callback' })
  async googleAuthRedirect(@Req() req, @Res() res) {
    const user = req.user;
    if (user) {
      const userExist = await this.userService.findUser(user.email);
      if (userExist instanceof Error) {
        const newUser = await this.userService.create(user);
        const token = await this.jwtService.generateToken(newUser,process.env.ACCESS_TOKEN_EXPIRATION_TIME);
        const refreshToken = await this.jwtService.generateToken(newUser, process.env.REFRESH_TOKEN_EXPIRATION_TIME);
        newUser.refreshToken = refreshToken;
        await newUser.save();

        res.header(process.env.JWT_TOKEN_NAME, token).status(201).json({
          message: `Thanks ${newUser.name} To Register In My App ^_^`,
          newUser,
          token,
          refreshToken,

        })
      }
      else {
        const token = await this.jwtService.generateToken(userExist, process.env.ACCESS_TOKEN_EXPIRATION_TIME);
        const refreshToken = await this.jwtService.generateToken(userExist, process.env.REFRESH_TOKEN_EXPIRATION_TIME);
        userExist.refreshToken = refreshToken;
        await userExist.save();
        res.header(process.env.JWT_TOKEN_NAME, token).status(200).json({
          message: `Welcome Again ${user.name.firstName + ' ' + user.name.lastName} To My App ^_^`,
          user,
        });
      }
    }

    else {
      res.redirect('/login?error=google_login_failed');
    }
  }

}




