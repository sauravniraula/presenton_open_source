import { writeFile } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { srtContent } = await request.json();
        
        // Generate unique filename
        const filename = `subtitle-${Date.now()}.srt`;
        const publicPath = join(process.cwd(), 'public', filename);
        
        // Write the file
        await writeFile(publicPath, srtContent);
        
        return NextResponse.json({ localPath: filename });
    } catch (error) {
        console.error('Error saving subtitle:', error);
        return NextResponse.json(
            { error: 'Failed to save subtitle' },
            { status: 500 }
        );
    }
} 