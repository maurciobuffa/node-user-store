import { CustomError } from '../errors/custom.error'

export class UserEntity {
  constructor (
    public id: string,
    public name: string,
    public email: string,
    public emailValidated: boolean,
    public password: string,
    public img: string,
    public role: string[]
  ) {}

  static fromObject (object: Record<string, any>) {
    const { id, _id, name, email, emailValidated, password, img, role } = object

    const userId = id || _id

    if (!userId) throw CustomError.badRequest('Missing id')
    if (!name) throw CustomError.badRequest('Missing name')
    if (!email) throw CustomError.badRequest('Missing email')
    if (!password) throw CustomError.badRequest('Missing password')
    if (!role) throw CustomError.badRequest('Missing role')

    return new UserEntity(
      userId,
      name,
      email,
      emailValidated,
      password,
      img,
      role
    )
  }
}
