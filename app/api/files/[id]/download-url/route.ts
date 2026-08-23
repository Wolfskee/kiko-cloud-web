import { NextResponse } from 'next/server';
import { backendFetch } from '@/api-lib/backend-client';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Missing file id' }, { status: 400 });
  }

  const { data, error } = await backendFetch<{ download_url?: string; downloadUrl?: string }>(
    `/api/v1/files/${id}/download-url`
  );

  if (error || !data) {
    // Demo mode fallback download URL
    return NextResponse.json({
      downloadUrl: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80`,
      isDemo: true,
    });
  }

  return NextResponse.json({
    downloadUrl: data.download_url || data.downloadUrl || '',
  });
}
