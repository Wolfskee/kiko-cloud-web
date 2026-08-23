import { NextResponse } from 'next/server';
import { DEMO_FILES, updateDemoFiles } from '../route';

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get('fileId');
  const fileName = searchParams.get('fileName');
  const fileSize = Number(searchParams.get('fileSize') || 0);
  const contentType = searchParams.get('contentType') || 'application/octet-stream';

  if (fileId && fileName) {
    updateDemoFiles((prev) => [
      {
        id: fileId,
        name: fileName,
        size: fileSize,
        contentType,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  }

  return new NextResponse('OK', { status: 200 });
}
