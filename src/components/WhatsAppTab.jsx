import { useState, useContext, useEffect } from 'react'
import { ToastContext } from '../App'

const BASE = 'http://localhost:8000'
const DEFAULT_KEY = 'my_super_secret_key_123'

export default function WhatsAppTab() {
  const showToast = useContext(ToastContext)

  // Global Config
  const [apiKey, setApiKey] = useState(DEFAULT_KEY)
  const [serverOnline, setServerOnline] = useState(null)

  // Form States
  const [phone, setPhone] = useState('')
  const [accountType, setAccountType] = useState('customer')
  const [name, setName] = useState('')
  const [isBusiness, setIsBusiness] = useState(false)
  
  // OTP States
  const [otpCode, setOtpCode] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpTimer, setOtpTimer] = useState(0)

  // Notification States
  const [message, setMessage] = useState('')
  const [directMode, setDirectMode] = useState(false)
  const [notifLoading, setNotifLoading] = useState(false)

  // Response UI
  const [lastResponse, setLastResponse] = useState(null)

  const checkServer = async () => {
    setServerOnline('checking')
    try {
      // Backend root handles health check without API Key
      await fetch(`${BASE}/`, { signal: AbortSignal.timeout(3000) })
      setServerOnline(true)
      showToast('سيرفر الواتساب يعمل بنجاح', 'success')
    } catch {
      setServerOnline(false)
      showToast('السيرفر غير متوفر على المنفذ 8000', 'error')
    }
  }

  const apiFetch = async (endpoint, options = {}) => {
    const url = `${BASE}/api/v1${endpoint}`
    const headers = {
      'Content-Type': 'application/json',
      'X-API-KEY': apiKey,
      ...options.headers
    }
    
    try {
      const res = await fetch(url, { ...options, headers })
      const data = await res.json()
      setLastResponse(data)
      if (!res.ok) throw new Error(data.detail || 'حدث خطأ في الطلب')
      return data
    } catch (err) {
      showToast(err.message, 'error')
      throw err
    }
  }

  const registerAccount = async () => {
    if (!phone) return showToast('أدخل رقم الهاتف', 'error')
    try {
      await apiFetch('/accounts/', {
        method: 'POST',
        body: JSON.stringify({ phone_number: phone, account_type: accountType, name, is_business_whatsapp: isBusiness })
      })
      showToast('تم تسجيل الحساب بنجاح', 'success')
    } catch {}
  }

  const sendOtp = async () => {
    if (!phone) return showToast('أدخل رقم الهاتف', 'error')
    setOtpLoading(true)
    try {
      await apiFetch('/otp/send', {
        method: 'POST',
        body: JSON.stringify({ phone_number: phone, account_type: accountType })
      })
      showToast('تم إرسال رمز الـ OTP عبر واتساب', 'success')
      setOtpTimer(60)
    } catch {} finally { setOtpLoading(false) }
  }

  const verifyOtp = async () => {
    if (!phone || !otpCode) return showToast('أدخل الهاتف والرمز', 'error')
    try {
      const data = await apiFetch('/otp/verify', {
        method: 'POST',
        body: JSON.stringify({ phone_number: phone, code: otpCode })
      })
      if (data.status === 'success') showToast('تم التحقق بنجاح!', 'success')
    } catch {}
  }

  const sendNotification = async () => {
    if (!phone || !message) return showToast('أدخل الهاتف والرسالة', 'error')
    setNotifLoading(true)
    try {
      const endpoint = directMode ? '/notifications/direct' : '/notifications/send'
      const body = directMode 
        ? { phone_number: phone, message, is_business: isBusiness }
        : { phone_number: phone, message, account_type: accountType }

      await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(body)
      })
      showToast(directMode ? 'تم إرسال الرسالة المباشرة' : 'تم وضع الإشعار في الانتظار', 'success')
    } catch {} finally { setNotifLoading(false) }
  }

  useEffect(() => {
    let interval
    if (otpTimer > 0) {
      interval = setInterval(() => setOtpTimer(t => t - 1), 1000)
    }
    return () => clearInterval(interval)
  }, [otpTimer])

  const statusDot = 
    serverOnline === null ? '' : 
    serverOnline === 'checking' ? 'checking' : 
    serverOnline ? 'online' : 'offline'

  return (
    <div className="whatsapp-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-top">
          <div className="page-icon page-icon-whatsapp">🔐</div>
          <div>
            <h1>WhatsApp Security & OTP</h1>
            <p>نظام توثيق الهوية والإشعارات الذكي عبر واتساب</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
          <div className="server-status">
            <div className={`status-dot ${statusDot}`} />
            <span>
              {serverOnline === null && 'غير محدد'}
              {serverOnline === 'checking' && 'يتم الفحص...'}
              {serverOnline === true  && 'السيرفر يعمل'}
              {serverOnline === false && 'السيرفر متوقف'}
            </span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={checkServer}>فحص الاتصال 🔍</button>
        </div>
      </div>

      {/* API Configuration */}
      <div className="glass-card section-card">
        <div className="section-card-header">
          <span className="section-title">⚙️ إعدادات الحماية</span>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="input-label">X-API-KEY (أمان النظام)</label>
          <input 
            className="input-field" 
            type="password" 
            value={apiKey} 
            onChange={e => setApiKey(e.target.value)}
            placeholder="أدخل مفتاح الـ API..."
          />
        </div>
      </div>

      <div className="two-col">
        {/* Account Info */}
        <div className="glass-card section-card">
          <div className="section-card-header">
            <span className="section-title">👤 بيانات المستخدم</span>
          </div>
          <div className="form-group">
            <label className="input-label">رقم الهاتف (مع رمز الدولة)</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <input className="input-field" placeholder="2137XXXXXXXX"
                value={phone} onChange={e => setPhone(e.target.value)} />
              <button 
                className="btn btn-whatsapp btn-sm" 
                onClick={() => {
                  const clean = phone.replace(/\D/g, '');
                  if (clean) window.open(`https://wa.me/${clean}`, '_blank');
                  else showToast('أدخل رقم هاتف صحيح أولاً', 'error');
                }}
                title="فتح في واتساب"
              >
                💬
              </button>
            </div>
          </div>
          <div className="form-group">
            <label className="input-label">نوع الحساب</label>
            <select className="input-field" value={accountType} onChange={e => setAccountType(e.target.value)}>
              <option value="customer">زبون (Customer)</option>
              <option value="provider">مزود خدمة (Provider)</option>
              <option value="admin">مسؤول (Admin)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="input-label">الاسم الكامل (اختياري)</label>
            <input className="input-field" placeholder="محمد أمين"
              value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '10px 0' }}>
            <input 
              type="checkbox" 
              checked={isBusiness} 
              onChange={e => setIsBusiness(e.target.checked)}
              id="isBusinessCheck"
            />
            <label htmlFor="isBusinessCheck" style={{ fontSize: 13, cursor: 'pointer' }}>حساب أعمال (Business WhatsApp)</label>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={registerAccount} style={{ width: '100%', marginTop: 8 }}>
            ➕ تسجيل الحساب في القاعدة
          </button>
        </div>

        {/* OTP System */}
        <div className="glass-card section-card">
          <div className="section-card-header">
            <span className="section-title">🛡️ نظام التحقق (OTP)</span>
          </div>
          <div style={{ marginBottom: 20 }}>
            <button 
              className="btn btn-whatsapp" 
              onClick={sendOtp} 
              disabled={otpLoading || otpTimer > 0}
              style={{ width: '100%' }}
            >
              {otpLoading ? <span className="spinner" /> : (otpTimer > 0 ? `أعد المحاولة بعد ${otpTimer} ثانية` : '💬 إرسال رمز OTP')}
            </button>
          </div>
          
          <div className="form-group">
            <label className="input-label">أدخل الرمز المكون من 6 أرقام</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <input 
                className="input-field" 
                maxLength={6} 
                style={{ textAlign: 'center', letterSpacing: 4, fontWeight: 'bold' }}
                value={otpCode}
                onChange={e => setOtpCode(e.target.value)}
              />
              <button className="btn btn-gps" onClick={verifyOtp}>تحقق ✅</button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-card section-card">
        <div className="section-card-header">
          <span className="section-title">🔔 محرك الإشعارات (Background)</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input 
              type="checkbox" 
              checked={directMode} 
              onChange={e => setDirectMode(e.target.checked)}
              id="directModeCheck"
            />
            <label htmlFor="directModeCheck" style={{ fontSize: 13, cursor: 'pointer', color: 'var(--text-secondary)' }}>رسالة مباشرة 🔗</label>
          </div>
        </div>
        <div className="form-group">
          <label className="input-label">الرسالة المطلوبة</label>
          <textarea 
            className="input-field" 
            rows={3} 
            placeholder={directMode ? "اكتب رسالتك المباشرة هنا..." : "اكتب رسالتك هنا..."}
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
        </div>
        <button className="btn btn-pdf" onClick={sendNotification} disabled={notifLoading} style={{ width: '100%' }}>
          {notifLoading ? <span className="spinner" /> : (directMode ? '🚀 إرسال رسالة مباشرة' : '🚀 إرسال إشعار فوري')}
        </button>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10, textAlign: 'center' }}>
          * {directMode ? 'سيتم إرسال الرسالة كما هي بدون أي بادئات تلقائية.' : 'سيتم إضافة بادئة تلقائية بناءً على نوع الحساب.'}
        </p>
      </div>

      {/* Debug Response */}
      {lastResponse && (
        <div className="glass-card section-card">
          <div className="section-card-header">
            <span className="section-title">📊 استجابة الخادم (Debug)</span>
          </div>
          <pre className="response-block">
            {JSON.stringify(lastResponse, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
