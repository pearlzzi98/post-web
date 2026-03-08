import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { PostListPage } from './pages/PostListPage'
import { PostDetailPage } from './pages/PostDetailPage'
import { PostCreatePage } from './pages/PostCreatePage'
import { PostEditPage } from './pages/PostEditPage'
import { ProfilePage } from './pages/ProfilePage'
import { MyProfilePage } from './pages/MyProfilePage'
import { ChatPage } from './pages/ChatPage'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<PostListPage />} />
        <Route path="/posts/:id" element={<PostDetailPage />} />
        <Route
          path="/posts/new"
          element={
            <ProtectedRoute>
              <PostCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/posts/:id/edit"
          element={
            <ProtectedRoute>
              <PostEditPage />
            </ProtectedRoute>
          }
        />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route
          path="/profile/me"
          element={
            <ProtectedRoute>
              <MyProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
