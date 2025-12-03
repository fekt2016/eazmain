import { useRef } from "react";
import styled from "styled-components";
import { spin } from "../styles/animations";
import { FaSearch, FaSpinner } from "react-icons/fa";
import { PrimaryButton } from './ui/Buttons';

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
  navigate,
  handleSuggestionSelect,
  type,
}) {
  const searchRef = useRef(null);

  return (
    <SearchContainer ref={searchRef} type={type}>
      <SearchBar>
        <SearchInput
          type="text"
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
        >
          {isSearchProductsLoading ? (
            <SpinnerIcon>
              <FaSpinner />
            </SpinnerIcon>
          ) : (
            <FaSearch />
          )}
        </StyledSearchButton>
      </SearchBar>

      {showSearchSuggestions && searchSuggestions.length > 0 && (
        <SearchSuggestions>
          {searchSuggestions.map((suggestion, index) => {
            return (
              <SuggestionItem
                key={`${suggestion.type}-${suggestion.text}-${index}`}
                active={index === activeSuggestion}
                onClick={() => handleSuggestionSelect(suggestion)}
              >
                {suggestion.image && (
                  <SuggestionImage>
                    <img src={suggestion.image} alt={suggestion.text} />
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
        searchSuggestions.length === 0 &&
        !isSearchProductsLoading && (
          <NoSuggestions>No products found for "{searchTerm}"</NoSuggestions>
        )}

      {isSearchProductsLoading && (
        <LoadingSuggestions>
          <SpinnerIcon>
            <FaSpinner />
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
  margin: 0 2rem;

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
      margin: 0;
    }
  `}
`;

const SearchSuggestions = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--color-white-0);
  border-radius: 0 0 8px 8px;
  box-shadow: 0 5px 1.5rem rgba(0, 0, 0, 0.1);
  margin-top: -2px;
  max-height: 30rem;
  overflow-y: auto;
  z-index: 1000;
  padding: 1rem 0;
  border: 2px solid var(--primary-500);
  border-top: none;
`;

const SuggestionItem = styled.li`
  display: flex;
  align-items: center;
  padding: 1.2rem 1.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
  background-color: ${(props) => (props.active ? "#f8f9fc" : "transparent")};

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
  border-radius: 0 0 8px 8px;
  box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.1);
  margin-top: 2px;
  padding: 2rem;
  text-align: center;
  color: var(--color-grey-400);
  z-index: 1000;
  border: 2px solid var(--color-primary-50);
  border-top: none;
`;

const SearchBar = styled.div`
  display: flex;
  width: 100%;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 18px;
  border: 2px solid var(--color-grey-200);
  border-radius: 3rem 0 0 3rem;
  font-size: 1.5rem;
  outline: none;
  transition: all 0.3s;

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
  border-radius: 0 0 8px 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  margin-top: -2px;
  padding: 2rem;
  text-align: center;
  color: var(--color-grey-400);
  z-index: 1000;
  border: 2px solid var(--color-primary-500);
  border-top: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;
