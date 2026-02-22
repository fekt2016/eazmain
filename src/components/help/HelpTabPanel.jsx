import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import HelpQAItem from './HelpQAItem';
import { devicesMax } from '../../shared/styles/breakpoint';

const PanelContainer = styled(motion.div)`
  width: 100%;
  min-height: 200px;
`;

const PanelContent = styled.div`
  padding: var(--spacing-md) 0;
  
  @media ${devicesMax.sm} {
    padding: var(--spacing-sm) 0;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: var(--spacing-3xl);
  color: var(--color-grey-500);
  font-size: var(--font-size-base);
  
  @media ${devicesMax.sm} {
    padding: var(--spacing-xl);
    font-size: var(--font-size-sm);
  }
`;

const HelpTabPanel = ({ isActive, items, searchTerm = '' }) => {
  if (!isActive) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <PanelContainer
          key="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          role="tabpanel"
        >
          <PanelContent>
            {items && items.length > 0 ? (
              items.map((item, index) => (
                <HelpQAItem key={index} question={item.q} answer={item.a} />
              ))
            ) : (
              <EmptyState>
                {searchTerm 
                  ? "No results found. Try adjusting your search terms."
                  : "No questions available in this category."}
              </EmptyState>
            )}
          </PanelContent>
        </PanelContainer>
      )}
    </AnimatePresence>
  );
};

export default HelpTabPanel;

