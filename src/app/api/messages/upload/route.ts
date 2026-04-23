import { NextRequest, NextResponse } from 'next/server';

function getCloudinaryConfig() {
  const cloudinaryUrl = process.env.CLOUDINARY_URL;

  if (!cloudinaryUrl) {
    throw new Error('CLOUDINARY_URL is not configured');
  }

  const parsedUrl = new URL(cloudinaryUrl);
  const cloudName = parsedUrl.hostname;
  const apiKey = decodeURIComponent(parsedUrl.username);
  const apiSecret = decodeURIComponent(parsedUrl.password);

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('CLOUDINARY_URL is invalid');
  }

  return { cloudName, apiKey, apiSecret };
}

async function uploadToCloudinary(file: File, buffer: Buffer, filename: string) {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = 'college-freecycle/chat-uploads';

  const encoder = new TextEncoder();
  const dataToSign = `folder=${folder}&public_id=${filename}&timestamp=${timestamp}${apiSecret}`;
  const signatureBuffer = await crypto.subtle.digest('SHA-1', encoder.encode(dataToSign));
  const signature = Array.from(new Uint8Array(signatureBuffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

  const cloudinaryFormData = new FormData();
  cloudinaryFormData.append('file', new Blob([buffer], { type: file.type }), filename);
  cloudinaryFormData.append('api_key', apiKey);
  cloudinaryFormData.append('timestamp', String(timestamp));
  cloudinaryFormData.append('folder', folder);
  cloudinaryFormData.append('public_id', filename);
  cloudinaryFormData.append('signature', signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: cloudinaryFormData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cloudinary upload failed: ${errorText}`);
  }

  const data = await response.json();
  return data.secure_url as string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const filename = `${timestamp}-${random}`;

    // Convert file to buffer and upload to Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const cloudinaryUrl = await uploadToCloudinary(file, buffer, filename);

    return NextResponse.json({
      imageUrl: cloudinaryUrl,
      cloudinaryUrl,
    });
  } catch (error) {
    console.error('Error uploading chat image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
