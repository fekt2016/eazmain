import { useId } from "react";
import styled from "styled-components";
import { spin } from "../styles/animations";
import { FaSearch, FaSpinner } from "react-icons/fa";
import { PrimaryButton } from './ui/Buttons';
import { escapeForDisplay } from '../utils/searchUtils.jsx';
import { getOptimizedImageUrl, IMAGE_SLOTS } from "../utils/cloudinaryConfig";

export default function HeaderSearchBar({
  searchTerm,
  setSearchTerm,
  searchSuggestions,
  handleSearchKeyDown,
  showSearchSuggestions,
  setShowSearchSuggestions,
  setActiveSuggestion,
  activeSuggestion,
  isSearchProductsLoading,
  isSearchSuggestionsError,
  navigate,
  handleSuggestionSelect,
  type,
  searchRef,
}) {
  const uniqueId = useId();
  const listboxId = `search-suggestions-${type}-${uniqueId}`;
  const getOptionId = (index) => `suggestion-${type}-${uniqueId}-${index}`;

  return (
    <SearchContainer ref={searchRef} type={type}>
      <SearchBar>
        <SearchInput
          type="text"
          role="combobox"
          aria-expanded={showSearchSuggestions}
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-activedescendant={
            showSearchSuggestions && activeSuggestion >= 0
              ? getOptionId(activeSuggestion)
              : undefined
          }
          placeholder="Search for products..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowSearchSuggestions(true);
            setActiveSuggestion(0);
          }}
          onFocus={() => setShowSearchSuggestions(true)}
          onKeyDown={handleSearchKeyDown}
        />
        <StyledSearchButton
          as={PrimaryButton}
          $size="sm"
          onClick={() => {
            if (searchTerm) {
              navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
              setShowSearchSuggestions(false);
            }
          }}
          aria-label="Search products"
        >
          {isSearchProductsLoading ? (
            <SpinnerIcon>
              <FaSpinner aria-hidden="true" />
            </SpinnerIcon>
          ) : (
            <FaSearch />
          )}
        </StyledSearchButton>
      </SearchBar>

      {showSearchSuggestions && searchSuggestions.length > 0 && (
        <SearchSuggestions id={listboxId} role="listbox" aria-label="Search suggestions">
          {searchSuggestions.map((suggestion, index) => {
            return (
              <SuggestionItem
                key={`${suggestion.type}-${suggestion.text}-${index}`}
                id={getOptionId(index)}
                role="option"
                aria-selected={index === activeSuggestion}
                active={index === activeSuggestion}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSuggestionSelect(suggestion);
                }}
              >
                {suggestion.image && (
                  <SuggestionImage>
                    <img src={getOptimizedImageUrl(suggestion.image, IMAGE_SLOTS.TABLE_THUMB)} alt={suggestion.text ? `${suggestion.text} – Saiisai Ghana` : 'Saiisai Ghana product'} />
                  </SuggestionImage>
                )}
                <SuggestionText>
                  <SuggestionName>{suggestion.text}</SuggestionName>
                  <SuggestionDetails>
                    <SuggestionCategory>
                      {suggestion.type === 'product' && 'Product'}
                      {suggestion.type === 'category' && 'Category'}
                      {suggestion.type === 'brand' && 'Brand'}
                      {suggestion.type === 'tag' && 'Tag'}
                      {suggestion.type === 'trending' && '🔥 Trending'}
                      {suggestion.type === 'seller' && '🏪 Store'}
                      {suggestion.type === 'recent' && '⏱️ Recent'}
                    </SuggestionCategory>
                    {suggestion.price && (
                      <SuggestionPrice>₵{suggestion.price.toFixed(2)}</SuggestionPrice>
                    )}
                  </SuggestionDetails>
                </SuggestionText>
              </SuggestionItem>
            );
          })}
        </SearchSuggestions>
      )}

      {showSearchSuggestions &&
        searchTerm &&
        isSearchSuggestionsError &&
        !isSearchProductsLoading && (
          <ErrorSuggestions aria-live="polite" role="status">
            Search suggestions are temporarily unavailable. Press Enter to
            search anyway.
          </ErrorSuggestions>
        )}

      {showSearchSuggestions &&
        searchTerm &&
        searchSuggestions.length === 0 &&
        !isSearchSuggestionsError &&
        !isSearchProductsLoading && (
          <NoSuggestions aria-live="polite" role="status">No products found for "{escapeForDisplay(searchTerm)}"</NoSuggestions>
        )}

      {isSearchProductsLoading && (
        <LoadingSuggestions aria-live="polite" role="status">
          <SpinnerIcon>
            <FaSpinner aria-hidden="true" />
          </SpinnerIcon>
          Searching products...
        </LoadingSuggestions>
      )}
    </SearchContainer>
  );
}
const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  z-index: 100; /* Ensure dropdown can appear above other elements */

  /* Desktop only */
  ${(props) =>
    props.type === "main" &&
    `
    @media (max-width: 76.8rem) {
      display: none;
    }
  `}

  /* Mobile & Tablet only */
  ${(props) =>
    props.type === "mobile" &&
    `
    display: none;
    @media (max-width: 76.8rem) {
      display: block;
      width: 100%;
      max-width: 100%;
    }
  `}
`;

const SearchSuggestions = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--color-white-0);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  box-shadow: var(--shadow-lg);
  margin-top: -2px;
  max-height: 30rem;
  overflow-y: auto;
  z-index: 1001; /* Higher than header z-index (1000) */
  padding: var(--space-sm) 0;
  border: 2px solid var(--color-primary-500);
  border-top: none;
`;

const SuggestionItem = styled.li`
  display: flex;
  align-items: center;
  padding: 1.2rem 1.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
  background-color: ${(props) => (props.active ? "var(--color-grey-50)" : "transparent")};

  &:hover {
    background-color: var(--color-white-0);
  }
`;

// const SuggestionImage = styled.div`
//   width: 4rem;
//   height: 4rem;
//   border-radius: 50%;
//   overflow: hidden;
//   margin-right: 1.5rem;
//   flex-shrink: 0;

//   img {
//     width: 100%;
//     height: 100%;
//     object-fit: cover;
//   }
// `;

const SuggestionImage = styled.div`
  width: 4rem;
  height: 4rem;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 1.5rem;
  flex-shrink: 0;
  background: var(--color-grey-100);
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const SuggestionText = styled.div`
  flex: 1;
  min-width: 0;
`;

const SuggestionName = styled.div`
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 1.4rem;
  color: var(--color-text-dark);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SuggestionDetails = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
`;

const SuggestionCategory = styled.div`
  font-size: 1.2rem;
  color: var(--color-grey-400);
  text-transform: capitalize;
`;

const SuggestionPrice = styled.div`
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--color-primary-500);
`;

const NoSuggestions = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--color-white-0);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  box-shadow: var(--shadow-md);
  margin-top: 2px;
  padding: var(--space-lg);
  text-align: center;
  color: var(--color-grey-400);
  z-index: 1001; /* Higher than header z-index */
  border: 2px solid var(--color-primary-50);
  border-top: none;
`;

const ErrorSuggestions = styled(NoSuggestions)`
  color: var(--color-red-600, #dc2626);
  border: 2px solid var(--color-red-200, #fecaca);
  border-top: none;
`;

const SearchBar = styled.div`
  display: flex;
  width: 100%;
  min-width: 0; /* Allow flex container to shrink */
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 0; /* Allow input to shrink */
  padding: 8px 18px;
  border: 2px solid var(--color-grey-200);
  border-radius: 3rem 0 0 3rem;
  font-size: var(--text-base);
  outline: none;
  transition: all var(--transition-base);

  &:focus {
    border-color: var(--color-primary-500);
  }
`;

const StyledSearchButton = styled(PrimaryButton)`
  border-radius: 0 3rem 3rem 0 !important;
  padding: 0 2.5rem !important;
`;

// Using spin from unified animations

const SpinnerIcon = styled.span`
  animation: ${spin} 1s linear infinite;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoadingSuggestions = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--color-white-0);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  box-shadow: var(--shadow-md);
  margin-top: -2px;
  padding: var(--space-lg);
  text-align: center;
  color: var(--color-grey-400);
  z-index: 1001; /* Higher than header z-index */
  border: 2px solid var(--color-primary-500);
  border-top: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
`;
