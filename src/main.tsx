import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import AdminApp from './admin/AdminApp'
import './index.css'

// Sitio de una sola página: no usamos una librería de routing porque solo
// hay dos "páginas" reales (el sitio público y el panel /admin). Se decide
// acá mismo, según la URL, cuál de las dos raíces montar.
const isAdmin = window.location.pathname.startsWith('/admin')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isAdmin ? <AdminApp /> : <App />}
  </React.StrictMode>,
)
