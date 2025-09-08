import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FaSearch, FaSpinner } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { useSearchProducts } from "../hooks/useSearch";

export default function SearchBar() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const searchRef = useRef(null);

  // Search hook for products only
  const { data: searchProductsData, isLoading: isSearchProductsLoading } =
    useSearchProducts(debouncedSearchTerm);

  //   Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Get search results
  const searchProducts = useMemo(() => {
    return searchProductsData?.data || [];
  }, [searchProductsData]);

  //   Generate search suggestions (products only)
  const searchSuggestions = useMemo(() => {
    if (!debouncedSearchTerm) return [];

    return searchProducts
      .slice(0, 5) // Limit to 5 products
      .map((product) => ({
        type: "product",
        id: product._id,
        name: product.name,
        image: product.images?.[0] || "https://via.placeholder.com/40",
        price: product.price,
        category: product.category?.name || "Uncategorized",
      }));
  }, [debouncedSearchTerm, searchProducts]);

  //    Handle keyboard navigation for search
  const handleSearchKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestion((prev) =>
        prev < searchSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestion((prev) =>
        prev > 0 ? prev - 1 : searchSuggestions.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (searchSuggestions.length > 0 && showSearchSuggestions) {
        handleSuggestionSelect(searchSuggestions[activeSuggestion]);
      } else {
        // Navigate to search results page
        navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
        setShowSearchSuggestions(false);
      }
    } else if (e.key === "Escape") {
      setShowSearchSuggestions(false);
    }
  };
  //   Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    setSearchTerm(suggestion.name);
    setShowSearchSuggestions(false);
    navigate(`/product/${suggestion.id}`);
  };

  const handleClickOutside = useCallback((event) => {
    if (searchRef.current && !searchRef.current.contains(event.target)) {
      setShowSearchSuggestions(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);
  return (
    <SearchContainer ref={searchRef}>
      <StyledSearchBar>
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
        <SearchButton
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
        </SearchButton>
      </StyledSearchBar>

      {showSearchSuggestions && searchSuggestions.length > 0 && (
        <SearchSuggestions>
          {searchSuggestions.map((suggestion, index) => {
            console.log("Rendering suggestion:", suggestion);
            return (
              <SuggestionItem
                key={`${suggestion.type}-${suggestion.id}`}
                active={index === activeSuggestion}
                onClick={() => handleSuggestionSelect(suggestion)}
              >
                <SuggestionImage>
                  <img src={suggestion.image} alt={suggestion.name} />
                </SuggestionImage>
                <SuggestionText>
                  <SuggestionName>{suggestion.name}</SuggestionName>
                  <SuggestionDetails>
                    <SuggestionCategory>
                      {suggestion.category}
                    </SuggestionCategory>
                    <SuggestionPrice>${suggestion.price}</SuggestionPrice>
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
  flex: 1;
  max-width: 100;
  margin: 0 20px;
  /* background-color: red; */

  @media (max-width: 76.8rem) {
    /* order: -1; */
    width: 100%;
    max-width: 100%;
    margin: 0;
  }
`;

const SearchSuggestions = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--color-white-0);
  border-radius: 0 0 8px 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  margin-top: -2px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
  padding: 10px 0;
  border: 2px solid var(--primary-500);
  border-top: none;
`;

const SuggestionItem = styled.li`
  display: flex;
  align-items: center;
  padding: 12px 15px;
  cursor: pointer;
  transition: background-color 0.2s;
  background-color: ${(props) => (props.active ? "#f8f9fc" : "transparent")};

  &:hover {
    background-color: #f8f9fc;
  }
`;

const SuggestionImage = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 15px;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const SuggestionText = styled.div`
  flex: 1;
`;

const SuggestionName = styled.div`
  font-weight: 600;
  margin-bottom: 4px;
`;

const SuggestionDetails = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SuggestionCategory = styled.div`
  font-size: 12px;
  color: var(--color-grey-400);
`;

const SuggestionPrice = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #4e73df;
`;

const NoSuggestions = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  margin-top: 2px;
  padding: 20px;
  text-align: center;
  color: var(--color-grey-400);
  z-index: 1000;
  border: 2px solid var(--color-primary-50);
  border-top: none;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 18px;
  border: 2px solid var(--color-grey-200);
  border-radius: 30px 0 0 30px;
  font-size: 15px;
  outline: none;
  transition: all 0.3s;

  &:focus {
    border-color: var(--color-primary-500);
  }
`;

const SearchButton = styled.button`
  background-color: var(--color-primary-500);
  color: white;
  border: none;
  padding: 0 25px;
  border-radius: 0 30px 30px 0;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: var(--color-primary-500);
  }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

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
  background: white;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  margin-top: -2px;
  padding: 20px;
  text-align: center;
  color: #858796;
  z-index: 1000;
  border: 2px solid #4e73df;
  border-top: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const StyledSearchBar = styled.div`
  /* width: 100%; */
`;
