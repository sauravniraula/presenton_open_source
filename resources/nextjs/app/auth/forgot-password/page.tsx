import React from 'react'
import ForgetPasswordPage from './ForgetPasswordPage'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Forgot Your Password | Presenton AI Presentation',
    description: 'Forgot your Presenton.ai password? Reset it securely with our simple email recovery. Create AI-powered presentations once you\'re back in.Get started now.',
}

const page = () => {
    return (
        <ForgetPasswordPage />
    )
}

export default page
