import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b px-6 py-3 flex items-center justify-between">
      <Link to="/" className="font-bold text-lg text-blue-600">
        post-web
      </Link>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link to="/posts/new" className="text-sm text-gray-600 hover:text-blue-600">
              글쓰기
            </Link>
            <Link to="/chat" className="text-sm text-gray-600 hover:text-blue-600">
              채팅
            </Link>
            <Link to="/profile/me" className="text-sm text-gray-600 hover:text-blue-600">
              {user.username}
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-red-500"
            >
              로그아웃
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm text-gray-600 hover:text-blue-600">
              로그인
            </Link>
            <Link
              to="/register"
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              회원가입
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
