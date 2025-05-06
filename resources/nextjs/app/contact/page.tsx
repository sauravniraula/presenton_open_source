import { Metadata } from 'next'
import ContactPage from './ContactPage'

export const metadata: Metadata = {
    title: 'Contact Presenton | AI Presentation Generator Support',
    description: 'Have questions about AI-powered presentations? Contact our team for support. Transform your data into stunning visuals with Presenton.ai. Get in touch!',
}

const page = () => {
    return (
        <ContactPage />
    )
}

export default page