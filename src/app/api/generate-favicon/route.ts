import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const zai = await ZAI.create();

    // Generate a favicon related to College Freecycling Market
    const response = await zai.images.generations.create({
      prompt: 'Simple minimalist logo featuring a recycling symbol combined with a shopping bag, orange and green color scheme, clean modern design, suitable for college marketplace, white background, high quality, professional logo design',
      size: '1024x1024'
    });

    const imageBase64 = response.data[0].base64;
    const buffer = Buffer.from(imageBase64, 'base64');

    // Save as favicon in public folder
    const outputPath = path.join(process.cwd(), 'public', 'favicon.png');
    fs.writeFileSync(outputPath, buffer);

    return NextResponse.json({
      success: true,
      message: 'Favicon generated successfully',
      path: '/favicon.png'
    });
  } catch (error: any) {
    console.error('Favicon generation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate favicon' },
      { status: 500 }
    );
  }
}
