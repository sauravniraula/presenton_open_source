import React from 'react'
import LoginPage from './LoginPage'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Presenton Login | Presenton AI Presentation',
    description: 'Transform your data into stunning presentations with Presenton\'s AI generator.Log in to create professional, easy- to - understand slides in minutes.Start now.',
}

const page = () => {
    return (
        <LoginPage />
    )
}

export default page
