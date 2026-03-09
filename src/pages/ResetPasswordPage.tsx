import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './AuthPage.module.css'

export default function ResetPasswordPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => navigate('/login'), 3000)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className={styles.page}>
      <div className={styles.glow} />
      <div className={styles.glow2} />
      <div className={styles.card}>
        <h1 className={styles.title}>Sifre Sifirlama</h1>
        <p className={styles.subtitle}>
          Firebase sifre sifirlama islemi e-posta uzerinden gerceklesir.
          Giris sayfasina yonlendiriliyorsunuz...
        </p>
      </div>
    </div>
  )
}
