import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaSearch, FaCheck } from 'react-icons/fa';
import { useSearchNeighborhoods } from '../hooks/useNeighborhoods';

const NeighborhoodAutocomplete = ({ 
  value, 
  onChange, 
  city, 
  placeholder = "Search neighborhood...",
  onSelect,
  disabled = false 
}) => {
  const [query, setQuery] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(null);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const { data: neighborhoods = [], isLoading } = useSearchNeighborhoods(
    query,
    city,
    isOpen && query.length >= 2
  );

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setQuery(newValue);
    setIsOpen(true);
    onChange?.(e);
    
    // Clear selection if user is typing
    if (selectedNeighborhood) {
      setSelectedNeighborhood(null);
    }
  };

  const handleSelect = (neighborhood) => {
    setQuery(neighborhood.name);
    setSelectedNeighborhood(neighborhood);
    setIsOpen(false);
    onChange?.({ target: { value: neighborhood.name, name: 'area' } });
    onSelect?.(neighborhood);
  };

  const handleFocus = () => {
    if (query.length >= 2) {
      setIsOpen(true);
    }
  };

  return (
    <Wrapper ref={wrapperRef}>
      <InputWrapper>
        <SearchIcon>
          <FaSearch />
        </SearchIcon>
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
        />
        {selectedNeighborhood && (
          <SelectedIcon>
            <FaCheck />
          </SelectedIcon>
        )}
      </InputWrapper>
      
      {isOpen && query.length >= 2 && (
        <Dropdown>
          {isLoading ? (
            <DropdownItem>Searching...</DropdownItem>
          ) : neighborhoods.length === 0 ? (
            <DropdownItem $noHover>No neighborhoods found</DropdownItem>
          ) : (
            neighborhoods.map((neighborhood) => (
              <DropdownItem
                key={neighborhood._id || neighborhood.id}
                onClick={() => handleSelect(neighborhood)}
                $selected={selectedNeighborhood?._id === neighborhood._id}
              >
                <NeighborhoodName>{neighborhood.name}</NeighborhoodName>
                {neighborhood.city && (
                  <NeighborhoodCity>{neighborhood.city}</NeighborhoodCity>
                )}
                {neighborhood.assignedZone && (
                  <NeighborhoodZone>Zone {neighborhood.assignedZone}</NeighborhoodZone>
                )}
              </DropdownItem>
            ))
          )}
        </Dropdown>
      )}
    </Wrapper>
  );
};

export default NeighborhoodAutocomplete;

// Styled Components
const Wrapper = styled.div`
  position: relative;
  width: 100%;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 1rem;
  color: #6b7280;
  z-index: 1;
  pointer-events: none;
`;

const SelectedIcon = styled.div`
  position: absolute;
  right: 1rem;
  color: #10b981;
  z-index: 1;
  pointer-events: none;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1.4rem;
  transition: all 0.2s;
  background: white;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.25rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
`;

const DropdownItem = styled.div`
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${props => props.$noHover ? 'transparent' : '#f9fafb'};
  }

  ${props => props.$selected && `
    background-color: #eff6ff;
    border-left: 3px solid #667eea;
  `}

  ${props => props.$noHover && `
    cursor: default;
    color: #6b7280;
    font-style: italic;
  `}
`;

const NeighborhoodName = styled.span`
  font-weight: 600;
  font-size: 1.4rem;
  color: #111827;
`;

const NeighborhoodCity = styled.span`
  font-size: 1.2rem;
  color: #6b7280;
`;

const NeighborhoodZone = styled.span`
  font-size: 1.1rem;
  color: #667eea;
  font-weight: 500;
`;

