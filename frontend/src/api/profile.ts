import { api } from './client'
import type { User } from '../types'

export const profileApi = {
  getMe: () => api.get<User>('/users/me'),

  get: (userId: string) => api.get<User>(`/users/${userId}`),

  update: (data: { username?: string; bio?: string }) => api.patch<User>('/users/me', data),

  uploadAvatar: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.postForm<User>('/users/me/avatar', form)
  },
}
