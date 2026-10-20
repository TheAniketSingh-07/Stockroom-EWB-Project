import { useEffect, useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { ArrowDownRight, Boxes, CircleDollarSign, Code2, Copy, Download, Moon, PackagePlus, RotateCcw, Search, Sun, Trash2, TrendingUp } from 'lucide-react'

/**
 * @typedef {'Budget' | 'Standard' | 'Premium'} Category
 * @typedef {{ id: string, name: string, price: number, category: Category }} Product
 * @typedef {'All items' | 'Under ₹10,000' | Category} Filter
 */

/** @type {Product[]} */
const initialProducts = [
  { id: 'lenovo-ideapad', name: 'Lenovo IdeaPad Slim 3', price: 62990, category: 'Premium' },
  { id: 'boat-airdopes', name: 'boAt Airdopes 141', price: 1299, category: 'Budget' },
  { id: 'samsung-monitor', name: 'Samsung 24″ FHD Monitor', price: 12499, category: 'Standard' },
]

const INVENTORY_STORAGE_KEY = 'stockroom-inventory-inr-v2'
const THEME_STORAGE_KEY = 'theme'

/** @returns {value is Product[]} */
function isProductList(value) {
  return Array.isArray(value) && value.every((item) => {
    if (typeof item !== 'object' || item === null) return false
    const product = item
    return typeof product.id === 'string' && typeof product.name === 'string' &&
      typeof product.price === 'number' && Number.isFinite(product.price) &&
      ['Budget', 'Standard', 'Premium'].includes(String(product.category))
  })
}

/** @returns {Category} */
function getCategory(price) {
  switch (true) {
    case price < 5000: return 'Budget'
    case price > 50000: return 'Premium'
    default: return 'Standard'
  }
}

/** @param {Product[]} items */
function calculateInventoryTotal(items) {
  return items.reduce((total, item) => total + item.price, 0)
}

const applyAdjustments = (total, tax, discount) =>
  total + total * (tax / 100) - total * (discount / 100)

const currency = (amount) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 2,
}).format(amount)

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Stockroom — Inventory, made clear' },
      { name: 'description', content: 'A friendly inventory dashboard that makes JavaScript fundamentals practical.' },
    ],
  }),
  component: InventoryDashboard,
})

function InventoryDashboard() {
  const [products, setProducts] = useState(initialProducts)
  const [hasLoadedInventory, setHasLoadedInventory] = useState(false)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState(/** @type {Filter} */ ('All items'))
  const [tax, setTax] = useState('18')
  const [discount, setDiscount] = useState('0')
  const [lastPrompt, setLastPrompt] = useState('[Sample roster loaded: Lenovo, boAt, Samsung]')
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    let cancelled = false
    void Promise.resolve().then(() => {
      if (!cancelled) setIsDark(document.documentElement.classList.contains('dark'))
    })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    async function loadSavedInventory() {
      await Promise.resolve()
      try {
        const savedInventory = JSON.parse(localStorage.getItem(INVENTORY_STORAGE_KEY) ?? 'null')
        if (!cancelled && isProductList(savedInventory)) {
          setProducts(savedInventory)
          setLastPrompt('[Saved roster restored from this device]')
        }
      } catch {
        toast.error('Saved inventory could not be read. The sample roster is ready instead.')
      }
      if (!cancelled) setHasLoadedInventory(true)
    }
    void loadSavedInventory()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!hasLoadedInventory) return
    try {
      localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(products))
    } catch {
      toast.error('Your browser could not save the inventory. It will remain available until you close this tab.')
    }
  }, [hasLoadedInventory, products])

  const total = calculateInventoryTotal(products)
  const affordable = products.filter((item) => item.price < 10000)
  const report = products.map((item) => `${item.name.toUpperCase()}: ${currency(item.price)}`)
  /** @type {string[]} */
  const roster = []
  products.forEach((item) => roster.push(`* Item: ${item.name} (${currency(item.price)}) -> Category: ${item.category}`))
  /** @type {Product | undefined} */
  let firstPremium
  for (const item of products) {
    if (!Number.isFinite(item.price)) continue
    if (item.category === 'Premium') {
      firstPremium = item
      break
    }
  }
  const visibleProducts = useMemo(() => products.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(query.toLowerCase())
    const matchesFilter = filter === 'All items' || (filter === 'Under ₹10,000'
      ? item.price < 10000 : item.category === filter)
    return matchesSearch && matchesFilter
  }), [filter, products, query])
  const adjustedTotal = applyAdjustments(total, Number(tax) || 0, Number(discount) || 0)
  /** @type {Filter[]} */
  const filters = ['All items', 'Under ₹10,000', 'Budget', 'Standard', 'Premium']

  function toggleTheme() {
    const nextIsDark = !document.documentElement.classList.contains('dark')
    document.documentElement.classList.toggle('dark', nextIsDark)
    setIsDark(nextIsDark)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextIsDark ? 'dark' : 'light')
    } catch {
      toast.error('Your theme could not be saved in this browser.')
    }
  }

  function saveProduct(cleanName, numericPrice, source = 'Form submitted') {
    const newProduct = { id: crypto.randomUUID(), name: cleanName, price: numericPrice, category: getCategory(numericPrice) }
    setProducts((current) => [newProduct, ...current])
    setLastPrompt(`[${source}: added "${cleanName}" at "${currency(numericPrice)}"]`)
    toast.success(`${cleanName} added to inventory.`)
  }

  function addProduct(event) {
    event.preventDefault()
    const cleanName = name.trim()
    const numericPrice = Number(price)
    if (!cleanName) {
      toast.error('Add a product name first.')
      return
    } else if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      toast.error('Enter a price greater than zero.')
      return
    }
    saveProduct(cleanName, numericPrice)
    setName('')
    setPrice('')
  }

  function addProductWithPrompt() {
    let productName = ''
    while (!productName) {
      const answer = window.prompt('What is the product name?')
      if (answer === null) return
      productName = answer.trim()
      if (!productName) toast.error('A product name is required. Try again.')
    }

    let productPrice = 0
    while (!Number.isFinite(productPrice) || productPrice <= 0) {
      const answer = window.prompt('What is its price in USD?')
      if (answer === null) return
      productPrice = Number(answer)
      if (!answer.trim() || !Number.isFinite(productPrice) || productPrice <= 0) {
        toast.error('Enter a price greater than zero. Try again.')
        productPrice = 0
      }
    }
    saveProduct(productName, productPrice, 'Prompt executed')
  }

  function removeProduct(product) {
    setProducts((current) => current.filter((item) => item.id !== product.id))
    toast.success(`${product.name} removed.`)
  }

  async function copyReport() {
    try {
      await navigator.clipboard.writeText(report.join('\n'))
      toast.success('Formatted report copied.')
    } catch {
      toast.error('Could not access the clipboard in this browser.')
    }
  }

  function exportInventory() {
    const rows = [['Product', 'Price (INR)', 'Category'], ...products.map((item) => [item.name, String(item.price), item.category])]
    const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'stockroom-inventory-inr.csv'
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Inventory exported as a CSV file.')
  }

  function resetInventory() {
    setProducts(initialProducts)
    setQuery('')
    setFilter('All items')
    setLastPrompt('[Sample India roster restored]')
    toast.success('Sample inventory restored.')
  }

  const counts = (category) => products.filter((item) => item.category === category).length

  return (
    <main className="min-h-dvh animate-fade-in bg-background text-foreground">
      <header className="border-b border-border/80 bg-card/80">
        <div className="mx-auto flex max-w-[1380px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm"><Boxes className="size-5" /></div>
            <div><p className="text-[15px] font-bold tracking-tight">stockroom<span className="text-primary">.</span></p><p className="text-[11px] text-muted-foreground">A little inventory, a lot of clarity</p></div>
          </div>
          <div className="flex items-center gap-2"><span className="hidden items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:flex"><span className="size-2 rounded-full bg-primary" />India · INR</span><button type="button" onClick={toggleTheme} aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'} className="flex size-10 items-center justify-center rounded-xl border border-border bg-background text-foreground transition hover:-translate-y-0.5 hover:bg-secondary active:scale-95">{isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}</button></div>
        </div>
      </header>

      <div className="mx-auto max-w-[1380px] px-5 pb-12 pt-8 sm:px-8 sm:pt-10">
        <section className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-primary">Inventory overview <span className="px-1 text-accent">/</span> Today</p>
            <h1 className="font-serif text-4xl font-medium tracking-tight sm:text-5xl">Make every item<br className="hidden sm:block" /> count.</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">A hands-on inventory workspace for everyday Indian retail. Track your products, review the numbers, and see the JavaScript working behind the scenes.</p>
          </div>
          <a href="#add-product" className="inline-flex w-fit items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"><PackagePlus className="size-4" /> Add a product</a>
        </section>

        <section aria-label="Inventory summary" aria-live="polite" className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric icon={<CircleDollarSign className="size-4" />} label="Inventory value" value={currency(total)} note="Across all listed products" />
          <Metric icon={<Boxes className="size-4" />} label="Products" value={String(products.length).padStart(2, '0')} note="Items in your roster" />
          <Metric icon={<ArrowDownRight className="size-4" />} label="Affordable finds" value={String(affordable.length).padStart(2, '0')} note="Priced under ₹10,000" />
          <Metric icon={<TrendingUp className="size-4" />} label="After adjustments" value={currency(adjustedTotal)} note={`${Number(tax) || 0}% GST · ${Number(discount) || 0}% discount`} />
        </section>

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.8fr)]">
          <section id="inventory" className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex flex-col gap-4 border-b border-border px-5 py-5 sm:px-6">
              <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold tracking-tight">Your inventory</h2><p className="mt-1 text-xs text-muted-foreground">Products are categorized automatically by price.</p></div><div className="flex items-center gap-2"><span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">{products.length} items</span><button type="button" onClick={exportInventory} aria-label="Export inventory as CSV" title="Export CSV" className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:bg-secondary hover:text-foreground active:scale-95"><Download className="size-4" /></button><button type="button" onClick={resetInventory} aria-label="Restore sample inventory" title="Restore sample inventory" className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:bg-secondary hover:text-foreground active:scale-95"><RotateCcw className="size-4" /></button></div></div>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-1.5">{filters.map((item) => <button key={item} type="button" aria-pressed={filter === item} onClick={() => setFilter(item)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${filter === item ? 'bg-primary text-primary-foreground' : 'bg-muted/70 text-muted-foreground hover:bg-secondary hover:text-foreground'}`}>{item}</button>)}</div>
                <label className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-muted-foreground focus-within:ring-2 focus-within:ring-ring/30"><Search className="size-4" /><span className="sr-only">Search inventory</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a product" className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground sm:w-36" /></label>
              </div>
            </div>
            <div className="hidden grid-cols-[minmax(0,1fr)_110px_130px_48px] gap-3 bg-muted/50 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.13em] text-muted-foreground sm:grid"><span>Product</span><span>Category</span><span className="text-right">Price</span><span /></div>
            <div className="divide-y divide-border">
              {visibleProducts.map((product) => <ProductRow key={product.id} product={product} onRemove={removeProduct} />)}
              {visibleProducts.length === 0 && <div className="px-6 py-12 text-center"><div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-xl bg-secondary text-primary"><Search className="size-4" /></div><p className="text-sm font-semibold">Nothing matches just yet</p><p className="mt-1 text-xs text-muted-foreground">Try another search or clear your filters.</p><button onClick={() => { setQuery(''); setFilter('All items') }} className="mt-3 text-xs font-semibold text-primary hover:underline">Clear filters</button></div>}
            </div>
            <div className="flex items-center justify-between border-t border-border bg-muted/30 px-5 py-3 text-xs text-muted-foreground sm:px-6"><span>Showing {visibleProducts.length} of {products.length} products</span><span className="font-mono">filter() · live</span></div>
          </section>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
            <section id="add-product" className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary">Quick entry</p><h2 className="mt-1 text-lg font-semibold tracking-tight">Add to your shelf</h2></div><span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-primary"><PackagePlus className="size-4" /></span></div>
              <form onSubmit={addProduct} className="space-y-3.5">
                <label className="block text-xs font-semibold">Product name<input required maxLength={60} value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. boAt Airdopes 141" className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm font-normal outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20" /></label>
                <label className="block text-xs font-semibold">Unit price <span className="font-normal text-muted-foreground">(INR)</span><div className="mt-1.5 flex items-center rounded-lg border border-input bg-background px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/20"><span className="text-sm text-muted-foreground">₹</span><input required type="number" min="0.01" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="0.00" className="w-full bg-transparent px-2 py-2.5 text-sm outline-none" /></div></label>
                <div className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2.5"><span className="text-xs text-muted-foreground">Auto-assigned category</span>{Number.isFinite(Number(price)) && Number(price) > 0 ? <CategoryBadge category={getCategory(Number(price))} /> : <span className="text-xs text-muted-foreground">Enter a price</span>}</div>
                <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition duration-200 hover:brightness-110 active:scale-[0.98]"><PackagePlus className="size-4" /> Add product</button>
              </form>
              <p className="mt-3 text-center text-[11px] leading-5 text-muted-foreground">Try the example: <button type="button" onClick={() => { setName('Amul Taaza Milk 1L'); setPrice('72') }} className="font-semibold text-primary hover:underline">Amul Taaza Milk · ₹72</button></p>
              <button type="button" onClick={addProductWithPrompt} className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:border-primary/40 hover:bg-secondary hover:text-foreground active:scale-[0.98]">Or try the JavaScript prompt() demo</button>
            </section>

            <section id="analytics" className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary">Financial analytics</p><h2 className="mt-1 text-lg font-semibold tracking-tight">A quick forecast</h2></div><TrendingUp className="size-4 text-primary" /></div>
              <div className="mb-4 rounded-xl bg-primary p-4 text-primary-foreground"><p className="text-xs text-primary-foreground/75">Adjusted inventory total</p><p className="mt-1 font-serif text-3xl">{currency(adjustedTotal)}</p><p className="mt-1 text-[11px] text-primary-foreground/75">Based on {currency(total)} product value</p></div>
              <div className="grid grid-cols-2 gap-3"><label className="text-xs font-semibold text-muted-foreground">GST rate %<input aria-label="GST rate percentage" type="number" min="0" max="100" step="0.1" value={tax} onChange={(event) => setTax(event.target.value)} className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-ring/20" /></label><label className="text-xs font-semibold text-muted-foreground">Discount %<input aria-label="Discount percentage" type="number" min="0" max="100" step="0.1" value={discount} onChange={(event) => setDiscount(event.target.value)} className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-ring/20" /></label></div>
              <div className="mt-4 border-t border-border pt-3 text-xs"><div className="flex justify-between py-1.5 text-muted-foreground"><span>Tax added</span><span>{currency(total * ((Number(tax) || 0) / 100))}</span></div><div className="flex justify-between py-1.5 text-muted-foreground"><span>Discount saved</span><span>{currency(total * ((Number(discount) || 0) / 100))}</span></div></div>
            </section>
          </div>
        </div>

        <section className="mt-5 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"><div className="mb-4 flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary">Price mix</p><h2 className="mt-1 text-base font-semibold">Category breakdown</h2></div><span className="text-[11px] text-muted-foreground">switch()</span></div><div className="space-y-4">{(['Budget', 'Standard', 'Premium']).map((category) => <div key={category} className="flex items-center gap-3"><CategoryBadge category={category} /><progress aria-label={`${category} products`} className="h-1.5 flex-1 overflow-hidden rounded-full accent-primary" max={Math.max(products.length, 1)} value={counts(category)} /><span className="w-6 text-right text-xs font-semibold tabular-nums">{counts(category)}</span></div>)}</div><p className="mt-5 rounded-lg bg-muted/60 px-3 py-2.5 text-xs leading-5 text-muted-foreground">{firstPremium ? <><span className="font-semibold text-foreground">{firstPremium.name}</span> is your first premium item. Premium starts above ₹50,000.</> : 'No premium products yet — items over ₹50,000 will appear here.'}</p></div>
          <div className="overflow-hidden rounded-2xl border border-console-background bg-console-background text-console-foreground shadow-sm"><div className="flex items-center justify-between border-b border-console-foreground/10 px-5 py-4 sm:px-6"><div className="flex items-center gap-2"><Code2 className="size-4 text-console-accent" /><h2 className="text-sm font-semibold">The JavaScript, in plain sight</h2></div><span className="rounded-full bg-console-foreground/10 px-2 py-1 font-mono text-[10px] text-console-muted">console.log()</span></div><div className="space-y-3 px-5 py-4 font-mono text-[11px] leading-5 sm:px-6"><p className="text-console-accent">--- Initializing Inventory System ---</p><p className="break-all text-console-muted">{lastPrompt}</p><p className="pt-1 text-console-accent">--- Processing Inventory Roster (forEach) ---</p><div className="space-y-1.5">{roster.map((line, index) => <p key={`${products[index]?.id ?? index}-line`} className="text-console-foreground">{line}</p>)}</div><p className="pt-1 text-console-accent">--- Financial Analytics ---</p><p>Total Inventory Value: <span className="text-console-accent">{currency(total)}</span></p><p>Affordable Items (&lt;$200): <span className="break-words text-console-accent">[{affordable.map((item) => `"${item.name}"`).join(', ')}]</span></p><p>Formatted Report: <span className="break-words text-console-accent">[{report.map((item) => `"${item}"`).join(', ')}]</span></p></div><div className="flex flex-wrap items-center justify-between gap-3 border-t border-console-foreground/10 px-5 py-3 sm:px-6"><div className="flex gap-1.5"><span className="rounded bg-console-foreground/10 px-2 py-1 font-mono text-[10px] text-console-foreground">filter()</span><span className="rounded bg-console-foreground/10 px-2 py-1 font-mono text-[10px] text-console-foreground">map()</span></div><button onClick={copyReport} className="inline-flex items-center gap-1.5 text-xs font-semibold text-console-accent transition hover:brightness-125 active:scale-95"><Copy className="size-3.5" /> Copy report</button></div></div>
        </section>
        <footer className="mt-7 flex flex-col justify-between gap-2 border-t border-border pt-4 text-[11px] text-muted-foreground sm:flex-row sm:items-center"><span>A friendly inventory workspace made with care.</span><span className="font-mono">Made by Aniket Singh</span></footer>
      </div>
    </main>
  )
}

/** @param {{ icon: import('react').ReactNode, label: string, value: string, note: string }} props */
function Metric({ icon, label, value, note }) {
  return <article className="rounded-2xl border border-border bg-card p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-center justify-between"><span className="text-xs font-medium text-muted-foreground">{label}</span><span className="flex size-8 items-center justify-center rounded-lg bg-secondary text-primary">{icon}</span></div><p className="mt-3 font-serif text-3xl tracking-tight tabular-nums">{value}</p><p className="mt-1 text-[11px] text-muted-foreground">{note}</p></article>
}

/** @param {{ category: Category }} props */
function CategoryBadge({ category }) {
  /** @type {Record<Category, string>} */
  const styles = {
    Budget: 'bg-secondary text-secondary-foreground',
    Standard: 'bg-chart-3/15 text-chart-3',
    Premium: 'bg-accent/35 text-accent-foreground',
  }
  return <span className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${styles[category]}`}>{category}</span>
}

/** @param {{ product: Product, onRemove: (product: Product) => void }} props */
function ProductRow({ product, onRemove }) {
  return <article className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-4 transition-colors hover:bg-muted/40 sm:grid-cols-[minmax(0,1fr)_110px_130px_48px] sm:px-6"><div className="flex min-w-0 items-center gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary"><Boxes className="size-4" /></span><div className="min-w-0"><p className="truncate text-sm font-semibold">{product.name}</p><p className="text-[11px] text-muted-foreground sm:hidden">{product.category} · {currency(product.price)}</p><p className="hidden text-[11px] text-muted-foreground sm:block">Inventory item</p></div></div><div className="hidden sm:block"><CategoryBadge category={product.category} /></div><p className="hidden text-right text-sm font-semibold tabular-nums sm:block">{currency(product.price)}</p><button type="button" aria-label={`Remove ${product.name}`} onClick={() => onRemove(product)} className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive active:scale-95"><Trash2 className="size-4" /></button></article>
}
