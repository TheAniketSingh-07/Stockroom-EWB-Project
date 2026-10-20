import { createClient } from '@blinkdotnew/sdk'

export const blink = createClient({
  projectId: import.meta.env.VITE_BLINK_PROJECT_ID || 'inventory-insights-dashboard-qhwyubw6',
  publishableKey: import.meta.env.VITE_BLINK_PUBLISHABLE_KEY || 'blnk_pk_n31FY5g0uEW5v2wbYBXoKSiM-6plCjpW',
  authRequired: false,
  auth: { mode: 'managed' },
})
