import { NextResponse } from 'next/server';
import { backendFetch, getAuthInfo } from '@/api-lib/backend-client';
import { mapTicketToDTO } from '@/api-lib/mappers/file-mapper';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fileName, fileSize, contentType } = body;
    const { userId } = await getAuthInfo(request);

    if (!fileName || typeof fileSize !== 'number') {
      return NextResponse.json({ error: 'Missing fileName or fileSize' }, { status: 400 });
    }

    // Call Go Lambda backend with exact PostgreSQL schema column names matching backend spec
    const { data, error, status } = await backendFetch(
      '/api/v1/files/upload-ticket',
      {
        method: 'POST',
        body: JSON.stringify({
          original_name: fileName,
          file_name: fileName,
          fileName: fileName,
          size_bytes: fileSize,
          file_size: fileSize,
          fileSize: fileSize,
          content_type: contentType || 'application/octet-stream',
          contentType: contentType || 'application/octet-stream',
          user_id: userId || undefined,
          userId: userId || undefined,
        }),
      },
      request
    );

    if (error || !data) {
      console.error('[Upload Ticket Failed]', error);
      return NextResponse.json({ error: error || 'Failed to request upload ticket' }, { status: status || 500 });
    }

    const dto = mapTicketToDTO(data);

    if (!dto.fileId || !dto.uploadUrl) {
      console.error('[Upload Ticket Malformed DTO]', data);
      return NextResponse.json({ error: 'Malformed ticket response from Go backend' }, { status: 500 });
    }

    return NextResponse.json(dto);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid request payload';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
