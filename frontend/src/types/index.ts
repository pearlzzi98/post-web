export interface User {
  id: string
  email: string
  username: string
  bio?: string
  avatar_url?: string
  created_at: string
}

export interface Post {
  id: string
  title: string
  content: string
  author_id: string
  author?: User
  created_at: string
  updated_at: string
  files?: PostFile[]
  comments?: Comment[]
}

export interface PostFile {
  id: string
  post_id: string
  filename: string
  url: string
  content_type: string
  size: number
  created_at: string
}

export interface Comment {
  id: string
  post_id: string
  author_id: string
  author?: User
  content: string
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  sender_id: string
  content: string
  created_at: string
}

export interface TokenPair {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface PaginatedPosts {
  items: Post[]
  total: number
  offset: number
  limit: number
}
