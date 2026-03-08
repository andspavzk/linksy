import { useNavigate } from 'react-router-dom'
import { MessageSquare, Volume2, Shield, Zap, Users, Globe } from 'lucide-react'
import styles from './LandingPage.module.css'

const FEATURES = [
  { icon: <MessageSquare size={22} />, title: 'Gerçek Zamanlı Mesajlaşma', desc: 'Anlık mesaj, reply, reaksiyon ve thread desteğiyle tam Discord deneyimi.' },
  { icon: <Volume2 size={22} />, title: 'Sesli Sohbet', desc: 'WebRTC tabanlı düşük gecikmeli sesli kanallar. Kulaklık tak, konuş.' },
  { icon: <Shield size={22} />, title: 'Türkiye\'den Erişilebilir', desc: 'Yerli altyapı. VPN\'e gerek yok, her cihazdan çalışır.' },
  { icon: <Zap size={22} />, title: 'Sunucu & Kanal Sistemi', desc: 'Kategori, kanal tipleri, rol grupları. Tam sunucu yönetimi.' },
  { icon: <Users size={22} />, title: 'Rol & Üye Yönetimi', desc: 'Founder, Moderator, Member, Bot rolleriyle tam yetki sistemi.' },
  { icon: <Globe size={22} />, title: 'Embed & Thread', desc: 'Link önizleme, arşiv thread\'ler, dosya paylaşımı.' },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      {/* NAV */}
      <nav className={styles.nav}>
        <div className={styles.navLogo}>
          <div className={styles.logoIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
            </svg>
          </div>
          <span className={styles.logoText}>Linksy</span>
          <span className={styles.betaBadge}>BETA</span>
        </div>
        <div className={styles.navLinks}>
          <a href="#features" className={styles.navLink}>Özellikler</a>
          <a href="#how" className={styles.navLink}>Nasıl Çalışır</a>
        </div>
        <div className={styles.navActions}>
          <button className={styles.navLogin} onClick={() => navigate('/login')}>Giriş Yap</button>
          <button className={styles.navSignup} onClick={() => navigate('/register')}>Ücretsiz Başla</button>
        </div>
      </nav>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroContent}>
          <div className={styles.heroTag}>
            <span className={styles.heroDot} />
            Türkiye'nin Discord Alternatifi — Beta Açık
          </div>
          <h1 className={styles.heroTitle}>
            Konuş. Dinle.<br />
            <span className={styles.heroAccent}>Bağlan.</span>
          </h1>
          <p className={styles.heroDesc}>
            Linksy, Discord'un tüm özelliklerini Telegram'ın temiz arayüzüyle birleştiriyor.
            Sesli sohbet, gerçek zamanlı mesajlaşma, sunucu sistemi — hepsi Türkiye'den erişilebilir.
          </p>
          <div className={styles.heroBtns}>
            <button className={styles.heroCtaPrimary} onClick={() => navigate('/register')}>
              Erken Erişim Al — Ücretsiz
            </button>
            <button className={styles.heroCtaSecondary} onClick={() => navigate('/login')}>
              Demo'ya Bak
            </button>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.stat}><span className={styles.statNum}>Beta</span><span className={styles.statLabel}>Sürüm</span></div>
            <div className={styles.statDivider} />
            <div className={styles.stat}><span className={styles.statNum}>%100</span><span className={styles.statLabel}>Ücretsiz</span></div>
            <div className={styles.statDivider} />
            <div className={styles.stat}><span className={styles.statNum}>0ms</span><span className={styles.statLabel}>VPN Gerekmez</span></div>
          </div>
        </div>

        {/* App preview */}
        <div className={styles.heroPreview}>
          <div className={styles.previewBar}>
            <span className={styles.previewDot} style={{ background: '#f05a5a' }} />
            <span className={styles.previewDot} style={{ background: '#f5c542' }} />
            <span className={styles.previewDot} style={{ background: '#4fae4e' }} />
            <span className={styles.previewTitle}>Linksy — Beta</span>
          </div>
          <div className={styles.previewBody}>
            <div className={styles.previewRail}>
              {['BL','DZ','CR'].map((s,i) => (
                <div key={i} className={`${styles.previewSrv} ${i===0?styles.previewSrvActive:''}`}>{s}</div>
              ))}
            </div>
            <div className={styles.previewSidebar}>
              <div className={styles.previewChLabel}>GENERAL</div>
              {['genel-sohbet','duyurular','kurallar'].map(ch => (
                <div key={ch} className={`${styles.previewCh} ${ch==='genel-sohbet'?styles.previewChActive:''}`}>
                  <span>#</span>{ch}
                </div>
              ))}
              <div className={styles.previewChLabel} style={{marginTop:8}}>DEVELOPMENT</div>
              {['frontend','backend','pr-reviews'].map(ch => (
                <div key={ch} className={styles.previewCh}><span>#</span>{ch}</div>
              ))}
            </div>
            <div className={styles.previewMain}>
              <div className={styles.previewMsg} style={{alignSelf:'flex-start'}}>
                <div className={styles.previewBub}>Yeni build deploy edildi 🚀</div>
                <div className={styles.previewTime}>14:23</div>
              </div>
              <div className={styles.previewMsg} style={{alignSelf:'flex-end'}}>
                <div className={styles.previewBubOut}>Merge ettim, teşekkürler 👍</div>
                <div className={styles.previewTime}>14:26</div>
              </div>
              <div className={styles.previewMsg} style={{alignSelf:'flex-start'}}>
                <div className={styles.previewBub}>LiveKit sesli chat için harika seçim 🎙</div>
                <div className={styles.previewTime}>14:28</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className={styles.features} id="features">
        <div className={styles.sectionLabel}>Özellikler</div>
        <h2 className={styles.sectionTitle}>Discord'u bilen bilir.<br />Linksy'u kullanan sever.</h2>
        <div className={styles.featureGrid}>
          {FEATURES.map(f => (
            <div key={f.title} className={styles.featureCard}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <div className={styles.featureTitle}>{f.title}</div>
              <div className={styles.featureDesc}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className={styles.how} id="how">
        <div className={styles.sectionLabel}>Nasıl Çalışır</div>
        <h2 className={styles.sectionTitle}>3 adımda başla</h2>
        <div className={styles.steps}>
          {[
            { n: '01', t: 'Hesap Aç', d: 'E-posta veya Google ile 30 saniyede kayıt ol.' },
            { n: '02', t: 'Sunucu Kur', d: 'Kendi sunucunu oluştur, arkadaşlarını davet et.' },
            { n: '03', t: 'Konuş', d: 'Sesli kanallara gir, mesaj at, topluluk kur.' },
          ].map(s => (
            <div key={s.n} className={styles.step}>
              <div className={styles.stepNum}>{s.n}</div>
              <div className={styles.stepTitle}>{s.t}</div>
              <div className={styles.stepDesc}>{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.ctaGlow} />
        <h2 className={styles.ctaTitle}>Beta'ya katıl, şekillendirmene yardım et.</h2>
        <p className={styles.ctaDesc}>Erken erişim tamamen ücretsiz. Geri bildiriminle Linksy'u inşa edelim.</p>
        <button className={styles.ctaBtn} onClick={() => navigate('/register')}>
          Hemen Başla — Ücretsiz
        </button>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerLogo}>
          <div className={styles.logoIcon}><svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg></div>
          <span>Linksy</span>
        </div>
        <div className={styles.footerLinks}>
          <a href="#">Gizlilik</a>
          <a href="#">Kullanım Koşulları</a>
          <a href="mailto:beta@linksy.chat">İletişim</a>
        </div>
        <div className={styles.footerRight}>© 2025 Linksy — Beta</div>
      </footer>
    </div>
  )
}
