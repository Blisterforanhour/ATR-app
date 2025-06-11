import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

// Set up API auth token from Supabase session
import { supabase } from './lib/supabase'
import { setApiAuthToken } from './lib/aws'

// Get session and set API token
supabase.auth.getSession().then(({ data: { session } }) => {
  if (session?.access_token) {
    setApiAuthToken(session.access_token)
  }
})

// Listen for auth changes to update API token
supabase.auth.onAuthStateChange((event, session) => {
  if (session?.access_token) {
    setApiAuthToken(session.access_token)
  } else {
    setApiAuthToken('')
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)