'use client'

import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileNavOpen])

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-100 text-slate-950 lg:flex">
      <Sidebar
        mobileOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />
      <div className="min-w-0 flex-1">
        <Navbar onMenuClick={() => setMobileNavOpen(true)} />
        <main className="mx-auto flex w-full max-w-[1500px] flex-1 flex-col gap-5 px-3 py-4 sm:gap-6 sm:px-6 sm:py-5 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}
