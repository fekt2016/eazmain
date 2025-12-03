import styled from 'styled-components';
import { useState } from 'react';

const TabsContainer = styled.div`
  width: 100%;
`;

const TabList = styled.div`
  display: flex;
  border-bottom: 1px solid var(--color-grey-200);
  margin-bottom: var(--space-md);
`;

const Tab = styled.button`
  padding: var(--space-md) var(--space-lg);
  background: none;
  border: none;
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--color-grey-500);
  cursor: pointer;
  transition: color var(--transition-base), border-bottom var(--transition-base);
  border-bottom: 2px solid transparent;

  ${({ active }) => active && css`
    color: var(--color-primary-500);
    border-bottom-color: var(--color-primary-500);
  `}

  &:hover:not(:disabled) {
    color: var(--color-primary-400);
  }

  &:disabled {
    color: var(--color-grey-300);
    cursor: not-allowed;
  }

  &:not(:last-child) {
    margin-right: var(--space-sm);
  }

  @media ${devicesMax.sm} {
    padding: var(--space-sm) var(--space-md);
    font-size: var(--text-sm);
  }
`;

const TabPanel = styled.div`
  display: ${({ active }) => active ? 'block' : 'none'};
  animation: fadeIn 0.3s ease;
`;

const Tabs = ({ children, defaultIndex = 0 }) => {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);

  const tabs = React.Children.toArray(children).filter(child => child.type === Tab);
  const panels = React.Children.toArray(children).filter(child => child.type === TabPanel);

  return (
    <TabsContainer>
      <TabList role="tablist">
        {tabs.map((tab, index) => (
          <Tab
            key={index}
            active={activeIndex === index}
            onClick={() => setActiveIndex(index)}
            role="tab"
            aria-selected={activeIndex === index}
          >
            {tab.props.children}
          </Tab>
        ))}
      </TabList>
      {panels.map((panel, index) => (
        <TabPanel
          key={index}
          active={activeIndex === index}
          role="tabpanel"
          aria-labelledby={`tab-${index}`}
        >
          {panel.props.children}
        </TabPanel>
      ))}
    </TabsContainer>
  );
};

export default Tabs;
export { Tab, TabPanel };
