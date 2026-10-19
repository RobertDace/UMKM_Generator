import { NextResponse } from 'next/server';
import { generateSiteWithGemini } from '@/lib/gemini';
import { UMKMCategory } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = (body.prompt || '').trim();
    const category = body.category as UMKMCategory | undefined;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt tidak boleh kosong' }, { status: 400 });
    }

    const site = await generateSiteWithGemini(prompt, category);
    return NextResponse.json({ success: true, site });
  } catch (error: any) {
    console.error('API /api/generate error:', error);
    return NextResponse.json(
      { error: error?.message || 'Gagal memproses AI website' },
      { status: 500 }
    );
  }
}
