"use client"

import { login } from "@/lib/auth"

export default function SignInPage() {
    return (
        <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg mx-4">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2"> Welcome to PaceTools</h2>
                    <p className="text-gray-600">Sign in to save your paces</p>
                    <button onClick={
                        () => {
                            console.log("hi");
                            login();
                        }
                    } className="bg-red-200">login</button>
                </div>
            </div>
        </div>
    )
}