import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import { config } from 'dotenv';
config({ path: '.env.local' });

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadVideo() {
    console.log('☁️  Uploading video to Cloudinary...');

    // Path to the local video
    const videoPath = path.join(process.cwd(), 'public', 'assets', 'images', 'banner1.mp4');

    try {
        const result = await cloudinary.uploader.upload(videoPath, {
            public_id: 'hero_banner_video',
            folder: 'bismi-broilers',
            overwrite: true,
            resource_type: 'video', // Important for videos
        });

        console.log('✅ Video Upload successful!');
        console.log('   Public ID:', result.public_id);
        console.log('   URL:', result.secure_url);

    } catch (error) {
        console.error('❌ Upload failed:', error);
    }
}

uploadVideo();
