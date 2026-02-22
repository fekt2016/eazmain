/* eslint-disable react/prop-types */

import React from 'react';

import styled from "styled-components";

import { FaExclamationTriangle, FaInfoCircle, FaCar } from "react-icons/fa";

import{spin, pulse, float, fadeIn} from '../../shared/styles/animations';

// Base Spinner Styles

const BaseSpinner = styled.div`

  display: inline-block;

  border-radius: 50%;

  animation: ${spin} 0.8s linear infinite;

  border: 2px solid transparent;

`;

// Primary Loading Spinner Component

export const LoadingSpinner = styled(BaseSpinner)`

  width: ${({ size = "md" }) => {

    switch (size) {

      case "sm":

        return "16px";

      case "lg":

        return "32px";

      case "xl":

        return "48px";

      default:

        return "24px";

    }

  }};

  height: ${({ size = "md" }) => {

    switch (size) {

      case "sm":

        return "16px";

      case "lg":

        return "32px";

      case "xl":

        return "48px";

      default:

        return "24px";

    }

  }};

  border-top: 2px solid var(--primary);

  border-right: 2px solid var(--primary);

  border-bottom: 2px solid var(--gray-300);

  border-left: 2px solid var(--gray-300);

`;

// Button Spinner Component - Perfect for form submissions

export const ButtonSpinner = styled(BaseSpinner)`

  width: ${({ size = "sm" }) => {

    switch (size) {

      case "sm":

        return "16px";

      case "md":

        return "20px";

      case "lg":

        return "24px";

      default:

        return "16px";

    }

  }};

  height: ${({ size = "sm" }) => {

    switch (size) {

      case "sm":

        return "16px";

      case "md":

        return "20px";

      case "lg":

        return "24px";

      default:

        return "16px";

    }

  }};

  border-top: 2px solid currentColor;

  border-right: 2px solid currentColor;

  border-bottom: 2px solid transparent;

  border-left: 2px solid transparent;

`;

// Page Load Spinner Component - For full page loading

export const PageSpinner = styled(BaseSpinner)`

  width: 60px;

  height: 60px;

  border-top: 3px solid var(--primary);

  border-right: 3px solid var(--primary);

  border-bottom: 3px solid var(--gray-200);

  border-left: 3px solid var(--gray-200);

`;

// Gradient Spinner Component - For premium features

export const GradientSpinner = styled(BaseSpinner)`

  width: ${({ size = "md" }) => {

    switch (size) {

      case "sm":

        return "20px";

      case "lg":

        return "40px";

      case "xl":

        return "60px";

      default:

        return "30px";

    }

  }};

  height: ${({ size = "md" }) => {

    switch (size) {

      case "sm":

        return "20px";

      case "lg":

        return "40px";

      case "xl":

        return "60px";

      default:

        return "30px";

    }

  }};

  background: conic-gradient(transparent, var(--gradient-primary));

  mask: radial-gradient(farthest-side, transparent calc(100% - 2px), white 0);

  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 2px), white 0);

`;

// Dots Spinner Component - For modern UI

export const DotsSpinner = styled.div`

  display: inline-flex;

  align-items: center;

  justify-content: center;

  gap: 4px;

  &::after {

    content: '';

    width: ${({ size = "sm" }) => {

      switch (size) {

        case "sm": return "3px";

        case "md": return "4px";

        case "lg": return "5px";

        default: return "3px";

      }

    }};

    height: ${({ size = "sm" }) => {

      switch (size) {

        case "sm": return "3px";

        case "md": return "4px";

        case "lg": return "5px";

        default: return "3px";

      }

    }};

    border-radius: 50%;

    background: currentColor;

    animation: ${pulse} 1.4s ease-in-out infinite both;

  }

  &::before {

    content: '';

    width: ${({ size = "sm" }) => {

      switch (size) {

        case "sm": return "3px";

        case "md": return "4px";

        case "lg": return "5px";

        default: return "3px";

      }

    }};

    height: ${({ size = "sm" }) => {

      switch (size) {

        case "sm": return "3px";

        case "md": return "4px";

        case "lg": return "5px";

        default: return "3px";

      }

    }};

    border-radius: 50%;

    background: currentColor;

    animation: ${pulse} 1.4s ease-in-out 0.2s infinite both;

    margin-right: 4px;

  }

`;

// Pulse Spinner Component - For subtle loading

export const PulseSpinner = styled.div`

  width: ${({ size = "md" }) => {

    switch (size) {

      case "sm":

        return "20px";

      case "lg":

        return "40px";

      case "xl":

        return "60px";

      default:

        return "30px";

    }

  }};

  height: ${({ size = "md" }) => {

    switch (size) {

      case "sm":

        return "20px";

      case "lg":

        return "40px";

      case "xl":

        return "60px";

      default:

        return "30px";

    }

  }};

  border-radius: 50%;

  background: var(--primary);

  animation: ${pulse} 2s infinite ease-in-out;

`;

// Dual Ring Spinner Component - Classic style

export const DualRingSpinner = styled(BaseSpinner)`

  width: ${({ size = "md" }) => {

    switch (size) {

      case "sm":

        return "20px";

      case "lg":

        return "40px";

      case "xl":

        return "60px";

      default:

        return "30px";

    }

  }};

  height: ${({ size = "md" }) => {

    switch (size) {

      case "sm":

        return "20px";

      case "lg":

        return "40px";

      case "xl":

        return "60px";

      default:

        return "30px";

    }

  }};

  

  &::after {

    content: " ";

    display: block;

    width: 100%;

    height: 100%;

    border-radius: 50%;

    border: 2px solid var(--primary);

    border-color: var(--primary) transparent var(--primary) transparent;

    animation: ${spin} 1.2s linear infinite;

  }

`;

// Circle Spinner Component - Simple outline

export const CircleSpinner = styled(BaseSpinner)`

  width: ${({ size = "md" }) => {

    switch (size) {

      case "sm":

        return "20px";

      case "lg":

        return "40px";

      case "xl":

        return "60px";

      default:

        return "30px";

    }

  }};

  height: ${({ size = "md" }) => {

    switch (size) {

      case "sm":

        return "20px";

      case "lg":

        return "40px";

      case "xl":

        return "60px";

      default:

        return "30px";

    }

  }};

  border: 2px solid var(--gray-300);

  border-top: 2px solid var(--primary);

`;

// Skeleton Loading Component

export const Skeleton = styled.div`

  background: linear-gradient(

    90deg,

    var(--gray-200) 25%,

    var(--gray-300) 50%,

    var(--gray-200) 75%

  );

  background-size: 200% 100%;

  animation: ${pulse} 2s infinite;

  border-radius: var(--radius-md);

  ${({ width = "100%" }) => `width: ${width};`}

  ${({ height = "1rem" }) => `height: ${height};`}

  ${({ circle }) => circle && "border-radius: 50%;"}

`;

// Empty State Component

export const EmptyState = ({

  icon = <FaCar />,

  title = "No data found",

  message = "There's nothing to display at the moment.",

  action,

  ...props

}) => {

  return (

    <EmptyStateWrapper {...props}>

      <EmptyStateIcon>{icon}</EmptyStateIcon>

      <EmptyStateTitle>{title}</EmptyStateTitle>

      <EmptyStateMessage>{message}</EmptyStateMessage>

      {action && <EmptyStateAction>{action}</EmptyStateAction>}

    </EmptyStateWrapper>

  );

};

const EmptyStateWrapper = styled.div`

  text-align: center;

  padding: var(--space-2xl);

  color: var(--text-muted);

  animation: ${fadeIn} var(--transition-normal) ease-out;

  max-width: 400px;

  margin: 0 auto;

`;

const EmptyStateIcon = styled.div`

  font-size: 4rem;

  margin-bottom: var(--space-lg);

  opacity: 0.5;

  animation: ${float} 3s var(--transition-bounce) infinite;

  color: var(--primary);

`;

const EmptyStateTitle = styled.h3`

  color: var(--text-secondary);

  margin-bottom: var(--space-sm);

  font-size: var(--text-xl);

  font-weight: var(--font-semibold);

`;

const EmptyStateMessage = styled.p`

  color: var(--text-muted);

  margin-bottom: var(--space-xl);

  font-size: var(--text-base);

  line-height: 1.6;

`;

const EmptyStateAction = styled.div`

  margin-top: var(--space-lg);

`;

// Error State Component

export const ErrorState = ({

  icon = <FaExclamationTriangle />,

  title = "Something went wrong",

  message = "We encountered an error while loading the data.",

  action,

  ...props

}) => {

  return (

    <ErrorStateWrapper {...props}>

      <ErrorStateIcon>{icon}</ErrorStateIcon>

      <ErrorStateTitle>{title}</ErrorStateTitle>

      <ErrorStateMessage>{message}</ErrorStateMessage>

      {action && <ErrorStateAction>{action}</ErrorStateAction>}

    </ErrorStateWrapper>

  );

};

const ErrorStateWrapper = styled(EmptyStateWrapper)`

  color: var(--error);

`;

const ErrorStateIcon = styled(EmptyStateIcon)`

  color: var(--error);

`;

const ErrorStateTitle = styled(EmptyStateTitle)`

  color: var(--error);

`;

const ErrorStateMessage = styled(EmptyStateMessage)`

  color: var(--text-secondary);

`;

const ErrorStateAction = styled(EmptyStateAction)``;

// Success State Component

export const SuccessState = ({

  icon = <FaInfoCircle />,

  title = "Success!",

  message = "The operation was completed successfully.",

  action,

  ...props

}) => {

  return (

    <SuccessStateWrapper {...props}>

      <SuccessStateIcon>{icon}</SuccessStateIcon>

      <SuccessStateTitle>{title}</SuccessStateTitle>

      <SuccessStateMessage>{message}</SuccessStateMessage>

      {action && <SuccessStateAction>{action}</SuccessStateAction>}

    </SuccessStateWrapper>

  );

};

const SuccessStateWrapper = styled(EmptyStateWrapper)`

  color: var(--success);

`;

const SuccessStateIcon = styled(EmptyStateIcon)`

  color: var(--success);

`;

const SuccessStateTitle = styled(EmptyStateTitle)`

  color: var(--success);

`;

const SuccessStateMessage = styled(EmptyStateMessage)`

  color: var(--text-secondary);

`;

const SuccessStateAction = styled(EmptyStateAction)``;

// Loading State Component - Perfect for route loading

export const LoadingState = ({

  message = "Loading...",

  size = "lg",

  spinnerType = "default",

  ...props

}) => {

  const renderSpinner = () => {

    switch (spinnerType) {

      case "dots":

        return <DotsSpinner size="lg" />;

      case "pulse":

        return <PulseSpinner size={size} />;

      case "gradient":

        return <GradientSpinner size={size} />;

      case "dual-ring":

        return <DualRingSpinner size={size} />;

      default:

        return <LoadingSpinner size={size} />;

    }

  };

  return (

    <LoadingStateWrapper {...props}>

      {renderSpinner()}

      <LoadingMessage>{message}</LoadingMessage>

    </LoadingStateWrapper>

  );

};

const LoadingStateWrapper = styled.div`

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  padding: var(--space-2xl);

  gap: var(--space-lg);

  text-align: center;

  animation: ${fadeIn} var(--transition-normal) ease-out;

  min-height: 200px;

`;

const LoadingMessage = styled.p`

  color: var(--text-secondary);

  font-size: var(--text-lg);

  font-weight: var(--font-medium);

  margin: 0;

`;

// Skeleton Grid Component

export const SkeletonGrid = ({

  count = 6,

  itemHeight = "200px",

  gap = "var(--space-md)",

  ...props

}) => {

  return (

    <SkeletonGridWrapper $gap={gap} {...props}>

      {Array.from({ length: count }, (_, index) => (

        <Skeleton key={index} height={itemHeight} />

      ))}

    </SkeletonGridWrapper>

  );

};

const SkeletonGridWrapper = styled.div`

  display: grid;

  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));

  gap: ${({ $gap }) => $gap};

  width: 100%;

`;

// Skeleton Card Component

export const SkeletonCard = ({ ...props }) => {

  return (

    <SkeletonCardWrapper {...props}>

      <Skeleton height="200px" />

      <SkeletonCardContent>

        <Skeleton width="70%" height="24px" />

        <Skeleton width="50%" height="16px" />

        <Skeleton width="90%" height="14px" />

        <Skeleton width="90%" height="14px" />

        <Skeleton width="60%" height="14px" />

        <Skeleton width="100%" height="40px" />

      </SkeletonCardContent>

    </SkeletonCardWrapper>

  );

};

const SkeletonCardWrapper = styled.div`

  background: var(--white);

  border-radius: var(--radius-xl);

  overflow: hidden;

  box-shadow: var(--shadow-sm);

  border: 1px solid var(--gray-200);

`;

const SkeletonCardContent = styled.div`

  padding: var(--space-xl);

  display: flex;

  flex-direction: column;

  gap: var(--space-sm);

`;

// Progress Bar Component

export const ProgressBar = ({

  progress = 0,

  color = "var(--primary)",

  height = "8px",

  ...props

}) => {

  return (

    <ProgressBarWrapper $height={height} {...props}>

      <ProgressBarFill $progress={progress} $color={color} />

    </ProgressBarWrapper>

  );

};

const ProgressBarWrapper = styled.div`

  width: 100%;

  height: ${({ $height }) => $height};

  background: var(--gray-200);

  border-radius: var(--radius-full);

  overflow: hidden;

`;

const ProgressBarFill = styled.div`

  height: 100%;

  width: ${({ $progress }) => `${$progress}%`};

  background: ${({ $color }) => $color};

  border-radius: var(--radius-full);

  transition: width var(--transition-normal) ease;

  background: ${({ $color }) =>

    $color === "var(--primary)" ? "var(--gradient-primary)" : $color};

`;

// Spinner Container for consistent spacing

// NOTE: Use transient prop $fullScreen so it doesn't reach the DOM
export const SpinnerContainer = styled.div`

  display: flex;

  align-items: center;

  justify-content: center;

  padding: var(--space-md);

  

  ${({ $fullScreen }) => $fullScreen && `

    position: fixed;

    top: 0;

    left: 0;

    right: 0;

    bottom: 0;

    background: rgba(255, 255, 255, 0.8);

    z-index: 1000;

  `}

`;

// Export all components as named object
export const LoadingComponents = {

  // Spinners

  LoadingSpinner,

  ButtonSpinner,

  PageSpinner,

  GradientSpinner,

  DotsSpinner,

  PulseSpinner,

  DualRingSpinner,

  CircleSpinner,

  

  // States

  Skeleton,

  EmptyState,

  ErrorState,

  SuccessState,

  LoadingState,

  

  // Layout

  SkeletonGrid,

  SkeletonCard,

  ProgressBar,

  SpinnerContainer,

};

// Default export is the main LoadingSpinner component for convenience
export default LoadingSpinner;

