import { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown } from 'react-icons/fa';
import { devicesMax } from '../../shared/styles/breakpoint';

const QAItemContainer = styled(motion.div)`
  background: var(--color-white-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-lg);
  margin-bottom: var(--spacing-md);
  overflow: hidden;
  transition: all var(--transition-base);
  
  &:hover {
    box-shadow: var(--shadow-sm);
    border-color: var(--color-grey-300);
  }
`;

const QuestionButton = styled.button`
  width: 100%;
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background-color var(--transition-base);
  
  &:hover {
    background: var(--color-grey-50);
  }
  
  @media ${devicesMax.sm} {
    padding: var(--spacing-md);
  }
`;

const QuestionText = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin: 0;
  flex: 1;
  font-family: var(--font-heading);
  line-height: 1.4;
  
  @media ${devicesMax.sm} {
    font-size: var(--font-size-base);
  }
`;

const ChevronIcon = styled(FaChevronDown)`
  font-size: var(--font-size-base);
  color: var(--color-grey-500);
  transition: transform var(--transition-base);
  flex-shrink: 0;
  margin-left: var(--spacing-md);
  
  ${({ $isOpen }) => $isOpen && `
    transform: rotate(180deg);
  `}
`;

const AnswerContainer = styled(motion.div)`
  overflow: hidden;
`;

const AnswerContent = styled.div`
  padding: 0 var(--spacing-lg) var(--spacing-lg);
  color: var(--color-grey-700);
  font-size: var(--font-size-base);
  font-family: var(--font-body);
  line-height: 1.7;
  
  @media ${devicesMax.sm} {
    padding: 0 var(--spacing-md) var(--spacing-md);
    font-size: var(--font-size-sm);
  }
`;

const HelpQAItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <QAItemContainer
      initial={false}
      animate={isOpen ? { borderColor: 'var(--color-primary-200)' } : { borderColor: 'var(--color-grey-200)' }}
    >
      <QuestionButton onClick={toggleOpen} aria-expanded={isOpen}>
        <QuestionText>{question}</QuestionText>
        <ChevronIcon $isOpen={isOpen} />
      </QuestionButton>
      <AnimatePresence>
        {isOpen && (
          <AnswerContainer
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <AnswerContent>{answer}</AnswerContent>
          </AnswerContainer>
        )}
      </AnimatePresence>
    </QAItemContainer>
  );
};

export default HelpQAItem;

