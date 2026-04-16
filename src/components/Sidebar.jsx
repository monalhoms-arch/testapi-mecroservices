const TABS = [
  {
    id: 'whatsapp',
    icon: '💬',
    title: 'WhatsApp',
    sub: 'Booking & Reminders',
    port: '8000',
    portClass: 'port-whatsapp',
    activeClass: 'active-whatsapp',
  },
  {
    id: 'pdf',
    icon: '📄',
    title: 'PDF Invoice',
    sub: 'Invoice Generator',
    port: '8002',
    portClass: 'port-pdf',
    activeClass: 'active-pdf',
  },
  {
    id: 'gps',
    icon: '📍',
    title: 'GPS & Maps',
    sub: 'Location Tools',
    port: '8001',
    portClass: 'port-gps',
    activeClass: 'active-gps',
  },
]

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🚀</div>
        <div className="sidebar-logo-text">
          <h2>API Tester</h2>
          <p>Developer Dashboard</p>
        </div>
      </div>

      <div className="nav-section-title">Services</div>

      {TABS.map((tab) => (
        <div
          key={tab.id}
          className={`nav-item ${activeTab === tab.id ? 'active ' + tab.activeClass : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          <span className="nav-item-icon">{tab.icon}</span>
          <span className="nav-item-info">
            <span className="nav-item-title">{tab.title}</span>
            <span className="nav-item-sub">{tab.sub}</span>
          </span>
          <span className={`port-badge ${tab.portClass}`}>{tab.port}</span>
        </div>
      ))}

      <div className="sidebar-footer">
        <p>خدمتي Platform v1.0</p>
      </div>
    </aside>
  )
}
