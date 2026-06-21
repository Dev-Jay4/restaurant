import { useMemo, useState } from 'react'
import Menu from './components/Menu'
import Cart from './components/Cart'
import AdminDashboard from './pages/AdminDashboard'
import './App.css'

function formatMoney(n) {
  const num = Number(n)
  if (!Number.isFinite(num)) return '0.00'
  return num.toFixed(2)
}

export default function App() {
  const [page, setPage] = useState('home')
  const [cart, setCart] = useState([])
  const [placed, setPlaced] = useState(null)
  const [placing, setPlacing] = useState(false)

  const cartCount = useMemo(() => cart.reduce((sum, it) => sum + it.qty, 0), [cart])

  function addToCart(item) {
    setPlaced(null)
    setCart((prev) => {
      const existing = prev.find((p) => p.id === item.id)
      if (existing) {
        return prev.map((p) =>
          p.id === item.id
            ? {
                ...p,
                qty: p.qty + 1,
                subtotal: (p.qty + 1) * Number(item.price || 0)
              }
            : p
        )
      }
      const price = Number(item.price || 0)
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          price,
          qty: 1,
          subtotal: price
        }
      ]
    })
  }

  function changeQty(id, delta) {
    setPlaced(null)
    setCart((prev) => {
      if (delta === 'remove') return prev.filter((p) => p.id !== id)
      return prev
        .map((p) => {
          if (p.id !== id) return p
          const nextQty = p.qty + delta
          if (nextQty <= 0) return null
          return { ...p, qty: nextQty, subtotal: nextQty * p.price }
        })
        .filter(Boolean)
    })
  }

  async function checkout(payload) {
    if (placing) return
    setPlacing(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: payload.customerName,
          phone: payload.phone,
          notes: payload.notes,
          items: (payload.cart || []).map((it) => ({ id: it.id, qty: it.qty }))
        })
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || `Order failed (${res.status})`)
      }
      const data = await res.json()
      setPlaced(data.order || { id: 'unknown', total: 0 })
      setCart([])
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="appRoot">
      <header className="topbar">
        <div className="brand" onClick={() => setPage('home')} role="button" tabIndex={0}>
          <div className="logoDot" />
          <div>
            <div className="brandName">Restaurant</div>
            <div className="brandTag">Menu • Cart • Orders</div>
          </div>
        </div>

        <nav className="nav">
          <button type="button" className={page === 'home' ? 'navBtn active' : 'navBtn'} onClick={() => setPage('home')}>
            Home
          </button>
          <button type="button" className={page === 'admin' ? 'navBtn active' : 'navBtn'} onClick={() => setPage('admin')}>
            Admin
          </button>
          <div className="cartPill" title="Cart items">
            Cart: <strong>{cartCount}</strong>
          </div>
        </nav>
      </header>

      <main className="main">
        {page === 'home' && (
          <div className="layout">
            <Menu onAdd={addToCart} />
            <Cart cart={cart} onChange={changeQty} onCheckout={checkout} />
            {placed && (
              <div className="toast ok">
                <div className="toastTitle">Order placed!</div>
                <div className="toastBody">
                  Order #{placed.id} • Total ₱{formatMoney(placed.total)}
                </div>
              </div>
            )}
          </div>
        )}

        {page === 'admin' && <AdminDashboard />}
      </main>

      {placing && <div className="overlay">Placing order…</div>}
    </div>
  )
}

