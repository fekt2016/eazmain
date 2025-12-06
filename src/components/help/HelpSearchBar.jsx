import { useState } from 'react';
import styled from 'styled-components';
import { FaSearch } from 'react-icons/fa';
import { devicesMax } from '../../shared/styles/breakpoint';

const SearchContainer = styled.div`
  max-width: 80rem;
  margin: 0 auto var(--spacing-2xl);
  position: relative;
  
  @media ${devicesMax.md} {
    margin-bottom: var(--spacing-xl);
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: var(--spacing-md) var(--spacing-xl) var(--spacing-md) var(--spacing-3xl);
  border: 2px solid var(--color-grey-200);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-base);
  font-family: var(--font-body);
  color: var(--color-grey-900);
  background: var(--color-white-0);
  transition: all var(--transition-base);
  outline: none;
  
  &:focus {
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px rgba(255, 196, 0, 0.1);
  }
  
  &::placeholder {
    color: var(--color-grey-400);
  }
  
  @media ${devicesMax.sm} {
    padding: var(--spacing-sm) var(--spacing-lg) var(--spacing-sm) var(--spacing-2xl);
    font-size: var(--font-size-sm);
  }
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  left: var(--spacing-md);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-grey-400);
  font-size: var(--font-size-lg);
  pointer-events: none;
  
  @media ${devicesMax.sm} {
    left: var(--spacing-sm);
    font-size: var(--font-size-base);
  }
`;

const HelpSearchBar = ({ onSearch, placeholder = "Search for help articles, FAQs, or topics..." }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <SearchContainer>
      <SearchIcon />
      <SearchInput
        type="text"
        value={searchTerm}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label="Search help center"
      />
    </SearchContainer>
  );
};

export default HelpSearchBar;

