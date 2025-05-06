import SignUpPage from './SignUpPage'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Sign Up | Presenton AI Presentation',
    description: 'Transform your data into presentations with Presenton\'s AI- powered generator.Create presentations in minutes, no design skills needed.Sign up now for free!',
}

const page = () => {
    return (
        <SignUpPage />
    )
}

export default page