import { useMemo } from 'react';
import { FaSortAmountDown, FaFilter, FaTag } from 'react-icons/fa';
import useCategory from '../../shared/hooks/useCategory';
import Select from '../ui/Select';
import styled from 'styled-components';
import { devicesMax } from '../../shared/styles/breakpoint';

const FilterBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem 1.25rem;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #ede6dc;
  box-shadow: 0 4px 24px rgba(26, 31, 46, 0.06);
  padding: 1.1rem 1.25rem;
  margin-bottom: 1.25rem;
  width: 100%;

  @media ${devicesMax.md} {
    flex-direction: column;
    align-items: stretch;
  }
`;

const FilterSection = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.65rem 1rem;
  min-width: 0;

  @media ${devicesMax.md} {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }
`;

const ToolbarLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  white-space: nowrap;

  svg {
    color: #d4882a;
    font-size: 1rem;
    flex-shrink: 0;
  }
`;

const BadgePill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.75rem;
  border-radius: 999px;
  background: rgba(212, 136, 42, 0.1);
  color: #b45309;
  font-size: 0.8rem;
  font-weight: 700;
  border: 1px solid rgba(212, 136, 42, 0.25);

  svg {
    color: #d4882a;
    font-size: 0.85rem;
  }
`;

const SelectWrapper = styled.div`
  flex: 1;
  min-width: 160px;
  max-width: 320px;

  @media ${devicesMax.md} {
    max-width: none;
    width: 100%;
  }
`;

const DealsToolbar = ({
  sortOption,
  selectedCategory,
  onSortChange,
  onCategoryChange,
}) => {
  const { getCategories } = useCategory();
  const { data: categoriesData, isLoading: isCategoriesLoading } = getCategories;

  const categories = useMemo(() => {
    if (!categoriesData) return [];
    return categoriesData?.results || categoriesData?.data?.results || [];
  }, [categoriesData]);

  const parentCategories = useMemo(() => {
    return categories.filter((cat) => !cat.parentCategory || cat.parentCategory === null);
  }, [categories]);

  return (
    <FilterBar>
      <FilterSection>
        <BadgePill>
          <FaTag aria-hidden />
          Deals only
        </BadgePill>
      </FilterSection>

      <FilterSection>
        <ToolbarLabel>
          <FaFilter aria-hidden />
          Category
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
      </FilterSection>

      <FilterSection>
        <ToolbarLabel>
          <FaSortAmountDown aria-hidden />
          Sort
        </ToolbarLabel>
        <SelectWrapper>
          <Select value={sortOption} onChange={(e) => onSortChange(e.target.value)}>
            <option value="default">Default (Best Deals)</option>
            <option value="discount-high">Discount: High to Low</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </Select>
        </SelectWrapper>
      </FilterSection>
    </FilterBar>
  );
};

export default DealsToolbar;
