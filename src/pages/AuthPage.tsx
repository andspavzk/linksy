import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, Chrome } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import styles from './AuthPage.module.css'

type Mode = 'login' | 'register'

export default function AuthPage({ mode }: { mode: Mode }) {
  const navigate = useNavigate()
  const { signIn, signUp, signInWithGoogle } = useAuth()

  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (mode === 'register') {
      if (username.trim().length < 2) { setError('Kullanıcı adı en az 2 karakter olmalı.'); setLoading(false); return }
      if (password.length < 6) { setError('Şifre en az 6 karakter olmalı.'); setLoading(false); return }
      const err = await signUp(email, password, username.trim())
      if (err) { setError(err); setLoading(false); return }
      navigate('/app')
    } else {
      const err = await signIn(email, password)
      if (err) { setError('E-posta veya şifre hatalı.'); setLoading(false); return }
      navigate('/app')
    }

    setLoading(false)
  }

  async function handleGoogle() {
    setError(null)
    await signInWithGoogle()
  }

  return (
    <div className={styles.page}>
      <div className={styles.glow} />
      <div className={styles.glow2} />

      <div className={styles.card}>
        <Link to="/" className={styles.logoRow}>
          <div className={styles.logoIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
            </svg>
          </div>
          <span className={styles.logoText}>Linksy</span>
          <span className={styles.betaBadge}>BETA</span>
        </Link>

        <h1 className={styles.title}>
          {mode === 'login' ? 'Tekrar hoş geldin 👋' : 'Hesap Oluştur'}
        </h1>
        <p className={styles.subtitle}>
          {mode === 'login'
            ? 'Hesabına giriş yap, sohbete katıl.'
            : 'Ücretsiz hesap aç, beta\'ya katıl.'}
        </p>

        <button className={styles.googleBtn} onClick={handleGoogle}>
          <Chrome size={17} />
          Google ile {mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
        </button>

        <div className={styles.divider}><span>veya e-posta ile</span></div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className={styles.field}>
              <label className={styles.label}>Kullanıcı Adı</label>
              <div className={styles.inputWrap}>
                <User size={16} className={styles.inputIcon} />
                <input
                  className={styles.input}
                  type="text"
                  placeholder="linksy_kullanici"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label}>E-posta</label>
            <div className={styles.inputWrap}>
              <Mail size={16} className={styles.inputIcon} />
              <input
                className={styles.input}
                type="email"
                placeholder="sen@ornek.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              Şifre
              {mode === 'login' && (
                <a href="#" className={styles.forgotLink}>Şifremi unuttum</a>
              )}
            </label>
            <div className={styles.inputWrap}>
              <Lock size={16} className={styles.inputIcon} />
              <input
                className={styles.input}
                type={showPass ? 'text' : 'password'}
                placeholder={mode === 'register' ? 'En az 6 karakter' : '••••••••'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPass(v => !v)}
                tabIndex={-1}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading
              ? <span className={styles.spinner} />
              : mode === 'login' ? 'Giriş Yap' : 'Hesap Oluştur'}
          </button>
        </form>

        <div className={styles.switchRow}>
          {mode === 'login' ? (
            <>Hesabın yok mu? <Link to="/register" className={styles.switchLink}>Kayıt Ol</Link></>
          ) : (
            <>Zaten hesabın var mı? <Link to="/login" className={styles.switchLink}>Giriş Yap</Link></>
          )}
        </div>
      </div>
    </div>
  )
}