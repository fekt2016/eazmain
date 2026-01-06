/**
 * Mock Container component for Jest
 * 
 * Filters out non-DOM props like `fluid` and `constrained`
 * to prevent React warnings about invalid HTML attributes
 */

import React from 'react';

const Container = ({ children, fluid, constrained, ...props }) => {
  // Filter out non-DOM props (fluid, constrained)
  // Only pass valid HTML attributes to the div
  return <div {...props}>{children}</div>;
};

export default Container;


