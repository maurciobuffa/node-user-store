import jwt from 'jsonwebtoken'
import { envs } from './envs'

const JWT_SEED = envs.JWT_SEED

export class JwtAdapter {
  static async generateToken (payload: any, duration: string = '2h') {
    return new Promise((resolve, reject) => {
      jwt.sign(
        payload,
        JWT_SEED,
        { expiresIn: duration },
        (err, token) => {
          if (err) resolve(null)
          resolve(token)
        }
      )
    })
  }

  static validateToken (token: string) {
    return new Promise((resolve) => {
      jwt.verify(token, JWT_SEED, (err, decoded) => {
        if (err) resolve(null)

        resolve(decoded)
      })
    })
  }
}
