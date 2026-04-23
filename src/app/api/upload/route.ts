import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

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

async function uploadToCloudinary(file: File, buffer: Buffer, publicId: string) {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = 'college-freecycle/item-uploads';

  const encoder = new TextEncoder();
  const dataToSign = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  const signatureBuffer = await crypto.subtle.digest('SHA-1', encoder.encode(dataToSign));
  const signature = Array.from(new Uint8Array(signatureBuffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

  const cloudinaryFormData = new FormData();
  cloudinaryFormData.append('file', new Blob([buffer], { type: file.type }), publicId);
  cloudinaryFormData.append('api_key', apiKey);
  cloudinaryFormData.append('timestamp', String(timestamp));
  cloudinaryFormData.append('folder', folder);
  cloudinaryFormData.append('public_id', publicId);
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
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileExtension = file.name.includes('.')
      ? file.name.split('.').pop()
      : file.type.split('/')[1];
    const publicId = `${uuidv4()}${fileExtension ? `.${fileExtension}` : ''}`;
    const imageUrl = await uploadToCloudinary(file, buffer, publicId);

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
