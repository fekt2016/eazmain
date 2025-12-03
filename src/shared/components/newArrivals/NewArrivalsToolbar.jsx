import React, { useMemo } from 'react';
import { FaSortAmountDown, FaFilter } from 'react-icons/fa';
import useCategory from '../../hooks/useCategory';
import {
  ToolbarContainer,
  ToolbarLeft,
  ToolbarRight,
  SortContainer,
  SortLabel,
  SortSelect,
  FilterContainer,
  FilterLabel,
  FilterSelect,
} from './newArrivals.styles';

const sortOptions = [
  { value: 'newest', label: 'Latest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'best-seller', label: 'Best Seller' },
];

const NewArrivalsToolbar = ({
  sortOption,
  selectedCategory,
  onSortChange,
  onCategoryChange,
}) => {
  // Fetch categories
  const { getCategories } = useCategory();
  const { data: categoriesData, isLoading: isCategoriesLoading } = getCategories;

  // Process categories
  const categories = useMemo(() => {
    if (!categoriesData) return [];
    // Backend returns: { status: 'success', results: [...], meta: {...} }
    return categoriesData?.results || categoriesData?.data?.results || [];
  }, [categoriesData]);

  // Filter to parent categories only
  const parentCategories = useMemo(() => {
    return categories.filter((cat) => !cat.parentCategory || cat.parentCategory === null);
  }, [categories]);

  return (
    <ToolbarContainer>
      <ToolbarLeft>
        <FilterContainer>
          <FilterLabel>
            <FaFilter /> Filter:
          </FilterLabel>
          <FilterSelect
            value={selectedCategory || ''}
            onChange={(e) => onCategoryChange(e.target.value || null)}
            disabled={isCategoriesLoading}
          >
            <option value="">All Categories</option>
            {parentCategories.map((category) => (
              <option key={category._id || category.id} value={category._id || category.id}>
                {category.name}
              </option>
            ))}
          </FilterSelect>
        </FilterContainer>
      </ToolbarLeft>
      
      <ToolbarRight>
        <SortContainer>
          <SortLabel>
            <FaSortAmountDown /> Sort:
          </SortLabel>
          <SortSelect
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value)}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SortSelect>
        </SortContainer>
      </ToolbarRight>
    </ToolbarContainer>
  );
};

export default NewArrivalsToolbar;

