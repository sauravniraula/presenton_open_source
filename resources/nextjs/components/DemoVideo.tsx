import React from 'react'

const DemoVideo = () => {
    return (
        <div className='max-w-7xl mx-auto my-6'>
            <h2 className="text-2xl font-bold mb-4">Walkthrough Video</h2>

            <div style={{ position: 'relative', paddingBottom: 'calc(49.087353324641455% + 41px)', height: 0, width: '100%' }}>
                <iframe
                    src="https://demo.arcade.software/GtZCpJoTpHXeKXeccLQL?embed&embed_mobile=tab&embed_desktop=inline&show_copy_link=true"
                    title="Present for me"

                    loading="lazy"
                    allowFullScreen
                    allow="clipboard-write"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', colorScheme: 'light' }}
                />
            </div>
        </div>)
}

export default DemoVideo
