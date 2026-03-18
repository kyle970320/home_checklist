import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import HomePage from './pages/HomePage'
import DetailPage from './pages/DetailPage'
import './index.css'
import { ThemeProvider } from './theme'
import { initializeTheme } from './theme-storage'

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/:id', element: <DetailPage /> },
])

initializeTheme()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>,
)

