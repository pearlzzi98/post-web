import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { profileApi } from '../api/profile'
import type { User } from '../types'

export function ProfilePage() {
  const { id } = useParams<{ id: string }>()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    if (!id) return
    profileApi.get(id).then(setUser)
  }, [id])

  if (!user) return <div className="p-6 text-gray-500">불러오는 중...</div>

  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="bg-white rounded-lg border p-6 flex items-start gap-6">
        {user.avatar_url ? (
          <img src={user.avatar_url} alt="avatar" className="w-20 h-20 rounded-full object-cover" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-400">
            {user.username[0].toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold">{user.username}</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
          {user.bio && <p className="mt-2 text-gray-700">{user.bio}</p>}
        </div>
      </div>
    </div>
  )
}
