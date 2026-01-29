import React, { useState, useMemo } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { devicesMax } from '../../shared/styles/breakpoint';
import {
  useGetHistory,
  useClearHistory,
  useDeleteMultipleHistoryItems,
} from '../../shared/hooks/useBrowserhistory';
import DeleteModal from '../../shared/components/modals/DeleteModal';
import RatingStars from '../../shared/components/RatingStars';
import { LoadingState, ButtonSpinner, SpinnerContainer } from '../../components/loading';
import logger from '../../shared/utils/logger';
import { 
  FaSearch, 
  FaClock, 
  FaTrash, 
  FaEye, 
  FaShoppingBag, 
  FaStore, 
  FaFilter,
  FaCalendarAlt,
  FaLock,
  FaTimes,
  FaCheck
} from "react-icons/fa";

const BrowserHistoryPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedItems, setSelectedItems] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletionType, setDeletionType] = useState(null);

  // Fetch history
  const { data: history, isLoading } = useGetHistory();
  const historyData = useMemo(
    () => history?.data?.data.history || [],
    [history]
  );

  // Mutations
  const { mutate: clearAll, isPending: isClearing } = useClearHistory();
  const { mutate: deleteMultipleItems, isPending: isDeleting } = useDeleteMultipleHistoryItems();

  // Transform and filter history data
  const historyItems = useMemo(() => {
    if (!historyData) return [];
    return historyData.map((item) => ({
      id: item._id,
      type: item.type,
      name: item.itemData.name,
      image: item.itemData.image,
      viewedAt: item.viewedAt,
      ...(item.type === "product"
        ? {
            price: item.itemData.price,
            currency: item.itemData.currency,
            category: item.itemData.category,
            seller: item.itemData.seller,
          }
        : {
            rating: item.itemData.rating,
            reviews: item.itemData.reviews,
            products: item.itemData.products,
          }),
    }));
  }, [historyData]);

  // Filter history
  const filteredHistory = useMemo(
    () =>
      historyItems.filter((item) => {
        const matchesSearch = item.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        return activeFilter === "all"
          ? matchesSearch
          : matchesSearch && item.type === activeFilter;
      }),
    [historyItems, searchQuery, activeFilter]
  );

  // Group history by date
  const groupedHistory = useMemo(() => {
    const grouped = {};
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    filteredHistory.forEach((item) => {
      const date = new Date(item.viewedAt);
      let dateLabel;

      if (date.toDateString() === today.toDateString()) {
        dateLabel = "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateLabel = "Yesterday";
      } else {
        dateLabel = date.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }

      if (!grouped[dateLabel]) grouped[dateLabel] = [];
      grouped[dateLabel].push(item);
    });

    return grouped;
  }, [filteredHistory]);

  // Format time since view
  const formatTimeSince = (date) => {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  // Selection handlers
  const toggleItemSelection = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const selectAllItems = () => {
    setSelectedItems((prev) =>
      prev.length === filteredHistory.length
        ? []
        : filteredHistory.map((item) => item.id)
    );
  };

  // Delete handlers
  const showDeleteConfirmation = (type) => {
    if (type === "selected" && selectedItems.length === 0) {
      alert("Please select items to delete");
      return;
    }
    setDeletionType(type);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirmed = () => {
    // Deleting selected items
    if (deletionType === "selected") {
      deleteMultipleItems(selectedItems, {
        onSuccess: () => setSelectedItems([]),
        onError: (error) => {
          logger.error("Deletion error:", error);
          alert(`Failed to delete items: ${error.message}`);
        },
        onSettled: () => setShowDeleteModal(false),
      });
    } else if (deletionType === "all") {
      clearAll(undefined, {
        onSuccess: () => setSelectedItems([]),
        onError: (error) => {
          logger.error("Clear all error:", error);
          alert(`Failed to clear history: ${error.message}`);
        },
        onSettled: () => {
          setShowDeleteModal(false);
          setDeletionType(null);
        },
      });
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading your browsing history..." />;
  }

  return (
    <PageContainer>
      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletionType(null);
        }}
        onConfirm={handleDeleteConfirmed}
        itemCount={
          deletionType === "selected"
            ? selectedItems.length
            : historyItems.length
        }
        title={
          deletionType === "selected"
            ? "Delete Selected Items"
            : "Clear All History"
        }
        message={
          deletionType === "selected"
            ? `Are you sure you want to delete ${selectedItems.length} selected items?`
            : "Are you sure you want to clear your entire browsing history?"
        }
        warning={
          deletionType === "selected"
            ? "This action cannot be undone and will permanently remove these items."
            : "This will permanently remove all items from your browsing history and cannot be undone."
        }
      />

      {/* Deletion Loading Overlay */}
      {(isDeleting || isClearing) && (
        <SpinnerContainer $fullScreen>
          <LoadingState 
            message={
              deletionType === "selected"
                ? `Deleting ${selectedItems.length} items...`
                : "Clearing all history..."
            }
          />
        </SpinnerContainer>
      )}

      <HeaderSection>
        <HeaderContent>
          <TitleSection>
            <Title>Browsing History</Title>
            <Subtitle>Recently viewed products and sellers</Subtitle>
          </TitleSection>
          
          <StatsCard>
            <StatItem>
              <StatValue>{historyItems.length}</StatValue>
              <StatLabel>Total Items</StatLabel>
            </StatItem>
            <StatDivider />
            <StatItem>
              <StatValue>{filteredHistory.length}</StatValue>
              <StatLabel>Filtered</StatLabel>
            </StatItem>
          </StatsCard>
        </HeaderContent>
      </HeaderSection>

      <ContentSection>
        <ControlsSection>
          <SearchContainer>
            <SearchInput
              type="text"
              placeholder="Search products or sellers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <SearchIcon>
              <FaSearch />
            </SearchIcon>
            {searchQuery && (
              <ClearSearch onClick={() => setSearchQuery("")}>
                <FaTimes />
              </ClearSearch>
            )}
          </SearchContainer>

          <FiltersContainer>
            <FilterGroup>
              <FilterLabel>
                <FaFilter />
                Filter by:
              </FilterLabel>
              <TypeFilter>
                <FilterButton
                  active={activeFilter === "all"}
                  onClick={() => setActiveFilter("all")}
                >
                  All Items
                </FilterButton>
                <FilterButton
                  active={activeFilter === "product"}
                  onClick={() => setActiveFilter("product")}
                >
                  <FaShoppingBag />
                  Products
                </FilterButton>
                <FilterButton
                  active={activeFilter === "seller"}
                  onClick={() => setActiveFilter("seller")}
                >
                  <FaStore />
                  Sellers
                </FilterButton>
              </TypeFilter>
            </FilterGroup>

            <ActionGroup>
              {selectedItems.length > 0 && (
                <DeleteSelectedButton onClick={() => showDeleteConfirmation("selected")}>
                  <FaTrash />
                  Delete {selectedItems.length} Selected
                </DeleteSelectedButton>
              )}
              <ClearAllButton onClick={() => showDeleteConfirmation("all")}>
                <FaTrash />
                Clear All History
              </ClearAllButton>
            </ActionGroup>
          </FiltersContainer>
        </ControlsSection>

        {/* Empty States */}
        {historyItems.length === 0 ? (
          <EmptyState>
            <EmptyIllustration>
              <FaClock />
            </EmptyIllustration>
            <EmptyContent>
              <EmptyTitle>No Browsing History</EmptyTitle>
              <EmptyMessage>
                You haven't viewed any products or sellers yet. Start browsing to see your history here.
              </EmptyMessage>
              <BrowseButton onClick={() => window.location.href = '/products'}>
                Start Browsing
              </BrowseButton>
            </EmptyContent>
          </EmptyState>
        ) : filteredHistory.length === 0 ? (
          <EmptyState>
            <EmptyIllustration>
              <FaSearch />
            </EmptyIllustration>
            <EmptyContent>
              <EmptyTitle>No Matching Items</EmptyTitle>
              <EmptyMessage>
                No items match your current search or filter criteria. Try adjusting your search terms or filters.
              </EmptyMessage>
              <ClearFiltersButton onClick={() => { setSearchQuery(""); setActiveFilter("all"); }}>
                Clear Filters
              </ClearFiltersButton>
            </EmptyContent>
          </EmptyState>
        ) : (
          <HistoryContent>
            {Object.entries(groupedHistory).map(([date, items]) => (
              <HistoryGroup key={date}>
                <GroupHeader>
                  <CalendarIcon>
                    <FaCalendarAlt />
                  </CalendarIcon>
                  <GroupTitle>{date}</GroupTitle>
                  <GroupCount>{items.length} items</GroupCount>
                </GroupHeader>
                
                <HistoryGrid>
                  {items.map((item) => (
                    <HistoryCard
                      key={item.id}
                      selected={selectedItems.includes(item.id)}
                    >
                      <CardHeader>
                        <ItemTypeBadge $type={item.type}>
                          {item.type === "product" ? <FaShoppingBag /> : <FaStore />}
                          {item.type === "product" ? "Product" : "Seller"}
                        </ItemTypeBadge>
                        <SelectionToggle
                          selected={selectedItems.includes(item.id)}
                          onClick={() => toggleItemSelection(item.id)}
                        >
                          {selectedItems.includes(item.id) ? <FaCheck /> : <div />}
                        </SelectionToggle>
                      </CardHeader>

                      <CardContent>
                        <ItemImage>
                          <img src={item.image} alt={item.name} />
                        </ItemImage>
                        
                        <ItemInfo>
                          <ItemName>{item.name}</ItemName>
                          
                          {item.type === "product" ? (
                            <ProductDetails>
                              <ItemCategory>{item.category}</ItemCategory>
                              <ItemPrice>
                                {item.currency} {item.price.toLocaleString()}
                              </ItemPrice>
                              <ItemSeller>Seller: {item.seller}</ItemSeller>
                            </ProductDetails>
                          ) : (
                            <SellerDetails>
                              <ItemRating>
                                <RatingStars rating={item.rating} />
                                <RatingText>({item.reviews} reviews)</RatingText>
                              </ItemRating>
                              <ItemProducts>{item.products} products</ItemProducts>
                            </SellerDetails>
                          )}
                        </ItemInfo>
                      </CardContent>

                      <CardFooter>
                        <TimeAgo>
                          <FaClock />
                          {formatTimeSince(item.viewedAt)}
                        </TimeAgo>
                        <ViewButton
                          onClick={() => {
                            if (item.type === 'product' && item.productId) {
                              navigate(`/products/${item.productId}`);
                            } else if (item.type === 'seller' && item.sellerId) {
                              navigate(`/seller/${item.sellerId}`);
                            } else {
                              // Fallback: try to navigate using item ID
                              const itemId = item.productId || item.sellerId || item.id;
                              if (itemId) {
                                navigate(`/${item.type}s/${itemId}`);
                              } else {
                                toast.info('Unable to navigate to this item');
                              }
                            }
                          }}
                        >
                          <FaEye />
                          View Again
                        </ViewButton>
                      </CardFooter>
                    </HistoryCard>
                  ))}
                </HistoryGrid>
              </HistoryGroup>
            ))}

            <SelectionFooter>
              <SelectAllContainer>
                <SelectAllCheckbox
                  type="checkbox"
                  checked={
                    selectedItems.length === filteredHistory.length &&
                    filteredHistory.length > 0
                  }
                  onChange={selectAllItems}
                  id="select-all"
                />
                <SelectAllLabel htmlFor="select-all">
                  {selectedItems.length > 0
                    ? `Selected ${selectedItems.length} of ${filteredHistory.length} items`
                    : `Select all ${filteredHistory.length} items`}
                </SelectAllLabel>
              </SelectAllContainer>
              
              {selectedItems.length > 0 && (
                <SelectedActions>
                  <SelectedCount>
                    {selectedItems.length} items selected
                  </SelectedCount>
                  <DeleteSelectedSmall onClick={() => showDeleteConfirmation("selected")}>
                    <FaTrash />
                    Delete Selected
                  </DeleteSelectedSmall>
                </SelectedActions>
              )}
            </SelectionFooter>
          </HistoryContent>
        )}

        <PrivacySection>
          <PrivacyContent>
            <LockIcon>
              <FaLock />
            </LockIcon>
            <PrivacyText>
              Your browsing history is private and stored locally. We never share your activity with third parties.
            </PrivacyText>
          </PrivacyContent>
        </PrivacySection>
      </ContentSection>
    </PageContainer>
  );
};

// Modern Styled Components
const PageContainer = styled.div`
  max-width: 120rem;
  margin: 0 auto;
  padding: 2.4rem;

  @media ${devicesMax.md} {
    padding: 1.6rem;
  }
`;

const HeaderSection = styled.section`
  margin-bottom: 3.2rem;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2.4rem;

  @media ${devicesMax.lg} {
    flex-direction: column;
    gap: 2rem;
  }
`;

const TitleSection = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 3.2rem;
  font-weight: 800;
  color: var(--color-grey-900);
  margin-bottom: 0.8rem;
  background: linear-gradient(135deg, var(--color-grey-900) 0%, var(--color-grey-700) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media ${devicesMax.md} {
    font-size: 2.8rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.6rem;
  color: var(--color-grey-600);
  max-width: 50rem;
`;

const StatsCard = styled.div`
  display: flex;
  background: var(--color-white-0);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--color-grey-100);
  min-width: 25rem;

  @media ${devicesMax.sm} {
    min-width: auto;
    width: 100%;
  }
`;

const StatItem = styled.div`
  flex: 1;
  text-align: center;
  padding: 0 1.2rem;
`;

const StatValue = styled.div`
  font-size: 2.4rem;
  font-weight: 800;
  color: var(--color-primary-600);
  line-height: 1;
`;

const StatLabel = styled.div`
  font-size: 1.2rem;
  color: var(--color-grey-600);
  margin-top: 0.4rem;
  font-weight: 500;
`;

const StatDivider = styled.div`
  width: 1px;
  background: var(--color-grey-200);
  margin: 0.4rem 0;
`;

const ContentSection = styled.section`
  background: var(--color-white-0);
  border-radius: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--color-grey-100);
  overflow: hidden;
`;

const ControlsSection = styled.div`
  padding: 3.2rem;
  border-bottom: 1px solid var(--color-grey-200);

  @media ${devicesMax.md} {
    padding: 2.4rem;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 2.4rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1.4rem 5rem 1.4rem 5rem;
  border: 1px solid var(--color-grey-300);
  border-radius: 12px;
  font-size: 1.6rem;
  background: var(--color-grey-50);
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    background: var(--color-white-0);
  }

  &::placeholder {
    color: var(--color-grey-400);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 1.6rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-grey-500);
  font-size: 1.6rem;
`;

const ClearSearch = styled.button`
  position: absolute;
  right: 1.6rem;
  top: 50%;
  transform: translateY(-50%);
  background: var(--color-grey-300);
  border: none;
  border-radius: 50%;
  width: 2.4rem;
  height: 2.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-grey-600);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--color-grey-400);
  }
`;

const FiltersContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 2rem;

  @media ${devicesMax.sm} {
    flex-direction: column;
    align-items: stretch;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 1.6rem;

  @media ${devicesMax.sm} {
    flex-direction: column;
    align-items: stretch;
  }
`;

const FilterLabel = styled.span`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--color-grey-700);
  white-space: nowrap;

  svg {
    color: var(--color-grey-500);
  }
`;

const TypeFilter = styled.div`
  display: flex;
  gap: 0.8rem;

  @media ${devicesMax.sm} {
    justify-content: center;
  }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.8rem 1.6rem;
  border-radius: 8px;
  font-size: 1.4rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.active ? 'var(--color-primary-500)' : 'var(--color-grey-100)'};
  color: ${props => props.active ? 'var(--color-white-0)' : 'var(--color-grey-700)'};
  border: none;

  &:hover {
    background: ${props => props.active ? 'var(--color-primary-600)' : 'var(--color-grey-200)'};
    transform: translateY(-1px);
  }

  svg {
    font-size: 1.2rem;
  }
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 1.2rem;

  @media ${devicesMax.sm} {
    justify-content: center;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem 1.6rem;
  border-radius: 8px;
  font-size: 1.4rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;

  &:hover {
    transform: translateY(-1px);
  }

  svg {
    font-size: 1.4rem;
  }
`;

const DeleteSelectedButton = styled(ActionButton)`
  background: var(--color-red-100);
  color: var(--color-red-700);

  &:hover {
    background: var(--color-red-200);
  }
`;

const ClearAllButton = styled(ActionButton)`
  background: var(--color-grey-100);
  color: var(--color-grey-700);

  &:hover {
    background: var(--color-grey-200);
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6.4rem 2.4rem;
  text-align: center;
`;

const EmptyIllustration = styled.div`
  width: 12rem;
  height: 12rem;
  background: linear-gradient(135deg, var(--color-grey-100) 0%, var(--color-grey-200) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4.8rem;
  color: var(--color-grey-400);
  margin-bottom: 2.4rem;
`;

const EmptyContent = styled.div`
  max-width: 50rem;
`;

const EmptyTitle = styled.h3`
  font-size: 2.4rem;
  font-weight: 700;
  color: var(--color-grey-900);
  margin-bottom: 0.8rem;
`;

const EmptyMessage = styled.p`
  font-size: 1.6rem;
  color: var(--color-grey-600);
  margin-bottom: 3.2rem;
  line-height: 1.5;
`;

const ActionButtonBase = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1.2rem 2.4rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
`;

const BrowseButton = styled(ActionButtonBase)`
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%);
  color: var(--color-white-0);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(99, 102, 241, 0.3);
  }
`;

const ClearFiltersButton = styled(ActionButtonBase)`
  background: var(--color-white-0);
  color: var(--color-grey-700);
  border: 1px solid var(--color-grey-300);

  &:hover {
    background: var(--color-grey-50);
    border-color: var(--color-grey-400);
  }
`;

const HistoryContent = styled.div`
  padding: 0;
`;

const HistoryGroup = styled.div`
  padding: 3.2rem;
  border-bottom: 1px solid var(--color-grey-200);

  &:last-child {
    border-bottom: none;
  }

  @media ${devicesMax.md} {
    padding: 2.4rem;
  }
`;

const GroupHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  margin-bottom: 2.4rem;
  padding-bottom: 1.6rem;
  border-bottom: 1px solid var(--color-grey-200);
`;

const CalendarIcon = styled.div`
  width: 4rem;
  height: 4rem;
  background: var(--color-primary-100);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary-600);
  font-size: 1.6rem;
`;

const GroupTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-grey-900);
  flex: 1;
`;

const GroupCount = styled.span`
  font-size: 1.4rem;
  color: var(--color-grey-500);
  background: var(--color-grey-100);
  padding: 0.4rem 1.2rem;
  border-radius: 20px;
  font-weight: 500;
`;

const HistoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;

  @media ${devicesMax.sm} {
    grid-template-columns: 1fr;
  }
`;

const HistoryCard = styled.div`
  background: var(--color-white-0);
  border: 2px solid ${props => props.selected ? 'var(--color-primary-200)' : 'var(--color-grey-200)'};
  border-radius: 16px;
  padding: 2rem;
  transition: all 0.3s ease;
  position: relative;
  background: ${props => props.selected ? 'var(--color-primary-50)' : 'var(--color-white-0)'};

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
    border-color: ${props => props.selected ? 'var(--color-primary-300)' : 'var(--color-primary-200)'};
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.6rem;
`;

const ItemTypeBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 1.2rem;
  background: ${props => props.$type === 'product' ? 'var(--color-green-100)' : 'var(--color-blue-100)'};
  color: ${props => props.$type === 'product' ? 'var(--color-green-700)' : 'var(--color-blue-700)'};
  border-radius: 20px;
  font-size: 1.2rem;
  font-weight: 600;

  svg {
    font-size: 1.2rem;
  }
`;

const SelectionToggle = styled.div`
  width: 2.4rem;
  height: 2.4rem;
  border: 2px solid ${props => props.selected ? 'var(--color-primary-500)' : 'var(--color-grey-300)'};
  border-radius: 6px;
  background: ${props => props.selected ? 'var(--color-primary-500)' : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white-0);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1.2rem;

  &:hover {
    border-color: var(--color-primary-500);
  }
`;

const CardContent = styled.div`
  display: flex;
  gap: 1.6rem;
  margin-bottom: 1.6rem;
`;

const ItemImage = styled.div`
  width: 8rem;
  height: 8rem;
  border-radius: 12px;
  overflow: hidden;
  background: var(--color-grey-100);
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ItemInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ItemName = styled.h3`
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-grey-900);
  margin-bottom: 0.8rem;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProductDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const SellerDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const ItemCategory = styled.span`
  font-size: 1.2rem;
  color: var(--color-grey-500);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
`;

const ItemPrice = styled.span`
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--color-green-600);
`;

const ItemSeller = styled.span`
  font-size: 1.3rem;
  color: var(--color-grey-600);
`;

const ItemRating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const RatingText = styled.span`
  font-size: 1.2rem;
  color: var(--color-grey-500);
`;

const ItemProducts = styled.span`
  font-size: 1.3rem;
  color: var(--color-grey-600);
  font-weight: 500;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1.6rem;
  border-top: 1px solid var(--color-grey-200);
`;

const TimeAgo = styled.span`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.2rem;
  color: var(--color-grey-500);

  svg {
    font-size: 1.2rem;
  }
`;

const ViewButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.8rem 1.2rem;
  background: var(--color-primary-100);
  color: var(--color-primary-700);
  border: none;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--color-primary-200);
    transform: translateY(-1px);
  }

  svg {
    font-size: 1.2rem;
  }
`;

const SelectionFooter = styled.div`
  padding: 2.4rem 3.2rem;
  border-top: 1px solid var(--color-grey-200);
  background: var(--color-grey-50);
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media ${devicesMax.sm} {
    flex-direction: column;
    gap: 1.6rem;
    align-items: stretch;
  }
`;

const SelectAllContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
`;

const SelectAllCheckbox = styled.input`
  width: 2rem;
  height: 2rem;
  border-radius: 6px;
  cursor: pointer;
`;

const SelectAllLabel = styled.label`
  font-size: 1.4rem;
  color: var(--color-grey-700);
  cursor: pointer;
  font-weight: 500;
`;

const SelectedActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1.6rem;
`;

const SelectedCount = styled.span`
  font-size: 1.4rem;
  color: var(--color-grey-600);
  font-weight: 500;
`;

const DeleteSelectedSmall = styled.button`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.8rem 1.6rem;
  background: var(--color-red-100);
  color: var(--color-red-700);
  border: none;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--color-red-200);
  }

  svg {
    font-size: 1.2rem;
  }
`;

const PrivacySection = styled.div`
  padding: 2.4rem 3.2rem;
  background: var(--color-grey-50);
  border-top: 1px solid var(--color-grey-200);
`;

const PrivacyContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.2rem;
  max-width: 60rem;
  margin: 0 auto;
`;

const LockIcon = styled.div`
  color: var(--color-grey-500);
  font-size: 1.6rem;
`;

const PrivacyText = styled.span`
  font-size: 1.4rem;
  color: var(--color-grey-600);
  text-align: center;
`;

export default BrowserHistoryPage;