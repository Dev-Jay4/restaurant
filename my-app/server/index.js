import express from 'express'
import cors from 'cors'

const app = express()

app.use(cors())
app.use(express.json())

// In-memory data (demo/local run)
let menu = [
  { id: '1', name: 'Margherita Pizza', price: 12.99, description: 'Classic cheese & basil.' },
  { id: '2', name: 'Pepperoni Pizza', price: 14.99, description: 'Pepperoni & mozzarella.' },
  { id: '3', name: 'Caesar Salad', price: 9.5, description: 'Crisp romaine, parmesan, croutons.' },
  { id: '4', name: 'Iced Tea', price: 3.75, description: 'Refreshing brewed iced tea.' }
]

let orders = []

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin123'

app.get('/api/menu', (_req, res) => {
  res.json({ items: menu })
})

app.post('/api/orders', (req, res) => {
  const { customerName, phone, items, notes } = req.body || {}

  if (!customerName || typeof customerName !== 'string') {
    return res.status(400).json({ error: 'customerName is required' })
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'items must be a non-empty array' })
  }

  const lineItems = items.map((it) => {
    const menuItem = menu.find((m) => m.id === it.id)
    const qty = Number(it.qty || 0)
    const price = menuItem ? menuItem.price : 0
    return {
      id: it.id,
      name: menuItem ? menuItem.name : 'Unknown',
      price,
      qty,
      subtotal: price * qty
    }
  })

  const total = lineItems.reduce((sum, li) => sum + li.subtotal, 0)

  const order = {
    id: String(Date.now()),
    createdAt: new Date().toISOString(),
    status: 'received',
    customerName,
    phone: phone || '',
    items: lineItems,
    notes: notes || '',
    total
  }

  orders.push(order)
  res.status(201).json({ order })
})

function requireAdmin(req, res, next) {
  const token = req.header('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token || token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  next()
}

app.get('/api/admin/orders', requireAdmin, (_req, res) => {
  res.json({ orders })
})

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

const port = Number(process.env.PORT || 4001)
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${port}`)
  // eslint-disable-next-line no-console
  console.log(`Admin token: ${ADMIN_TOKEN}`)
})

export default app

