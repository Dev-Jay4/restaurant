import { useEffect, useState } from 'react'

function formatMoney(n) {
  const num = Number(n)
  if (!Number.isFinite(num)) return '0.00'
  return num.toFixed(2)
}

export default function Menu({ onAdd }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError('')
        const res = await fetch('/api/menu')
        if (!res.ok) throw new Error(`Failed to load menu (${res.status})`)
        const data = await res.json()
        if (!cancelled) setItems(data.items || [])
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to load menu')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="section">
      <h2>Menu</h2>
      {loading && <p>Loading menu…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && (
        <div className="grid">
          {items.map((it) => (
            <article key={it.id} className="card">
              <h3>{it.name}</h3>
              {it.description && <p className="muted">{it.description}</p>}
              <div className="row">
                <div className="price">₱{formatMoney(it.price)}</div>
                <button className="btn" type="button" onClick={() => onAdd?.(it)}>
                  Add
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

