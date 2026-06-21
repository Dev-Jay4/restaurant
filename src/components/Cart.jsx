import { useMemo, useState } from 'react'

function formatMoney(n) {
  const num = Number(n)
  if (!Number.isFinite(num)) return '0.00'
  return num.toFixed(2)
}

export default function Cart({ cart, onChange, onCheckout }) {
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const total = useMemo(() => cart.reduce((sum, it) => sum + Number(it.subtotal || 0), 0), [cart])

  async function handleCheckout(e) {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')
    try {
      await onCheckout?.({ customerName, phone, notes, cart })
      setCustomerName('')
      setPhone('')
      setNotes('')
    } catch (err) {
      setMessage(err?.message || 'Checkout failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="section">
      <h2>Cart</h2>
      {cart.length === 0 ? (
        <p className="muted">Your cart is empty.</p>
      ) : (
        <div>
          <div className="cartList">
            {cart.map((it) => (
              <div key={it.id} className="cartItem">
                  <div className="ciLeft">
                  <div className="ciName">{it.name}</div>
                  <div className="ciSub">₱{formatMoney(it.price)} × {it.qty}</div>
                </div>
                <div className="ciRight">
                  <div className="ciSubtotal">₱{formatMoney(it.subtotal)}</div>
                  <div className="qtyControls">
                    <button type="button" className="mini" onClick={() => onChange?.(it.id, -1)}>
                      −
                    </button>
                    <button type="button" className="mini qty" disabled>
                      {it.qty}
                    </button>
                    <button type="button" className="mini" onClick={() => onChange?.(it.id, +1)}>
                      +
                    </button>
                    <button type="button" className="mini danger" onClick={() => onChange?.(it.id, 'remove')}>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="totals">
            <div className="totalRow">
              <span>Total</span>
              <strong>₱{formatMoney(total)}</strong>
            </div>
          </div>

          <form className="checkout" onSubmit={handleCheckout}>
            <div className="field">
              <label>Customer name</label>
              <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
            </div>
            <div className="field">
              <label>Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="field">
              <label>Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
            </div>
            {message && <p className="error">{message}</p>}
            <button className="btn primary" type="submit" disabled={submitting}>
              {submitting ? 'Placing order…' : 'Place order'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

