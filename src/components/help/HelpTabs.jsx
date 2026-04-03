import styled from 'styled-components';
import { devicesMax } from '../../shared/styles/breakpoint';

const PillContainer = styled.div`
  display: flex;
  gap: 4px;
  background: var(--color-grey-100);
  border-radius: 14px;
  padding: 5px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin-bottom: 28px;
  flex-wrap: wrap;

  &::-webkit-scrollbar { display: none; }

  @media ${devicesMax.sm} {
    border-radius: 10px;
    padding: 4px;
    gap: 3px;
  }
`;

const PillTab = styled.button`
  flex-shrink: 0;
  padding: 1rem 1.8rem;
  border: none;
  border-radius: 1rem;
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  background: ${({ $active }) => ($active ? '#fff' : 'transparent')};
  color: ${({ $active }) => ($active ? 'var(--color-primary-700)' : 'var(--color-grey-500)')};
  box-shadow: ${({ $active }) => ($active ? '0 1px 4px rgba(0,0,0,0.10)' : 'none')};

  &:hover {
    background: ${({ $active }) => ($active ? '#fff' : 'var(--color-grey-200)')};
    color: ${({ $active }) => ($active ? 'var(--color-primary-700)' : 'var(--color-grey-700)')};
  }

  @media ${devicesMax.sm} {
    padding: 0.8rem 1.2rem;
    font-size: var(--font-size-sm);
  }
`;

const HelpTabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <PillContainer role="tablist">
      {tabs.map((tab, index) => (
        <PillTab
          key={index}
          $active={activeTab === index}
          onClick={() => onTabChange(index)}
          role="tab"
          type="button"
          aria-selected={activeTab === index}
          aria-controls={`tabpanel-${index}`}
        >
          {tab}
        </PillTab>
      ))}
    </PillContainer>
  );
};

export default HelpTabs;
