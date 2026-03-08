import { api } from './client'
import type { Comment } from '../types'

export const commentsApi = {
  list: (postId: string) => api.get<Comment[]>(`/posts/${postId}/comments`),

  create: (postId: string, content: string) =>
    api.post<Comment>(`/posts/${postId}/comments`, { content }),

  update: (postId: string, commentId: string, content: string) =>
    api.patch<Comment>(`/posts/${postId}/comments/${commentId}`, { content }),

  delete: (postId: string, commentId: string) =>
    api.delete<void>(`/posts/${postId}/comments/${commentId}`),
}
