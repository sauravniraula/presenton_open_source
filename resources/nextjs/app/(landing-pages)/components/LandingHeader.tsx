import React from 'react'

const LandingHeader = () => {

    return (
        <header className="bg-white px-10 py-4  text-center border-b flex justify-between items-center border-gray-300">
            <div>
                <a href="/">
                    <img src="/Logo.png" alt="Logo" className=" max-w-full mx-auto" />
                </a>
            </div>
            <div className="flex  items-center gap-4">
                <a href="/auth/login">

                    <button className="  px-4 py-2 rounded-md text-lg hover:bg-gray-200 duration-300">Login</button>
                </a>
                <a href="/auth/Login">
                    <button className="bg-gradient-to-r from-[#b077f0] to-[#7100ea] text-white px-6 shadow-xl font-semibold py-2 rounded-full
                 duration-300
                 ">Try for free</button>
                </a>
            </div>
        </header>
    )
}

export default LandingHeader
