import { useState, useContext } from 'react'
import { ToastContext } from '../App'

const BASE = 'http://localhost:8001'

const MAP_PLATFORMS = [
  { key: 'google_maps',     label: 'Google Maps',      icon: '🗺️' },
  { key: 'apple_maps',      label: 'Apple Maps',       icon: '🍎' },
  { key: 'open_street_map', label: 'OpenStreetMap',    icon: '🌍' },
]

const SAMPLE_LOCATIONS = [
  { name: 'الجزائر العاصمة', lat: '36.7372', lng: '3.0865' },
  { name: 'وهران',           lat: '35.6971', lng: '-0.6308' },
  { name: 'قسنطينة',         lat: '36.3650', lng: '6.6147' },
  { name: 'عنابة',           lat: '36.9000', lng: '7.7667' },
]

export default function GpsTab() {
  const showToast = useContext(ToastContext)

  const [lat, setLat]         = useState('')
  const [lng, setLng]         = useState('')
  const [zoom, setZoom]       = useState(15)
  const [loading, setLoading] = useState(false)
  const [locLoading, setLocLoading] = useState(false)
  const [response, setResponse]   = useState(null)
  const [fmtResponse, setFmtResponse] = useState(null)
  const [serverOnline, setServerOnline] = useState(null)

  const checkServer = async () => {
    setServerOnline('checking')
    try {
      await fetch(`${BASE}/api/v1/maps-url?lat=0&lng=0`, { signal: AbortSignal.timeout(3000) })
      setServerOnline(true)
      showToast('سيرفر GPS يعمل على المنفذ 8001', 'success')
    } catch {
      setServerOnline(false)
      showToast('سيرفر GPS غير متاح على 8001', 'error')
    }
  }

  const detectLocation = () => {
    if (!navigator.geolocation) { showToast('المتصفح لا يدعم الموقع الجغرافي', 'error'); return }
    setLocLoading(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLat(pos.coords.latitude.toFixed(6))
        setLng(pos.coords.longitude.toFixed(6))
        setLocLoading(false)
        showToast('تم تحديد موقعك تلقائياً', 'success')
      },
      () => {
        setLocLoading(false)
        showToast('تعذّر الحصول على الموقع، أدخله يدوياً', 'error')
      }
    )
  }

  const getMapsUrl = async () => {
    if (!lat || !lng) { showToast('أدخل الإحداثيات أولاً', 'error'); return }
    setLoading(true); setResponse(null)
    try {
      const res = await fetch(`${BASE}/api/v1/maps-url?lat=${lat}&lng=${lng}&zoom=${zoom}`)
      const data = await res.json()
      setResponse(data)
      if (data.status === 'success') showToast('تم توليد روابط الخريطة بنجاح', 'success')
      else showToast('حدث خطأ في الإحداثيات', 'error')
    } catch {
      showToast('تأكد من تشغيل سيرفر GPS على المنفذ 8001', 'error')
    } finally {
      setLoading(false)
    }
  }

  const formatLocation = async () => {
    if (!lat || !lng) { showToast('أدخل الإحداثيات أولاً', 'error'); return }
    setFmtResponse(null)
    try {
      const res = await fetch(`${BASE}/api/v1/format-location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: parseFloat(lat), longitude: parseFloat(lng) }),
      })
      const data = await res.json()
      setFmtResponse(data)
      showToast('تم تنسيق الموقع بنجاح', 'success')
    } catch {
      showToast('تأكد من تشغيل سيرفر GPS على المنفذ 8001', 'error')
    }
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
          <div className="page-icon page-icon-gps">📍</div>
          <div>
            <h1>GPS & Maps Service</h1>
            <p>توليد روابط الخرائط وتنسيق الإحداثيات الجغرافية</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
          <div className="server-status">
            <div className={`status-dot ${statusDot}`} />
            <span>
              {serverOnline === null       && 'غير محدد'}
              {serverOnline === 'checking' && 'يتم الفحص...'}
              {serverOnline === true       && 'السيرفر يعمل'}
              {serverOnline === false      && 'السيرفر متوقف'}
            </span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={checkServer}>فحص الاتصال 🔍</button>
        </div>
      </div>

      {/* Coordinates input */}
      <div className="glass-card section-card">
        <div className="section-card-header">
          <span className="section-title">🧭 إدخال الإحداثيات</span>
          <button className="btn btn-gps btn-sm" onClick={detectLocation} disabled={locLoading}>
            {locLoading ? <><span className="spinner" /> يتم التحديد...</> : '📡 تحديد موقعي'}
          </button>
        </div>

        {/* Quick sample locations */}
        <div style={{ marginBottom: 18 }}>
          <label className="input-label">مواقع سريعة</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
            {SAMPLE_LOCATIONS.map(loc => (
              <button
                key={loc.name}
                className="btn btn-ghost btn-sm"
                onClick={() => { setLat(loc.lat); setLng(loc.lng); showToast(`تم اختيار ${loc.name}`, 'info') }}
              >
                📌 {loc.name}
              </button>
            ))}
          </div>
        </div>

        <div className="three-col">
          <div className="form-group" style={{ margin: 0 }}>
            <label className="input-label">خط العرض (Latitude) *</label>
            <input className="input-field" type="number" step="0.000001"
              placeholder="مثال: 36.7372"
              value={lat} onChange={e => setLat(e.target.value)} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="input-label">خط الطول (Longitude) *</label>
            <input className="input-field" type="number" step="0.000001"
              placeholder="مثال: 3.0865"
              value={lng} onChange={e => setLng(e.target.value)} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="input-label">مستوى التكبير (Zoom: 1–20)</label>
            <input className="input-field" type="number" min="1" max="20"
              value={zoom} onChange={e => setZoom(e.target.value)} />
          </div>
        </div>

        {lat && lng && (
          <div className="badge badge-info" style={{ marginTop: 14 }}>
            🌐 {lat}, {lng} — Zoom {zoom}
          </div>
        )}
      </div>

      {/* GET maps-url */}
      <div className="glass-card section-card">
        <div className="section-card-header">
          <span className="section-title">🗺️ توليد روابط الخريطة</span>
        </div>
        <div className="endpoint-badge">
          <span className="endpoint-method method-get">GET</span>
          {BASE}/api/v1/maps-url?lat=&amp;lng=&amp;zoom=
        </div>
        <button className="btn btn-gps" onClick={getMapsUrl} disabled={loading}>
          {loading ? <><span className="spinner" /> جاري التوليد...</> : '🗺️ توليد روابط الخرائط'}
        </button>

        {response && (
          <div style={{ marginTop: 18 }}>
            <div className="response-block" style={{ marginBottom: 16 }}>
              {JSON.stringify(response, null, 2)}
            </div>
            {response.urls && (
              <div className="map-links-grid">
                {MAP_PLATFORMS.map(p => (
                  <div key={p.key} className="map-link-card">
                    <div className="map-link-platform">
                      <span>{p.icon}</span>
                      <span>{p.label}</span>
                    </div>
                    <a
                      href={response.urls[p.key]}
                      target="_blank"
                      rel="noreferrer"
                      className="map-link-url"
                    >
                      {response.urls[p.key]}
                    </a>
                    <a
                      href={response.urls[p.key]}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-gps btn-sm"
                      style={{ marginTop: 4 }}
                    >
                      فتح الخريطة ↗
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* POST format-location */}
      <div className="glass-card section-card">
        <div className="section-card-header">
          <span className="section-title">🔗 تنسيق الإحداثيات كرابط Google</span>
        </div>
        <div className="endpoint-badge">
          <span className="endpoint-method method-post">POST</span>
          {BASE}/api/v1/format-location
        </div>
        <button className="btn btn-ghost" onClick={formatLocation}>
          🔗 تنسيق الموقع
        </button>

        {fmtResponse && (
          <div style={{ marginTop: 16 }}>
            <div className="response-block">{JSON.stringify(fmtResponse, null, 2)}</div>
            {fmtResponse.url && (
              <a
                href={fmtResponse.url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-gps btn-sm"
                style={{ marginTop: 12, display: 'inline-flex' }}
              >
                🗺️ فتح على Google Maps
              </a>
            )}
          </div>
        )}
      </div>

      {/* Map preview */}
      {lat && lng && (
        <div className="glass-card section-card">
          <div className="section-card-header">
            <span className="section-title">🖼️ معاينة الموقع</span>
          </div>
          <div style={{
            background: 'rgba(139,92,246,0.05)',
            border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            height: 300,
          }}>
            <iframe
              title="map-preview"
              width="100%"
              height="300"
              style={{ border: 'none', display: 'block' }}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(lng)-0.01},${parseFloat(lat)-0.01},${parseFloat(lng)+0.01},${parseFloat(lat)+0.01}&layer=mapnik&marker=${lat},${lng}`}
            />
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
            معاينة مباشرة عبر OpenStreetMap بدون مفتاح API
          </p>
        </div>
      )}
    </div>
  )
}
