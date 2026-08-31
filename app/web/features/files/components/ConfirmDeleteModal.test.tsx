import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { FileItem } from '../types';

const mockFile: FileItem = {
  id: 'file-123',
  name: 'test-document.pdf',
  size: 2048576,
  contentType: 'application/pdf',
  status: 'ACTIVE',
  createdAt: '2026-08-30T10:00:00Z',
  updatedAt: '2026-08-30T10:00:00Z',
};

describe('ConfirmDeleteModal component', () => {
  it('renders null when file is null', () => {
    const { container } = render(
      <ConfirmDeleteModal
        file={null}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders file information correctly in soft delete mode', () => {
    render(
      <ConfirmDeleteModal
        file={mockFile}
        mode="soft"
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText('Move to Trash')).toBeInTheDocument();
    expect(screen.getByText('test-document.pdf')).toBeInTheDocument();
  });

  it('renders permanent delete mode text correctly', () => {
    render(
      <ConfirmDeleteModal
        file={mockFile}
        mode="permanent"
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText('Permanently Delete')).toBeInTheDocument();
    expect(screen.getByText('test-document.pdf')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    const handleConfirm = vi.fn();
    render(
      <ConfirmDeleteModal
        file={mockFile}
        mode="permanent"
        onClose={vi.fn()}
        onConfirm={handleConfirm}
      />
    );

    const confirmButton = screen.getByRole('button', { name: /permanently delete/i });
    fireEvent.click(confirmButton);
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when cancel button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <ConfirmDeleteModal
        file={mockFile}
        mode="soft"
        onClose={handleClose}
        onConfirm={vi.fn()}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
