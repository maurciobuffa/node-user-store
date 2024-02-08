import { regularExps } from "../../../config"


export class RegisterUserDto {
  private constructor (
    public name: string,
    public email: string,
    public password: string
  ) {}

  static create (object: Record<string, any>): [string?, RegisterUserDto?] {
    const { name, email, password } = object

    if (!name) return ['Missing name']
    if (!email) return ['Missing email']
    if (!regularExps.email.test(email)) return ['Invalid email']
    if (!password) return ['Missing password']
    if (password.length < 6) return ['Password must be at least 6 characters']

    return [undefined, new RegisterUserDto(name, email, password)]
  }
}