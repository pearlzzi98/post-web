import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { postsApi } from '../api/posts'
import { commentsApi } from '../api/comments'
import { useAuthStore } from '../store/authStore'
import type { Post, Comment } from '../types'

export function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState('')
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!id) return
    postsApi.get(id).then(setPost)
    commentsApi.list(id).then(setComments)
  }, [id])

  const handleDelete = async () => {
    if (!id || !confirm('게시글을 삭제할까요?')) return
    await postsApi.delete(id)
    navigate('/')
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !id) return
    const updated = await postsApi.uploadFile(id, file)
    setPost((p) => p ? { ...p, files: [...(p.files ?? []), updated] } : p)
  }

  const handleFileDelete = async (fileId: string) => {
    if (!id) return
    await postsApi.deleteFile(id, fileId)
    setPost((p) => p ? { ...p, files: (p.files ?? []).filter((f) => f.id !== fileId) } : p)
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !commentText.trim()) return
    const created = await commentsApi.create(id, commentText.trim())
    setComments((prev) => [...prev, created])
    setCommentText('')
  }

  const handleCommentEdit = async (commentId: string) => {
    if (!id || !editText.trim()) return
    const updated = await commentsApi.update(id, commentId, editText.trim())
    setComments((prev) => prev.map((c) => (c.id === commentId ? updated : c)))
    setEditingComment(null)
  }

  const handleCommentDelete = async (commentId: string) => {
    if (!id || !confirm('댓글을 삭제할까요?')) return
    await commentsApi.delete(id, commentId)
    setComments((prev) => prev.filter((c) => c.id !== commentId))
  }

  if (!post) return <div className="p-6 text-gray-500">불러오는 중...</div>

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-lg border p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-2xl font-bold">{post.title}</h1>
          {user?.id === post.author_id && (
            <div className="flex gap-2">
              <Link
                to={`/posts/${id}/edit`}
                className="text-sm text-blue-600 hover:underline"
              >
                수정
              </Link>
              <button onClick={handleDelete} className="text-sm text-red-500 hover:underline">
                삭제
              </button>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-400 mb-4">
          {new Date(post.created_at).toLocaleString('ko-KR')}
        </p>
        <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>

        {/* 파일 */}
        {post.files && post.files.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">첨부파일</h3>
            <ul className="space-y-1">
              {post.files.map((f) => (
                <li key={f.id} className="flex items-center gap-2 text-sm">
                  <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {f.filename}
                  </a>
                  {user?.id === post.author_id && (
                    <button
                      onClick={() => handleFileDelete(f.id)}
                      className="text-xs text-red-400 hover:underline"
                    >
                      삭제
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {user?.id === post.author_id && (
          <div className="mt-4">
            <input type="file" ref={fileRef} onChange={handleFileUpload} className="hidden" />
            <button
              onClick={() => fileRef.current?.click()}
              className="text-sm text-gray-500 border rounded px-3 py-1 hover:bg-gray-50"
            >
              파일 첨부
            </button>
          </div>
        )}
      </div>

      {/* 댓글 */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="font-semibold mb-4">댓글 {comments.length}개</h2>

        {comments.map((c) => (
          <div key={c.id} className="border-b py-3 last:border-0">
            {editingComment === c.id ? (
              <div className="flex gap-2">
                <input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="flex-1 border rounded px-2 py-1 text-sm"
                />
                <button
                  onClick={() => handleCommentEdit(c.id)}
                  className="text-sm text-blue-600"
                >
                  저장
                </button>
                <button
                  onClick={() => setEditingComment(null)}
                  className="text-sm text-gray-400"
                >
                  취소
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-700">{c.content}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-400">
                    {new Date(c.created_at).toLocaleString('ko-KR')}
                  </span>
                  {user?.id === c.author_id && (
                    <>
                      <button
                        onClick={() => { setEditingComment(c.id); setEditText(c.content) }}
                        className="text-xs text-blue-500 hover:underline"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleCommentDelete(c.id)}
                        className="text-xs text-red-400 hover:underline"
                      >
                        삭제
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        ))}

        {user && (
          <form onSubmit={handleCommentSubmit} className="mt-4 flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="댓글을 입력하세요..."
              className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
            >
              등록
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
