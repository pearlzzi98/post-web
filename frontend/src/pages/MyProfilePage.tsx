import { useState, useRef } from 'react'
import { profileApi } from '../api/profile'
import { useAuthStore } from '../store/authStore'

export function MyProfilePage() {
  const { user, setUser } = useAuthStore()
  const [username, setUsername] = useState(user?.username ?? '')
  const [bio, setBio] = useState(user?.bio ?? '')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setLoading(true)
    try {
      const updated = await profileApi.update({ username, bio })
      setUser(updated)
      setMessage('프로필이 저장되었습니다.')
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : '저장 실패')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const updated = await profileApi.uploadAvatar(file)
      setUser(updated)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : '업로드 실패')
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">내 프로필 수정</h1>

      {/* 아바타 */}
      <div className="flex items-center gap-4 mb-6">
        {user?.avatar_url ? (
          <img src={user.avatar_url} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-400">
            {user?.username[0].toUpperCase()}
          </div>
        )}
        <div>
          <input type="file" ref={fileRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
          <button
            onClick={() => fileRef.current?.click()}
            className="text-sm text-blue-600 border rounded px-3 py-1 hover:bg-gray-50"
          >
            아바타 변경
          </button>
        </div>
      </div>

      {message && (
        <p className={`text-sm mb-4 ${message.includes('저장') ? 'text-green-600' : 'text-red-500'}`}>
          {message}
        </p>
      )}

      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">사용자명</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">소개</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? '저장 중...' : '저장'}
        </button>
      </form>
    </div>
  )
}
