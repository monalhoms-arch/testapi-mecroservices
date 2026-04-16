import { useState, useContext } from 'react'
import { ToastContext } from '../App'

const BASE = 'http://127.0.0.1:8000'

const PROVIDERS = [
  { id: 1, emoji: '⚡', name: 'أحمد محمد', job: 'فني كهرباء', phone: '213XXXXXXXXX' },
  { id: 2, emoji: '🔧', name: 'سليم بن عيسى', job: 'سباك صحي', phone: '213XXXXXXXXX' },
  { id: 3, emoji: '📱', name: 'ياسين حامد', job: 'مصلح أجهزة', phone: '213XXXXXXXXX' },
]

export default function WhatsAppTab() {
  const showToast = useContext(ToastContext)

  const [customerName, setCustomerName] = useState('')
  const [appointment, setAppointment]   = useState('')
  const [price, setPrice]               = useState('')
  const [selectedId, setSelectedId]     = useState(null)
  const [lat, setLat]                   = useState('')
  const [lng, setLng]                   = useState('')
  const [locStatus, setLocStatus]       = useState('')
  const [loading, setLoading]           = useState(false)
  const [invoiceLoading, setInvoiceLoading] = useState(false)
  const [response, setResponse]         = useState(null)
  const [invoiceRes, setInvoiceRes]     = useState(null)
  const [reminders, setReminders]       = useState([])
  const [serverOnline, setServerOnline] = useState(null)

  const checkServer = async () => {
    setServerOnline('checking')
    try {
      await fetch(`${BASE}/reminders`, { signal: AbortSignal.timeout(3000) })
      setServerOnline(true)
      showToast('السيرفر يعمل بنجاح على المنفذ 8000', 'success')
    } catch {
      setServerOnline(false)
      showToast('السيرفر غير متوفر على المنفذ 8000', 'error')
    }
  }

  const getLocation = () => {
    if (!navigator.geolocation) { showToast('المتصفح لا يدعم الموقع', 'error'); return }
    setLocStatus('loading')
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLat(pos.coords.latitude.toFixed(6))
        setLng(pos.coords.longitude.toFixed(6))
        setLocStatus('ok')
        showToast('تم تحديد الموقع بنجاح', 'success')
      },
      () => { setLocStatus('error'); showToast('تعذّر الحصول على الموقع', 'error') }
    )
  }

  const sendMessage = async () => {
    if (!customerName.trim()) { showToast('أدخل اسم الزبون أولاً', 'error'); return }
    if (!selectedId) { showToast('اختر مزود خدمة أولاً', 'error'); return }
    setLoading(true); setResponse(null)
    try {
      const body = {
        provider_id: selectedId,
        customer_name: customerName,
        appointment_datetime: appointment || null,
        latitude: lat ? parseFloat(lat) : null,
        longitude: lng ? parseFloat(lng) : null,
      }
      const res = await fetch(`${BASE}/send-to-provider`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      setResponse(data)
      if (data.redirect) {
        showToast('تم توليد رابط واتساب!', 'success')
        if (appointment) loadReminders()
      }
    } catch (e) {
      showToast('تأكد من تشغيل السيرفر على 8000', 'error')
    } finally {
      setLoading(false)
    }
  }

  const createInvoice = async () => {
    if (!customerName.trim()) { showToast('أدخل اسم الزبون أولاً', 'error'); return }
    if (!selectedId) { showToast('اختر مزود خدمة أولاً', 'error'); return }
    if (!price || isNaN(parseFloat(price))) { showToast('أدخل سعراً صحيحاً', 'error'); return }
    setInvoiceLoading(true); setInvoiceRes(null)
    try {
      const body = {
        provider_id: selectedId,
        customer_name: customerName,
        service_price: parseFloat(price),
        appointment_datetime: appointment || null,
      }
      const res = await fetch(`${BASE}/create-invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      setInvoiceRes(data)
      if (data.status === 'success') showToast(`تم إنشاء الفاتورة ${data.invoice_id}`, 'success')
    } catch {
      showToast('تأكد من تشغيل السيرفر على 8000', 'error')
    } finally {
      setInvoiceLoading(false)
    }
  }

  const loadReminders = async () => {
    try {
      const res = await fetch(`${BASE}/reminders`)
      const data = await res.json()
      setReminders(data.scheduled_jobs || [])
    } catch {}
  }

  const statusDot =
    serverOnline === null ? '' :
    serverOnline === 'checking' ? 'checking' :
    serverOnline ? 'online' : 'offline'

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-top">
          <div className="page-icon page-icon-whatsapp">💬</div>
          <div>
            <h1>WhatsApp Service</h1>
            <p>حجز المواعيد، إرسال الرسائل، وإنشاء الفواتير عبر واتساب</p>
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

      {/* Customer Info */}
      <div className="glass-card section-card">
        <div className="section-card-header">
          <span className="section-title">📋 بيانات الطلب</span>
        </div>
        <div className="two-col">
          <div className="form-group">
            <label className="input-label">اسم الزبون *</label>
            <input className="input-field" placeholder="مثال: محمد أمين"
              value={customerName} onChange={e => setCustomerName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="input-label">📅 موعد الخدمة (اختياري)</label>
            <input className="input-field" type="datetime-local"
              value={appointment} onChange={e => setAppointment(e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label className="input-label">💰 سعر الخدمة (DZD) — مطلوب لإنشاء الفاتورة</label>
          <input className="input-field" type="number" placeholder="مثال: 5000"
            value={price} onChange={e => setPrice(e.target.value)} style={{ maxWidth: 240 }} />
        </div>

        {/* Location */}
        <hr className="divider" />
        <div className="section-title" style={{ marginBottom: 14 }}>📍 الموقع الجغرافي (اختياري)</div>
        <div className="three-col" style={{ marginBottom: 12 }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="input-label">خط العرض (Latitude)</label>
            <input className="input-field" placeholder="36.737" value={lat} onChange={e => setLat(e.target.value)} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="input-label">خط الطول (Longitude)</label>
            <input className="input-field" placeholder="3.086" value={lng} onChange={e => setLng(e.target.value)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn btn-gps btn-sm" onClick={getLocation} style={{ width: '100%' }}>
              {locStatus === 'loading' ? <span className="spinner" /> : '📡 تحديد موقعي'}
            </button>
          </div>
        </div>
        {locStatus === 'ok' && (
          <div className="badge badge-success" style={{ marginTop: 4 }}>
            ✅ تم تحديد الموقع: {lat}, {lng}
          </div>
        )}
      </div>

      {/* Provider selection */}
      <div className="glass-card section-card">
        <div className="section-card-header">
          <span className="section-title">👷 اختر مزود الخدمة</span>
          {selectedId && <span className="badge badge-success">✅ تم الاختيار</span>}
        </div>
        <div className="provider-grid">
          {PROVIDERS.map(p => (
            <div
              key={p.id}
              className={`glass-card provider-card ${selectedId === p.id ? 'selected' : ''}`}
              onClick={() => setSelectedId(p.id)}
            >
              <div className="provider-avatar">{p.emoji}</div>
              <div className="provider-name">{p.name}</div>
              <div className="provider-job">{p.job}</div>
              <div className="badge badge-info" style={{ justifyContent: 'center' }}>ID: {p.id}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="glass-card section-card">
        <div className="section-card-header">
          <span className="section-title">⚡ الإجراءات</span>
        </div>

        {/* Send WhatsApp */}
        <div style={{ marginBottom: 20 }}>
          <div className="endpoint-badge">
            <span className="endpoint-method method-post">POST</span>
            {BASE}/send-to-provider
          </div>
          <button className="btn btn-whatsapp" onClick={sendMessage} disabled={loading}>
            {loading ? <><span className="spinner" /> جاري الإرسال...</> : '💬 إرسال عبر واتساب'}
          </button>
          {response && (
            <div style={{ marginTop: 14 }}>
              <div className="response-block">{JSON.stringify(response, null, 2)}</div>
              {response.redirect && (
                <a href={response.redirect} target="_blank" rel="noreferrer"
                  className="btn btn-whatsapp btn-sm" style={{ marginTop: 10, display: 'inline-flex' }}>
                  🔗 افتح رابط واتساب
                </a>
              )}
            </div>
          )}
        </div>

        <hr className="divider" />

        {/* Create Invoice */}
        <div>
          <div className="endpoint-badge">
            <span className="endpoint-method method-post">POST</span>
            {BASE}/create-invoice
          </div>
          <button className="btn btn-pdf" onClick={createInvoice} disabled={invoiceLoading}>
            {invoiceLoading ? <><span className="spinner" /> جاري الإنشاء...</> : '🧾 إنشاء فاتورة PDF'}
          </button>
          {invoiceRes && (
            <div style={{ marginTop: 14 }}>
              <div className="response-block">{JSON.stringify(invoiceRes, null, 2)}</div>
              {invoiceRes.invoice_url && (
                <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
                  <a href={invoiceRes.invoice_url} target="_blank" rel="noreferrer"
                    className="btn btn-pdf btn-sm">
                    📄 تحميل الفاتورة
                  </a>
                  {invoiceRes.whatsapp_redirect && (
                    <a href={invoiceRes.whatsapp_redirect} target="_blank" rel="noreferrer"
                      className="btn btn-whatsapp btn-sm">
                      💬 إرسال عبر واتساب
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reminders */}
      <div className="glass-card section-card">
        <div className="section-card-header">
          <span className="section-title">🔔 التذكيرات المجدولة</span>
          <button className="btn btn-ghost btn-sm" onClick={loadReminders}>تحديث 🔄</button>
        </div>
        <div className="endpoint-badge">
          <span className="endpoint-method method-get">GET</span>
          {BASE}/reminders
        </div>
        {reminders.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
            لا توجد تذكيرات مجدولة حالياً
          </p>
        ) : (
          reminders.map((r, i) => (
            <div key={i} className="reminder-card">
              <div className="reminder-dot" />
              <div className="reminder-text">🔔 {r.id}</div>
              <div className="reminder-time">{r.next_run}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
