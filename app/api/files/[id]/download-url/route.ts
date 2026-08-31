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

  const { data, error, status } = await backendFetch<{ download_url?: string; downloadUrl?: string }>(
    `/api/v1/files/${id}/download-url`,
    {},
    request
  );

  if (error || !data) {
    console.error(`[Download URL Failed] status ${status}:`, error);
    return NextResponse.json({ error: error || 'Failed to fetch download URL' }, { status: status || 500 });
  }

  return NextResponse.json({
    downloadUrl: data.download_url || data.downloadUrl || '',
  });
}
