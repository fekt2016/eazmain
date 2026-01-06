/**
 * Manual mock for swiper/react
 * Prevents CSS imports and provides test-friendly components
 * Filters out non-DOM props to prevent React warnings
 */

import React from 'react';

export const Swiper = ({ 
  children, 
  autoplay, 
  navigation, 
  pagination, 
  modules, 
  slidesPerView,
  spaceBetween,
  loop,
  effect,
  ...props 
}) => (
  <div data-testid="swiper" {...props}>
    {children}
  </div>
);

export const SwiperSlide = ({ children, ...props }) => (
  <div data-testid="swiper-slide" {...props}>
    {children}
  </div>
);

