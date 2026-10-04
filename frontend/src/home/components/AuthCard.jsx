export default function AuthCard({ title, subtitle, message, messageType = 'info', children, links }) {
  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header"><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>
        {message && <div className={`alert alert-${messageType}`} role="status">{message}</div>}
        {children}
        {links && <div className="auth-links">{links}</div>}
      </div>
    </div>
  );
}
