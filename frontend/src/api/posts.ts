import { api } from './client'
import type { Post, PostFile } from '../types'

export const postsApi = {
  list: (offset = 0, limit = 20) =>
    api.get<{ items: Post[]; total: number }>(`/posts?offset=${offset}&limit=${limit}`),

  get: (id: string) => api.get<Post>(`/posts/${id}`),

  create: (data: { title: string; content: string }) => api.post<Post>('/posts', data),

  update: (id: string, data: { title?: string; content?: string }) =>
    api.patch<Post>(`/posts/${id}`, data),

  delete: (id: string) => api.delete<void>(`/posts/${id}`),

  uploadFile: (postId: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.postForm<PostFile>(`/posts/${postId}/files`, form)
  },

  deleteFile: (postId: string, fileId: string) =>
    api.delete<void>(`/posts/${postId}/files/${fileId}`),
}
