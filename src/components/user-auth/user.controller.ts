import { Controller, Get, Post, Body, Res, Req, UseGuards, Patch, Param, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiBadRequestResponse, ApiNotFoundResponse, ApiUnauthorizedResponse, ApiOkResponse } from '@nestjs/swagger'; 
import { Response } from 'express';
import { UserService } from './user.service';
import { User } from './user.model';
import { UserValidator } from '../../middlewares/user.validator';
import { MailerService } from '../../service/mailer/mailer.service';
import { JwtService } from 'src/service/jwt/jwt.service';
import { UserUpdates } from 'src/dtos/update-user.dto';
import { OtpService } from 'src/service/otp/otp.service';
import { AuthGuard } from '@nestjs/passport';
@Controller('users')
@ApiTags('Items')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly mailerService: MailerService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService
  ) { }

  @Post('/newuser')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiCreatedResponse({ description: 'User created successfully' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async create(@Body() user: User, @Res() res: Response): Promise<void> {
    const validation = UserValidator.validate(user);
    if (validation.error) {
      res.status(400).json({ error: validation.error.details[0].message });
    }

    else {
      const userExist = await this.userService.findUser(user.email);
      if (userExist != null) {
        res.status(401).json("This Email User Is Already Exist Try Another Email")
      }

      else {
        const newUser = await this.userService.create(user);
        const token = await this.jwtService.generateToken(newUser, '1h');
        const refreshToken = await this.jwtService.generateToken(newUser, '3d');
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
    if (!user) {
      res.status(404).json("User not found.");
    }

    if (otp === user.otp) {
      user.isVerified = true;
      const newUser = await this.userService.update(user);
      const newtoken = await this.jwtService.generateToken(newUser, '1h');
      const newRefreshToke = await this.jwtService.generateToken(newUser, '3d');

      await this.userService.updateToken(newUser._id, newRefreshToke);

      res.setHeader(process.env.REFRESH_TOKEN_NAME, newRefreshToke).setHeader(process.env.JWT_TOKEN_NAME, newtoken).status(200).json("User successfully verified.");
    } else {
      res.status(401).json("Invalid OTP.");
    }
  }


  @Get('/login')
  @ApiOperation({ summary: 'User login' })
  @ApiOkResponse({ description: 'User logged in successfully' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'User not found' })
  async findUser(@Body() req: { email: string, password: string }, @Res() res: Response): Promise<void> {
    const user = await this.userService.findUser(req.email)
    if (user == null) {
      res.status(404).json("This Email Not Found")
    }
    else if (user.password == undefined) {
      res.status(403).json("Try To Login With Google And Update Your Credentials")

    }


    else {
      const isMatch = await UserValidator.Match(req.password, user.password)
      if (isMatch) {
        const token = await this.jwtService.generateToken(user, '1h');
        const refreshToken = await this.jwtService.generateToken(user, '24h');
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
  @ApiOperation({ summary: 'Update a user' })
  @ApiOkResponse({ description: 'User updated successfully' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'User not found' })
  async updateUser(@Body() user: UserUpdates, @Param('id') id: string, @Res() res: Response): Promise<void> {

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
        if (user.password) {
          user.password = await UserValidator.hashPassword(user.password)
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
    }
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
      if (userExist != null) {
        const token = await this.jwtService.generateToken(userExist, '1h');
        const refreshToken = await this.jwtService.generateToken(userExist, '3d');
        userExist.refreshToken = refreshToken;
        await userExist.save();
        res.header(process.env.JWT_TOKEN_NAME, token).status(200).json({
          message: `Welcome Again ${user.name.firstName + ' ' + user.name.lastName} To My App ^_^`,
          user,
        });
      }

      else {
        const newUser = await this.userService.create(user);
        const token = await this.jwtService.generateToken(newUser, '1h');
        const refreshToken = await this.jwtService.generateToken(newUser, '3d');
        newUser.refreshToken = refreshToken;
        await newUser.save();

        res.header(process.env.JWT_TOKEN_NAME, token).status(201).json({
          message: `Thanks ${newUser.name} To Register In My App ^_^`,
          newUser,
          token,
          refreshToken,

        })
      }
    }

    else {
      res.redirect('/login?error=google_login_failed');
    }
  }

}




