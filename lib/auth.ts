// lib/auth.ts
"use client"  // optional, indicates client-side

import { signIn, signOut } from "next-auth/react"

export const login = async () => {
    // Redirects to GitHub OAuth login
    await signIn("github", { callbackUrl: "/" })
}

export const logout = async () => {
    // Logs out and redirects to sign-in page
    await signOut({ callbackUrl: "/auth/signin" })
}