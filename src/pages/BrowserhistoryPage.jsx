import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { devicesMax } from "../styles/breakpoint";
import {
  useGetHistory,
  useClearHistory,
  useDeleteMultipleHistoryItems,
} from "../hooks/useBrowserhistory";
import DeleteModal from "../components/Modal/DeleteModal";
import RatingStars from "../components/RatingStars";

const BrowserHistoryPage = () => {
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
  const clearAll = useClearHistory();
  const deleteMultipleItems = useDeleteMultipleHistoryItems();

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
    console.log("Deleting selected items:", selectedItems);
    if (deletionType === "selected") {
      deleteMultipleItems.mutate(selectedItems, {
        onSuccess: () => setSelectedItems([]),
        onError: (error) => {
          console.error("Deletion error:", error);
          alert(`Failed to delete items: ${error.message}`);
        },
        onSettled: () => setShowDeleteModal(false),
      });
    } else if (deletionType === "all") {
      clearAll.mutate(undefined, {
        onSuccess: () => setSelectedItems([]),
        onError: (error) => {
          console.error("Clear all error:", error);
          alert(`Failed to clear history: ${error.message}`);
        },
        onSettled: () => {
          setShowDeleteModal(false);
          setDeletionType(null);
        },
      });
    }
  };

  // Clear all history

  if (isLoading) {
    return (
      <LoadingContainer>
        <Spinner />
        <LoadingText>Loading your browsing history...</LoadingText>
      </LoadingContainer>
    );
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
      {deleteMultipleItems.isLoading && (
        <DeletingOverlay>
          <Spinner />
          <DeletingText>
            {deletionType === "selected"
              ? `Deleting ${selectedItems.length} items...`
              : "Clearing all history..."}
          </DeletingText>
        </DeletingOverlay>
      )}

      <Header>
        <Title>Recently Viewed</Title>
        <Subtitle>Your browsing history of products and sellers</Subtitle>
      </Header>

      <Controls>
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="Search products or sellers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <SearchIcon>🔍</SearchIcon>
        </SearchContainer>

        <Filters>
          <TypeFilter>
            <FilterButton
              active={activeFilter === "all"}
              onClick={() => setActiveFilter("all")}
            >
              All
            </FilterButton>
            <FilterButton
              active={activeFilter === "product"}
              onClick={() => setActiveFilter("product")}
            >
              Products
            </FilterButton>
            <FilterButton
              active={activeFilter === "seller"}
              onClick={() => setActiveFilter("seller")}
            >
              Sellers
            </FilterButton>
          </TypeFilter>

          <ActionButtons>
            {selectedItems.length > 0 && (
              <DeleteButton onClick={() => showDeleteConfirmation("selected")}>
                Delete {selectedItems.length} selected
              </DeleteButton>
            )}
            <ClearButton onClick={() => showDeleteConfirmation("all")}>
              Clear all history
            </ClearButton>
          </ActionButtons>
        </Filters>
      </Controls>

      {/* Empty States */}
      {historyItems.length === 0 ? (
        <EmptyState>
          <EmptyIcon>🕒</EmptyIcon>
          <EmptyTitle>No browsing history</EmptyTitle>
          <EmptyText>You haven't viewed any products or sellers yet</EmptyText>
        </EmptyState>
      ) : filteredHistory.length === 0 ? (
        <EmptyState>
          <EmptyIcon>🔍</EmptyIcon>
          <EmptyTitle>No matching items</EmptyTitle>
          <EmptyText>Try changing your search or filter</EmptyText>
        </EmptyState>
      ) : (
        <HistoryContainer>
          {Object.entries(groupedHistory).map(([date, items]) => (
            <HistoryGroup key={date}>
              <GroupHeader>{date}</GroupHeader>
              <HistoryList>
                {items.map((item) => (
                  <HistoryItem
                    key={item.id}
                    selected={selectedItems.includes(item.id)}
                  >
                    <ItemSelect>
                      <Checkbox
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleItemSelection(item.id)}
                      />
                    </ItemSelect>

                    <ItemImage>
                      <img src={item.image} alt={item.name} />
                    </ItemImage>

                    <ItemDetails>
                      <ItemType>
                        {item.type === "product" ? "Product" : "Seller"}
                      </ItemType>
                      <ItemName>{item.name}</ItemName>

                      {item.type === "product" ? (
                        <>
                          <ItemCategory>{item.category}</ItemCategory>
                          <ItemPrice>
                            {item.currency} {item.price.toLocaleString()}
                          </ItemPrice>
                          <ItemSeller>Seller: {item.seller}</ItemSeller>
                        </>
                      ) : (
                        <>
                          <ItemRating>
                            <RatingStars rating={item.rating} />
                            <span>({item.reviews} reviews)</span>
                          </ItemRating>
                          <ItemProducts>{item.products} products</ItemProducts>
                        </>
                      )}
                    </ItemDetails>

                    <ItemMeta>
                      <TimeAgo>{formatTimeSince(item.viewedAt)}</TimeAgo>
                      <ViewButton
                        onClick={() => alert(`Navigating to ${item.name}`)}
                      >
                        View Again
                      </ViewButton>
                    </ItemMeta>
                  </HistoryItem>
                ))}
              </HistoryList>
            </HistoryGroup>
          ))}

          <SelectAllRow>
            <Checkbox
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
          </SelectAllRow>
        </HistoryContainer>
      )}

      <PrivacyInfo>
        <LockIcon>🔒</LockIcon>
        <PrivacyText>
          Your browsing history is stored locally and not shared with anyone
        </PrivacyText>
      </PrivacyInfo>
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 3.2rem 2.4rem;
  position: relative;

  @media ${devicesMax.md} {
    padding: 2.4rem 1.6rem;
  }
`;

const DeletingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  gap: 1.6rem;
`;

const DeletingText = styled.span`
  font-size: 1.8rem;
  color: var(--color-grey-700);
`;

const Header = styled.div`
  margin-bottom: 3.2rem;
`;

const Title = styled.h1`
  font-size: 2.8rem;
  font-weight: 700;
  color: var(--color-grey-900);
  margin-bottom: 0.8rem;

  @media ${devicesMax.md} {
    font-size: 2.4rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.6rem;
  color: var(--color-grey-500);
`;

const Controls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 3.2rem;

  @media ${devicesMax.sm} {
    gap: 1.6rem;
  }
`;

const SearchContainer = styled.div`
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1.4rem 1.6rem 1.4rem 4.8rem;
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  font-size: 1.6rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: var(--color-brand-600);
    box-shadow: 0 0 0 2px var(--color-brand-100);
  }

  &::placeholder {
    color: var(--color-grey-400);
  }
`;

const SearchIcon = styled.span`
  position: absolute;
  left: 1.6rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.8rem;
  color: var(--color-grey-500);
`;

const Filters = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.6rem;

  @media ${devicesMax.sm} {
    flex-direction: column;
    align-items: stretch;
  }
`;

const TypeFilter = styled.div`
  display: flex;
  gap: 0.8rem;
`;

const FilterButton = styled.button`
  padding: 0.8rem 1.6rem;
  border-radius: var(--border-radius-md);
  font-size: 1.4rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background-color: ${(props) =>
    props.active ? "var(--color-brand-600)" : "var(--color-grey-100)"};
  color: ${(props) =>
    props.active ? "var(--color-white-0)" : "var(--color-grey-700)"};
  border: none;

  &:hover {
    background-color: ${(props) =>
      props.active ? "var(--color-brand-700)" : "var(--color-grey-200)"};
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1.2rem;

  @media ${devicesMax.sm} {
    width: 100%;
    justify-content: space-between;
  }
`;

const DeleteButton = styled.button`
  padding: 1rem 1.6rem;
  background-color: var(--color-red-100);
  color: var(--color-red-700);
  border: 1px solid var(--color-red-300);
  border-radius: var(--border-radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: var(--color-red-200);
    border-color: var(--color-red-400);
  }
`;

const ClearButton = styled.button`
  padding: 1rem 1.6rem;
  background-color: var(--color-grey-100);
  color: var(--color-grey-700);
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: var(--color-grey-200);
    border-color: var(--color-grey-400);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 70vh;
`;

const Spinner = styled.div`
  width: 5rem;
  height: 5rem;
  border: 4px solid var(--color-brand-100);
  border-top: 4px solid var(--color-brand-600);
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.p`
  margin-top: 2rem;
  font-size: 1.6rem;
  color: var(--color-grey-600);
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6.4rem 2.4rem;
  background-color: var(--color-white-0);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  text-align: center;
  margin-bottom: 3.2rem;
`;

const EmptyIcon = styled.div`
  font-size: 6.4rem;
  margin-bottom: 2rem;
  opacity: 0.7;
`;

const EmptyTitle = styled.h3`
  font-size: 2.4rem;
  font-weight: 600;
  color: var(--color-grey-800);
  margin-bottom: 1rem;
`;

const EmptyText = styled.p`
  font-size: 1.6rem;
  color: var(--color-grey-500);
  max-width: 40rem;
`;

const HistoryContainer = styled.div`
  background-color: var(--color-white-0);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  margin-bottom: 3.2rem;
`;

const HistoryGroup = styled.div`
  border-bottom: 1px solid var(--color-grey-200);

  &:last-child {
    border-bottom: none;
  }
`;

const GroupHeader = styled.div`
  padding: 1.6rem 2.4rem;
  background-color: var(--color-grey-50);
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-grey-700);
  border-bottom: 1px solid var(--color-grey-200);
`;

const HistoryList = styled.div``;

const HistoryItem = styled.div`
  display: grid;
  grid-template-columns: auto auto 1fr auto;
  align-items: center;
  padding: 1.6rem 2.4rem;
  gap: 2rem;
  border-bottom: 1px solid var(--color-grey-100);
  transition: background-color 0.2s;
  background-color: ${(props) =>
    props.selected ? "var(--color-brand-50)" : "transparent"};

  &:hover {
    background-color: var(--color-grey-50);
  }

  &:last-child {
    border-bottom: none;
  }

  @media ${devicesMax.md} {
    grid-template-columns: auto 1fr;
    grid-template-areas:
      "select image"
      "details details"
      "meta meta";
    gap: 1.2rem;
  }
`;

const ItemSelect = styled.div`
  @media ${devicesMax.md} {
    grid-area: select;
    align-self: start;
    padding-top: 0.8rem;
  }
`;

const Checkbox = styled.input`
  width: 1.8rem;
  height: 1.8rem;
  accent-color: var(--color-brand-600);
  cursor: pointer;
`;

const ItemImage = styled.div`
  width: 8rem;
  height: 8rem;
  border-radius: var(--border-radius-md);
  overflow: hidden;
  background-color: var(--color-grey-100);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media ${devicesMax.md} {
    grid-area: image;
    width: 6rem;
    height: 6rem;
  }
`;

const ItemDetails = styled.div`
  @media ${devicesMax.md} {
    grid-area: details;
  }
`;

const ItemType = styled.span`
  display: inline-block;
  padding: 0.3rem 0.8rem;
  background-color: var(--color-brand-100);
  color: var(--color-brand-700);
  border-radius: var(--border-radius-cir);
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.8rem;
`;

const ItemName = styled.h3`
  font-size: 1.7rem;
  font-weight: 600;
  color: var(--color-grey-800);
  margin-bottom: 0.6rem;
`;

const ItemCategory = styled.p`
  font-size: 1.4rem;
  color: var(--color-grey-600);
  margin-bottom: 0.6rem;
`;

const ItemPrice = styled.p`
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--color-green-700);
  margin-bottom: 0.6rem;
`;

const ItemSeller = styled.p`
  font-size: 1.4rem;
  color: var(--color-grey-600);
`;

const ItemRating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 0.6rem;
`;

const ItemProducts = styled.p`
  font-size: 1.4rem;
  color: var(--color-grey-600);
`;

const ItemMeta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1rem;

  @media ${devicesMax.md} {
    grid-area: meta;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
  }
`;

const TimeAgo = styled.span`
  font-size: 1.4rem;
  color: var(--color-grey-500);
`;

const ViewButton = styled.button`
  padding: 0.8rem 1.6rem;
  background-color: var(--color-brand-100);
  color: var(--color-brand-700);
  border: none;
  border-radius: var(--border-radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--color-brand-200);
  }
`;

const SelectAllRow = styled.div`
  display: flex;
  align-items: center;
  padding: 1.6rem 2.4rem;
  border-top: 1px solid var(--color-grey-200);
  background-color: var(--color-grey-50);
`;

const SelectAllLabel = styled.label`
  margin-left: 1rem;
  font-size: 1.4rem;
  color: var(--color-grey-700);
  cursor: pointer;
`;

const PrivacyInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  padding: 1.6rem;
  background-color: var(--color-grey-100);
  border-radius: var(--border-radius-md);
`;

const LockIcon = styled.span`
  font-size: 1.8rem;
`;

const PrivacyText = styled.span`
  font-size: 1.4rem;
  color: var(--color-grey-600);
`;

export default BrowserHistoryPage;
