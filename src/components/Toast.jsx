export default function Toast({ msg, type = 'success' }) {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' }
  return (
    <div className={`toast toast-${type}`}>
      <span>{icons[type]}</span>
      <span>{msg}</span>
    </div>
  )
}
