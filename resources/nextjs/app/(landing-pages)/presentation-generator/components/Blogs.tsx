import Wrapper from '@/components/Wrapper'
import React from 'react'
import BlogsContent from './BlogsContent';

const Blogs = async () => {

    const blogs = await fetch(`${process.env.GHOST_ADMIN_URL as string}?key=${process.env.GHOST_CONTENT_API_KEY as string}&limit=3`, {
    });
    const blogsData = await blogs.json();

    return (
        <Wrapper>
            <div className="flex justify-between items-center mt-8">
                <h2 className="text-2xl font-semibold">Blogs</h2>
                <a href="/blogs" className="text-sm text-gray-500 hover:text-gray-700">View all</a>
            </div>
            <BlogsContent blogs={blogsData.posts} />
        </Wrapper>
    )
}

export default Blogs    