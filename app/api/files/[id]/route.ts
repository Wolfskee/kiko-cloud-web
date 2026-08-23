import { NextResponse } from 'next/server';
import { backendFetch } from '@/api-lib/backend-client';
import { updateDemoFiles } from '../route';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Missing file id' }, { status: 400 });
  }

  const { error } = await backendFetch(`/api/v1/files/${id}`, {
    method: 'DELETE',
  });

  // Always sync with demo store if running in fallback demo mode
  updateDemoFiles((prev) => prev.filter((item) => item.id !== id));

  if (error) {
    return NextResponse.json({ success: true, isDemo: true });
  }

  return NextResponse.json({ success: true });
}
