import { NextResponse } from 'next/server';
import { backendFetch } from '@/api-lib/backend-client';
import { mapFileListToDTO, RawGoFile } from '@/api-lib/mappers/file-mapper';

// In-memory mock storage for demo / fallback mode
let DEMO_FILES = [
  {
    id: 'demo-1',
    name: 'KikoCloud_Architecture_V2.png',
    size: 2458920,
    contentType: 'image/png',
    status: 'active',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'demo-2',
    name: 'Project_Specification_2026.pdf',
    size: 5120000,
    contentType: 'application/pdf',
    status: 'active',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'demo-3',
    name: 'demo_presentation.mp4',
    size: 45200000,
    contentType: 'video/mp4',
    status: 'active',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: 'demo-4',
    name: 'system_logs.json',
    size: 142000,
    contentType: 'application/json',
    status: 'active',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

export async function GET() {
  const { data, error } = await backendFetch<RawGoFile[]>('/api/v1/files');

  if (error || !data) {
    // Return mock data for fallback/demo mode
    return NextResponse.json({ files: DEMO_FILES, isDemo: true });
  }

  const cleanedFiles = mapFileListToDTO(data);
  return NextResponse.json({ files: cleanedFiles, isDemo: false });
}

export function updateDemoFiles(updater: (prev: typeof DEMO_FILES) => typeof DEMO_FILES) {
  DEMO_FILES = updater(DEMO_FILES);
}
export { DEMO_FILES };
