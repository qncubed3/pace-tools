import { SessionProvider } from 'next-auth/react'
//@ts-ignore
import "./globals.css"
import type { Metadata } from 'next'
import { auth } from '@/auth'


// export const metadata: Metadata = {
//     title: 'Pace Tools',
//     description: '',
// }

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {

    const session = await auth()
    return (
        <html lang="en">
            <SessionProvider session={session}>
                <body>{children}</body>
            </SessionProvider>
        </html>
    )
}