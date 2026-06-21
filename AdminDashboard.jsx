import { useEffect, useState } from 'react'

function formatMoney(n) {
  const num = Number(n)
  if (!Number.isFinite(num)) return '0.00'
  return num.toFixed(2)
}

export default function AdminDashboard() {
  const [token, setToken] = useState('')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    const envToken = import.meta.env.VITE_ADMIN_TOKEN
    if (envToken) setToken(envToken)
  }, [])

  async function loadOrders(tkn) {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/orders', {
        headers: { Authorization: `Bearer ${tkn}` }
      })
      if (res.status === 401) throw new Error('Unauthorized: wrong token')
      if (!res.ok) throw new Error(`Failed to load orders (${res.status})`)
      const data = await res.json()
      setOrders(data.orders || [])
      setAuthed(true)
    } catch (e) {
      setAuthed(false)
      setOrders([])
      setError(e?.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      loadOrders(token)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleLogin(e) {
    e.preventDefault()
    if (!token.trim()) {
      setError('Token is required')
      return
    }
    loadOrders(token.trim())
  }

  return (
    <div className="section">
      <div className="adminHeader">
        <h2>Admin Dashboard</h2>
        <p className="muted">View incoming orders</p>
      </div>

      <form className="tokenForm" onSubmit={handleLogin}>
        <div className="field">
          <label>Admin token</label>
          <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="Paste token" />
        </div>
        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Loading…' : 'Load orders'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {!error && authed && orders.length === 0 && <p className="muted">No orders yet.</p>}

      {orders.length > 0 && (
        <div className="orders">
          {orders
            .slice()
            .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
            .map((o) => (
              <div key={o.id} className="order">
                <div className="orderTop">
                  <div>
                    <div className="orderId">Order #{o.id}</div>
                    <div className="orderMeta">
                      {o.customerName} {o.phone ? `• ${o.phone}` : ''}
                    </div>
                    <div className="orderDate">
                      {o.createdAt ? new Date(o.createdAt).toLocaleString() : ''}
                    </div>
                  </div>
                  <div className="orderTotal">
                    <strong>${formatMoney(o.total)}</strong>
                  </div>
                </div>

                <div className="orderItems">
                  {o.items?.map((it) => (
                    <div key={`${o.id}:${it.id}`} className="orderItem">
                      <span>
                        {it.name} × {it.qty}
                      </span>
                      <span>${formatMoney(it.subtotal)}</span>
                    </div>
                  ))}
                </div>

                {o.notes && <div className="orderNotes">Notes: {o.notes}</div>}
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

