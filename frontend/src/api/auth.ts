import { api } from './client'
import type { TokenPair, User } from '../types'

export const authApi = {
  register: (data: { email: string; password: string; username: string }) =>
    api.post<User>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<TokenPair>('/auth/login', data),

  refresh: (refresh_token: string) =>
    api.post<TokenPair>('/auth/refresh', { refresh_token }),
}
