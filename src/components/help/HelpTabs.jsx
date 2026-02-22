import styled from 'styled-components';
import { devicesMax } from '../../shared/styles/breakpoint';

const TabsContainer = styled.div`
  width: 100%;
  margin-bottom: var(--spacing-xl);
  border-bottom: 2px solid var(--color-grey-200);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--color-grey-100);
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--color-grey-300);
    border-radius: var(--border-radius-sm);
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: var(--color-grey-400);
  }
`;

const TabsList = styled.div`
  display: flex;
  gap: var(--spacing-md);
  min-width: max-content;
  padding-bottom: var(--spacing-xs);
  
  @media ${devicesMax.sm} {
    gap: var(--spacing-sm);
    padding: 0 var(--spacing-sm);
  }
`;

const Tab = styled.button`
  padding: var(--spacing-md) var(--spacing-lg);
  background: none;
  border: none;
  font-size: var(--font-size-base);
  font-weight: var(--font-medium);
  color: var(--color-grey-600);
  cursor: pointer;
  transition: all var(--transition-base);
  border-bottom: 3px solid transparent;
  white-space: nowrap;
  position: relative;
  
  ${({ $active }) => $active && `
    color: var(--color-primary-500);
    border-bottom-color: var(--color-primary-500);
    font-weight: var(--font-semibold);
  `}
  
  &:hover:not(:disabled) {
    color: var(--color-primary-500);
    background: var(--color-primary-50);
    border-radius: var(--border-radius-sm) var(--border-radius-sm) 0 0;
  }
  
  &:disabled {
    color: var(--color-grey-300);
    cursor: not-allowed;
  }
  
  @media ${devicesMax.sm} {
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: var(--font-size-sm);
  }
`;

const HelpTabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <TabsContainer>
      <TabsList role="tablist">
        {tabs.map((tab, index) => (
          <Tab
            key={index}
            $active={activeTab === index}
            onClick={() => onTabChange(index)}
            role="tab"
            aria-selected={activeTab === index}
            aria-controls={`tabpanel-${index}`}
          >
            {tab}
          </Tab>
        ))}
      </TabsList>
    </TabsContainer>
  );
};

export default HelpTabs;

