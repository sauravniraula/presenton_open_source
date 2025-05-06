import React from 'react'
import Header from '../../../components/homePage/header'
import Intro from './components/Intro'
import Usage from './components/Usage'
import Testimonial from './components/Testimonial'
import Pricing from './components/Pricing'
import FAQ from './components/FAQ'

import Hero from './components/Hero'
import Footer from '@/components/homePage/Footer'

const Generator = () => {
    return (
        <div>
            <Header />
            <Intro />
            <Hero />
            <Usage />
            <Testimonial />
            <Pricing />
            <FAQ />
            <Footer />
        </div>
    )
}

export default Generator    