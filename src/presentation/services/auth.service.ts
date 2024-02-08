import { JwtAdapter, bcryptAdapter, envs } from '../../config'
import { UserModel } from '../../data'
import {
  CustomError,
  LoginUserDto,
  RegisterUserDto,
  UserEntity
} from '../../domain'
import { EmailService } from './email.service'

export class AuthService {
  constructor (private readonly emailService: EmailService) {}

  public async registerUser (registerUserDto: RegisterUserDto) {
    const existUser = await UserModel.findOne({ email: registerUserDto.email })

    if (existUser) throw CustomError.badRequest('Email already in use')

    try {
      const user = new UserModel(registerUserDto)

      user.password = bcryptAdapter.hash(registerUserDto.password)

      await user.save()

      const { password, ...userEntity } = UserEntity.fromObject(user)

      this.sendEmailValidationLink(userEntity.email)

      const token = await JwtAdapter.generateToken({ id: userEntity.id })
      if (!token) throw CustomError.internalServer('Error generating token')

      return { user: { ...userEntity }, token }
    } catch (error) {
      throw CustomError.internalServer(`${error}`)
    }
  }

  public async loginUser (loginUserDto: LoginUserDto) {
    try {
      const userDb = await UserModel.findOne({ email: loginUserDto.email })

      if (!userDb) throw CustomError.badRequest('Invalid email or password')

      const isPasswordValid = bcryptAdapter.compare(
        loginUserDto.password,
        userDb.password
      )

      if (!isPasswordValid)
        throw CustomError.badRequest('Invalid email or password')

      const { password, ...userEntity } = UserEntity.fromObject(userDb)

      const token = await JwtAdapter.generateToken({ id: userEntity.id })

      if (!token) throw CustomError.internalServer('Error generating token')

      return { user: { ...userEntity }, token }
    } catch (error) {
      throw CustomError.internalServer(`${error}`)
    }
  }

  private sendEmailValidationLink = async (email: string) => {
    const token = await JwtAdapter.generateToken({ email })
    if (!token) throw CustomError.internalServer('Error generating token')

    const link = `${envs.WEBSERVICE_URL}/auth/validate-email/${token}`;

    const htmlBody = `
      <h1>Validate your email</h1>
      <p>Click <a href="${link}">here</a> to validate your email</p>
    `

    const options = {
      to: email,
      subject: 'Validate your email',
      htmlBody
    }

    const wasSent = await this.emailService.sendEmail(options)

    if (!wasSent) throw CustomError.internalServer('Error sending email')

    return true
  }

  public validateEmail = async (token: string) => {
    try {
      const payload = await JwtAdapter.validateToken(token)
      if (!payload) throw CustomError.unauthorized('Invalid token')

      const { email } = payload as { email: string };
      if (!email) throw CustomError.internalServer('Email not found in token')

      const user = await UserModel.findOne({ email})
      if (!user) throw CustomError.notFound('User not found')

      user.emailValidated = true

      await user.save()
    } catch (error) {
      throw CustomError.internalServer(`${error}`)
    }
  }
}
