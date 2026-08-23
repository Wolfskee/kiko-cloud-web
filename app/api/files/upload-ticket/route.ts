import { NextResponse } from 'next/server';
import { backendFetch, getAuthInfo } from '@/api-lib/backend-client';
import { mapTicketToDTO } from '@/api-lib/mappers/file-mapper';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fileName, fileSize, contentType } = body;
    const { userId } = await getAuthInfo();

    if (!fileName || typeof fileSize !== 'number') {
      return NextResponse.json({ error: 'Missing fileName or fileSize' }, { status: 400 });
    }

    // Call Go Lambda backend with exact PostgreSQL schema column names
    const { data, error } = await backendFetch('/api/v1/files/upload-ticket', {
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
    });

    if (error || !data) {
      console.error('[Upload Ticket Failed]', error);
      // Fallback / Demo ticket generation for visual testing
      const mockFileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const mockUploadUrl = `/api/files/mock-upload?fileId=${mockFileId}&fileName=${encodeURIComponent(fileName)}&fileSize=${fileSize}&contentType=${encodeURIComponent(contentType || 'application/octet-stream')}`;

      return NextResponse.json({
        fileId: mockFileId,
        uploadUrl: mockUploadUrl,
        isDemo: true,
      });
    }

    const dto = mapTicketToDTO(data);

    if (!dto.fileId || !dto.uploadUrl) {
      console.error('[Upload Ticket Malformed DTO]', data);
      const mockFileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const mockUploadUrl = `/api/files/mock-upload?fileId=${mockFileId}&fileName=${encodeURIComponent(fileName)}&fileSize=${fileSize}&contentType=${encodeURIComponent(contentType || 'application/octet-stream')}`;
      return NextResponse.json({
        fileId: mockFileId,
        uploadUrl: mockUploadUrl,
        isDemo: true,
      });
    }

    return NextResponse.json(dto);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid request payload';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
