'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../services/api';
import { Lock, Mail, User, AlertTriangle } from 'lucide-react';
import ThemeToggle from '../../components/ThemeToggle';

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.register(username, email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Kayıt başarısız. Bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-bg-primary flex flex-col justify-center items-center px-4 relative overflow-hidden theme-transition">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-bg-secondary/80 backdrop-blur-xl border border-border-color rounded-3xl p-8 shadow-2xl relative z-10 theme-transition">
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4 flex items-center justify-center">
            <img src="/logo.png" alt="TrackMate Logo" className="w-24 h-24 object-contain drop-shadow-lg theme-transition" />
          </div>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight theme-transition">TrackMate</h1>
          <p className="text-text-secondary text-sm mt-2 theme-transition">Hemen Kayıt Olup Keşfetmeye Başlayın</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-2xl flex items-center gap-3 text-sm animate-shake">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 theme-transition">Kullanıcı Adı</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary opacity-70" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="kullaniciadiniz"
                className="w-full bg-bg-tertiary/50 border border-border-color focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-text-primary placeholder-text-secondary/50 rounded-2xl pl-12 pr-4 py-3.5 outline-none transition-all duration-200 theme-transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 theme-transition">E-posta Adresi</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary opacity-70" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@domain.com"
                className="w-full bg-bg-tertiary/50 border border-border-color focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-text-primary placeholder-text-secondary/50 rounded-2xl pl-12 pr-4 py-3.5 outline-none transition-all duration-200 theme-transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 theme-transition">Şifre</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary opacity-70" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="En az 8 karakter"
                className="w-full bg-bg-tertiary/50 border border-border-color focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-text-primary placeholder-text-secondary/50 rounded-2xl pl-12 pr-4 py-3.5 outline-none transition-all duration-200 theme-transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/25 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Kayıt Ol ve Giriş Yap'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-text-secondary text-sm theme-transition">
            Zaten hesabınız var mı?{' '}
            <Link href="/login" className="text-indigo-500 font-semibold hover:underline">
              Giriş Yapın
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
