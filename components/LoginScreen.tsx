
import React, { useState } from 'react';
import { User } from '../types';
import { AUTH_CREDENTIALS } from '../constants';
import { Lock, ShieldCheck, Eye, EyeOff } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      if (id === AUTH_CREDENTIALS.ADMIN.id && password === AUTH_CREDENTIALS.ADMIN.pass) {
        onLogin({
          id: AUTH_CREDENTIALS.ADMIN.id,
          name: AUTH_CREDENTIALS.ADMIN.name,
          role: AUTH_CREDENTIALS.ADMIN.role,
          isAuthenticated: true
        });
      } else if (id === AUTH_CREDENTIALS.STAFF.id && password === AUTH_CREDENTIALS.STAFF.pass) {
        onLogin({
          id: AUTH_CREDENTIALS.STAFF.id,
          name: AUTH_CREDENTIALS.STAFF.name,
          role: AUTH_CREDENTIALS.STAFF.role,
          isAuthenticated: true
        });
      } else {
        setError('IDまたはパスワードが正しくありません');
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-600 to-green-800 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-green-50 p-8 text-center border-b border-green-100">
          <div className="w-28 h-28 mx-auto mb-4 relative">
             {/* Calico Cat Logo */}
             <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Ears */}
              <path d="M 15 35 L 10 10 L 40 25 Z" fill="#FB923C" stroke="black" strokeWidth="3" strokeLinejoin="round" /> {/* Left Ear (Orange) */}
              <path d="M 85 35 L 90 10 L 60 25 Z" fill="#374151" stroke="black" strokeWidth="3" strokeLinejoin="round" /> {/* Right Ear (Black) */}
              
              {/* Face Base */}
              <circle cx="50" cy="55" r="40" fill="white" stroke="black" strokeWidth="3" />
              
              {/* Patches */}
              <path d="M 13 40 Q 20 20 50 20 L 30 55 Z" fill="#FB923C" /> {/* Orange Patch */}
              <path d="M 87 40 Q 80 20 50 20 L 70 55 Z" fill="#374151" /> {/* Black Patch */}
              
              {/* Eyes */}
              <ellipse cx="35" cy="52" rx="4" ry="5" fill="black" />
              <ellipse cx="65" cy="52" rx="4" ry="5" fill="black" />
              <circle cx="36" cy="50" r="1.5" fill="white" />
              <circle cx="66" cy="50" r="1.5" fill="white" />
              
              {/* Nose */}
              <path d="M 46 62 L 54 62 L 50 67 Z" fill="#FDA4AF" />
              
              {/* Mouth */}
              <path d="M 50 67 Q 42 75 35 68" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M 50 67 Q 58 75 65 68" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
              
              {/* Whiskers */}
              <line x1="20" y1="60" x2="5" y2="55" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="20" y1="65" x2="5" y2="68" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
              
              <line x1="80" y1="60" x2="95" y2="55" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="80" y1="65" x2="95" y2="68" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">GHちびずアプリ</h1>
          <p className="text-green-600 font-medium text-sm mt-1">障害者グループホーム共有アプリ</p>
        </div>

        {/* Form */}
        <div className="p-8">
          <div className="flex items-center justify-center gap-2 mb-6 bg-yellow-50 text-yellow-700 px-4 py-2 rounded-lg text-xs border border-yellow-200">
            <ShieldCheck className="w-4 h-4" />
            <span>関係者以外立入禁止 (社外秘)</span>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">ログインID</label>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                placeholder="IDを入力"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">パスワード</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none transition-all pr-10"
                  placeholder="パスワードを入力"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-lg text-center animate-shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-green-700 active:scale-95 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  認証中...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" /> ログイン
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">
              デモ用アカウント:<br/>
              管理者: GH000 / 0000<br/>
              スタッフ: staff / staff123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
