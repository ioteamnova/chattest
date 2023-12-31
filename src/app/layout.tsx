import AuthContext from '@/context/AuthContext'

import './globals.css'
import { Open_Sans } from 'next/font/google'
import SWRConfigContext from '@/context/SWRConfigContext'
import Navbar from '@/components/Navbar'

const open_Sans = Open_Sans({ subsets: ['latin'] })

export const metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={open_Sans.className}>
      <body className='w-full max-w-screenxl overflow-auto overflow-auto mx-auto'>
       <AuthContext>
        <header className='sticky top-0 bg-white z-10 border-b'>
            <Navbar/>
        </header>
        <main className='w-full flex justify-center bg-neutral-50 min-h-full'> 
          <SWRConfigContext>
           {children}
          </SWRConfigContext>
        </main>
       </AuthContext>
       </body>
    </html>
  )
}
