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
    <div className="min-h-screen bg-[#F0F0FF] flex flex-col items-center justify-center p-6">
      <div className="text-center mb-8">
        <div className="text-7xl mb-4">🐧</div>
        <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">알프레도</h1>
        <p className="text-[#666666]">AI 라이프 버틀러</p>
      </div>

      <button
        onClick={handleLogin}
        className="w-full max-w-sm py-4 bg-[#A996FF] text-white rounded-xl font-semibold shadow-lg hover:bg-[#8B7BE8] transition-colors min-h-[56px]"
      >
        시작하기
      </button>
    </div>
  );
}
