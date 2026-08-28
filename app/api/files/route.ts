import { NextResponse } from 'next/server';
import { backendFetch, getAuthInfo } from '@/api-lib/backend-client';
import { mapFileListToDTO } from '@/api-lib/mappers/file-mapper';

export async function GET(request: Request) {
  try {
    const { userId } = await getAuthInfo(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: User not logged in' }, { status: 401 });
    }

    const { data, error, status } = await backendFetch<unknown>('/api/v1/files', {}, request);

    if (error || !data) {
      console.error('[BFF GET Files Failed]', error);
      return NextResponse.json({ error: error || 'Failed to fetch files from backend' }, { status: status || 500 });
    }

    const cleanFiles = mapFileListToDTO(data);
    return NextResponse.json({ files: cleanFiles });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch files';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
