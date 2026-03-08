import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { postsApi } from '../api/posts'
import type { Post } from '../types'

const PAGE_SIZE = 20

export function PostListPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    postsApi
      .list(offset, PAGE_SIZE)
      .then(({ items, total }) => {
        setPosts(items)
        setTotal(total)
      })
      .finally(() => setLoading(false))
  }, [offset])

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">게시글</h1>
        <Link
          to="/posts/new"
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
        >
          글쓰기
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500">불러오는 중...</p>
      ) : posts.length === 0 ? (
        <p className="text-gray-500">게시글이 없습니다.</p>
      ) : (
        <ul className="space-y-3">
          {posts.map((post) => (
            <li key={post.id} className="bg-white border rounded-lg p-4 hover:shadow-sm transition">
              <Link to={`/posts/${post.id}`} className="font-semibold text-gray-800 hover:text-blue-600">
                {post.title}
              </Link>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(post.created_at).toLocaleDateString('ko-KR')}
              </p>
            </li>
          ))}
        </ul>
      )}

      <div className="flex justify-between mt-6">
        <button
          onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
          disabled={offset === 0}
          className="px-4 py-2 text-sm border rounded disabled:opacity-40 hover:bg-gray-50"
        >
          이전
        </button>
        <span className="text-sm text-gray-500 self-center">
          {offset + 1} - {Math.min(offset + PAGE_SIZE, total)} / {total}
        </span>
        <button
          onClick={() => setOffset(offset + PAGE_SIZE)}
          disabled={offset + PAGE_SIZE >= total}
          className="px-4 py-2 text-sm border rounded disabled:opacity-40 hover:bg-gray-50"
        >
          다음
        </button>
      </div>
    </div>
  )
}
