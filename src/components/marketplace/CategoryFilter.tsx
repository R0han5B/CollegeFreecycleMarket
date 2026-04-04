'use client';

import { Button } from '@/components/ui/button';
import type { Category } from '@/types';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selectedCategory === null ? 'default' : 'outline'}
        onClick={() => onSelectCategory(null)}
        className={selectedCategory === null ? 'bg-orange-500 hover:bg-orange-600' : ''}
      >
        All Categories
      </Button>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? 'default' : 'outline'}
          onClick={() => onSelectCategory(category.id)}
          className={
            selectedCategory === category.id ? 'bg-orange-500 hover:bg-orange-600' : ''
          }
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
}
