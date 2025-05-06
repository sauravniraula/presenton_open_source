"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import Image from "next/image"
import Link from "next/link"

interface Blog {
  id: string
  title: string
  excerpt: string
  feature_image: string
  feature_image_alt: string | null
  published_at: string
  reading_time: number
  url: string
}

export default function BlogsContent({ blogs }: { blogs: Blog[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 mb-10">
      {blogs.map((blog) => (
        <Link href={blog.url} key={blog.id} target="_blank" rel="noopener noreferrer">
          <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="p-0">
              <div className="relative aspect-[16/9]">
                <Image
                  src={blog.feature_image}
                  alt={blog.feature_image_alt || blog.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <h2 className="text-xl font-semibold line-clamp-2 mb-2">
                {blog.title}
              </h2>
              <p className="text-muted-foreground text-sm line-clamp-3">
                {blog.excerpt}
              </p>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between text-sm text-muted-foreground">
              <span>{formatDistanceToNow(new Date(blog.published_at))} ago</span>
              <span>{blog.reading_time} min read</span>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  )
}