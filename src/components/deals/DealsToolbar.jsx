import React, { useMemo } from 'react';
import { FaSortAmountDown, FaFilter, FaTag } from 'react-icons/fa';
import useCategory from '../../shared/hooks/useCategory';
import Select from '../ui/Select';
import Toolbar, { ToolbarSection } from '../ui/Toolbar';
import styled from 'styled-components';
import { devicesMax } from '../../shared/styles/breakpoint';

const ToolbarLabel = styled.label`
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-grey-700);
  white-space: nowrap;

  svg {
    color: var(--color-grey-500);
    font-size: var(--text-base);
  }
`;

const SelectWrapper = styled.div`
  min-width: 180px;

  @media ${devicesMax.sm} {
    min-width: 100%;
  }
`;

const DealsToolbar = ({
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
    return categoriesData?.results || categoriesData?.data?.results || [];
  }, [categoriesData]);

  // Filter to parent categories only (top-level)
  const parentCategories = useMemo(() => {
    return categories.filter((cat) => !cat.parentCategory || cat.parentCategory === null);
  }, [categories]);

  return (
    <Toolbar>
      <ToolbarSection>
        <ToolbarLabel>
          <FaTag /> Deals Only
        </ToolbarLabel>
      </ToolbarSection>

      <ToolbarSection>
        <ToolbarLabel>
          <FaFilter /> Category:
        </ToolbarLabel>
        <SelectWrapper>
          <Select
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
          </Select>
        </SelectWrapper>
      </ToolbarSection>

      <ToolbarSection>
        <ToolbarLabel>
          <FaSortAmountDown /> Sort:
        </ToolbarLabel>
        <SelectWrapper>
          <Select
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="default">Default (Best Deals)</option>
            <option value="discount-high">Discount: High to Low</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </Select>
        </SelectWrapper>
      </ToolbarSection>
    </Toolbar>
  );
};

export default DealsToolbar;

