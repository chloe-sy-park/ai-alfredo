import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = () => {
    login();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-lavender-50 flex flex-col items-center justify-center p-6">
      <div className="text-center mb-8">
        <div className="text-7xl mb-4">🐧</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">알프레도</h1>
        <p className="text-gray-600">AI 라이프 버틀러</p>
      </div>

      <button
        onClick={handleLogin}
        className="w-full max-w-sm py-4 bg-lavender-500 text-white rounded-2xl font-semibold shadow-lg hover:bg-lavender-600 transition-colors"
      >
        시작하기
      </button>
    </div>
  );
}
