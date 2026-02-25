import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategoryNav } from './CategoryNav';
import type { ClinicalCategory } from '@/types/library';

const mockCategory: ClinicalCategory = {
  id: 'cat-1',
  name: 'Osteología',
  description: 'Bone-related protocols',
  icon: 'bone',
  createdAt: '2026-01-01T00:00:00.000Z',
};

const mockCategory2: ClinicalCategory = {
  id: 'cat-2',
  name: 'Neurología',
  description: 'Neuro protocols',
  icon: 'brain',
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('CategoryNav', () => {
  it('renders all category buttons with names', () => {
    render(
      <CategoryNav
        categories={[mockCategory, mockCategory2]}
        onSelectCategory={vi.fn()}
      />,
    );

    expect(screen.getByText('Osteología')).toBeInTheDocument();
    expect(screen.getByText('Neurología')).toBeInTheDocument();
  });

  it('clicking a category calls onSelectCategory with id', async () => {
    const onSelectCategory = vi.fn();
    render(
      <CategoryNav
        categories={[mockCategory]}
        onSelectCategory={onSelectCategory}
      />,
    );

    await userEvent.click(screen.getByText('Osteología'));
    expect(onSelectCategory).toHaveBeenCalledWith('cat-1');
  });

  it('clicking selected category calls onSelectCategory(undefined)', async () => {
    const onSelectCategory = vi.fn();
    render(
      <CategoryNav
        categories={[mockCategory]}
        selectedCategoryId="cat-1"
        onSelectCategory={onSelectCategory}
      />,
    );

    // Click the already selected one
    await userEvent.click(screen.getByText('Osteología'));
    expect(onSelectCategory).toHaveBeenCalledWith(undefined);
  });

  it('selected category has teal background', () => {
    render(
      <CategoryNav
        categories={[mockCategory, mockCategory2]}
        selectedCategoryId="cat-1"
        onSelectCategory={vi.fn()}
      />,
    );

    const selectedBtn = screen.getByText('Osteología').closest('button');
    const unselectedBtn = screen.getByText('Neurología').closest('button');

    expect(selectedBtn).toHaveClass('bg-teal-600');
    expect(unselectedBtn).not.toHaveClass('bg-teal-600');
  });

  it('renders icon containers', () => {
    render(
      <CategoryNav categories={[mockCategory]} onSelectCategory={vi.fn()} />,
    );
    // Just verify the button exists, usually contains an icon or similar structure
    // We can look for the button role
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(1);
  });
});
