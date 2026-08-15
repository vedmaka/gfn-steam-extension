import { useEffect, useState } from 'react'
import HomePage from './pages/HomePage'
import PrivacyPage from './pages/PrivacyPage'

function currentPath() {
  const path = window.location.pathname.replace(/\/+$/, '')
  return path === '' ? '/' : path
}

export default function App() {
  const [path, setPath] = useState(currentPath)

  useEffect(() => {
    const onNav = () => setPath(currentPath())
    window.addEventListener('popstate', onNav)
    return () => window.removeEventListener('popstate', onNav)
  }, [])

  useEffect(() => {
    if (path === '/privacy') {
      document.title = 'Privacy Policy - GFN Checker'
    } else {
      document.title = 'GFN Checker - GeForce NOW on Steam'
    }
  }, [path])

  return (
    <div className="min-h-screen">
      {path === '/privacy' ? <PrivacyPage /> : <HomePage />}
    </div>
  )
}
