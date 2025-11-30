import { createGlobalStyle } from "styled-components";
import { devicesMax, devicesMin, devices } from "./breakpoint";

// Re-export breakpoints for convenience
export { devicesMax, devicesMin, devices } from "./breakpoint";

const GlobalStyles = createGlobalStyle`
:root {
//css styled component
  /* Indigo */
  --color-brand-50:  #f0f8ff;
  --color-brand-100: #dff0ff;
  --color-brand-200: #b8e1ff;
  --color-brand-300: #98d7ff;
  --color-brand-400: #33b2fd;
  --color-brand-500: #0078cc;
  --color-brand-600: #005fa5;
  --color-brand-700: #045188;
  --color-brand-800: #0a4470;
  --color-brand-900: #062a4b;

  --color-facebook: #4267B2;
  --color-twitter-900: #1DA1F2;
  --color-instagram: #FFDC80;


   --color-primary-50: #ffffea; 
  --color-primary-100: #fffcc5;
  --color-primary-200: #fffa85;
  --color-primary-300: #fff146;
  --color-primary-400: #ffe31b;
  --color-primary-500: #ffc400;
  --color-primary-600: #e29800;
  --color-primary-700: #bb6c02; 
  --color-primary-800: #985308;
  --color-primary-900: #7c440b;
 
  

  --color-orange-0: orange;
  /* Grey */
  //used


    
   

  --color-white-0: #fff;
  --color-grey-50: #f9fafb;
  --color-grey-100: #f3f4f6;
  --color-grey-200: #e5e7eb;
  --color-grey-300: #d1d5db;
  
  --color-grey-400: #9ca3af;
  --color-grey-500: #6b7280;
  --color-grey-600: #4b5563;
  --color-grey-700: #374151; 
  --color-grey-800: #1f2937;
  
  --color-grey-900: #111827;

  --color-blue-100: #e0f2fe;
  --color-blue-700: #0369a1;
  --color-green-100: #dcfce7;
  --color-green-700: #15803d;







  --color-bitcoin-300: #fff6e1;
  --color-bitcoin-500:#ffecbf;
  --color-bitcoin-900: #f2a900;
  --color-usdt-500: #D2F4EA;
  --color-usdt-900: #26A17B;
  --color-doge-500:#ffdd76;
  --color-doge-900:#cb9800;
  --color-ethereum-500:#9eb6b8;
  --color-litecoin-500:#aae4ff;
  --color-bitcsh-500: #b6d990;
  --color-whatsapp-100: #25D366;
  --color-whatsapp-700: #128C7E;
  --color-gold-900: #FFD700;
  --color-gold-700: #eada9c;
 

 /* Add these layout variables */
    --sidebar-width: 240px;
    --header-height: 64px;
    
    /* Existing variables */

  
  



  --color-green-500: #38a169;
  --color-yellow-100: #fef9c3;
  --color-yellow-700: #a16207;
  --color-silver-100: #e5e7eb;
  --color-silver-700: #374151;
  --color-indigo-100: #e0e7ff;
  --color-indigo-700: #4338ca;



//used
  --color-black-100: #f7f7f7;
  --color-black-200: #e3e3e3;
  --color-black-300: #c8c8c8;
  --color-black-400: #a4a4a4;
  --color-black-500: #818181;
  --color-black-600: #666666;
  --color-black-700: #515151;
  --color-black-800: #434343;
  --color-black-850: #383838;
  --color-black-900: #313131;
  //used
  --color-black-950: #000000;

  --color-red-100: #fee2e2;
  //used
  --color-red-500: #fcc;
  --color-red-600: #f87171;
  --color-red-700: #b91c1c;
  --color-red-800: #991b1b;
  
  /* keep green-700 consistent with earlier token */
  --color-red-900:	#FF0000;

  --backdrop-color: rgba(255, 255, 255, 0.1);

  --shadow-sm: 0 0.2rem 1rem rgba(0, 0, 0, 0.1);
  --shadow-md: 0 0.6rem 2.4rem rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 2.4rem 3.2rem rgba(0, 0, 0, 0.12);

  --border-radius-tiny: 3px;
  --border-radius-sm: 5px;
  --border-radius-md: 7px;
  --border-radius-lg: 9px;
  --border-radius-xl: 12px;
  --border-radius-cir: 100px;

  /* Spacing Scale */
  --spacing-xs: 0.4rem;
  --spacing-sm: 0.8rem;
  --spacing-md: 1.6rem;
  --spacing-lg: 2.4rem;
  --spacing-xl: 3.2rem;
  --spacing-2xl: 4.8rem;
  --spacing-3xl: 6.4rem;

  /* Typography Scale */
  --font-size-xs: 1.2rem;
  --font-size-sm: 1.4rem;
  --font-size-md: 1.6rem;
  --font-size-lg: 1.8rem;
  --font-size-xl: 2rem;
  --font-size-2xl: 2.4rem;
  --font-size-3xl: 3.2rem;
  --font-size-4xl: 4rem;

  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-base: 0.3s ease;
  --transition-normal: 0.3s ease;
  --transition-slow: 0.5s ease;

  /* Gradients */
  --gradient-primary: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%);
  --gradient-accent: linear-gradient(135deg, var(--color-brand-500) 0%, var(--color-brand-600) 100%);

  /* Additional color aliases for buttons */
  --primary: var(--color-primary-500);
  --primary-light: var(--color-primary-400);
  --secondary: var(--color-grey-700);
  --white: var(--color-white-0);
  --text-secondary: var(--color-grey-600);
  --gray-50: var(--color-grey-50);
  --gray-200: var(--color-grey-200);
  --gray-300: var(--color-grey-300);
  --gray-400: var(--color-grey-400);
  --error: var(--color-red-600);
  --error-light: var(--color-red-500);
  --success: var(--color-green-700);
  --warning: var(--color-yellow-700);

  /* Additional shadows */
  --shadow-gold: 0 4px 20px rgba(255, 196, 0, 0.3);

  /* Font aliases */
  --font-body: 'Open Sans', sans-serif;
  --font-heading: 'Montserrat', sans-serif;
  --font-semibold: 600;
  --font-bold: 700;

  /* Text size aliases */
  --text-xs: var(--font-size-xs);
  --text-sm: var(--font-size-sm);
  --text-base: var(--font-size-md);
  --text-lg: var(--font-size-lg);

  /* Spacing aliases */
  --space-xs: var(--spacing-xs);
  --space-sm: var(--spacing-sm);
  --space-md: var(--spacing-md);
  --space-lg: var(--spacing-lg);
  --space-xl: var(--spacing-xl);
  --space-2xl: var(--spacing-2xl);

  /* Radius aliases */
  --radius-md: var(--border-radius-md);
  --radius-lg: var(--border-radius-lg);
  --radius-xl: var(--border-radius-xl);
  --radius-full: 50%;

  /* Text color aliases */
  --text-muted: var(--color-grey-500);

  /* Font weight aliases */
  --font-medium: 500;

  /* Transition aliases */
  --transition-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);

  /* For dark mode */
  --image-grayscale: 0;
  --image-opacity: 100%;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  padding: 0;
  margin: 0;

  /* Creating animations for dark mode */
  transition: background-color 0.3s, border 0.3s;
}

html {
  width: 100vw;
  font-size: 62.5%;
  @media ${devicesMax.md} {
    font-size: 60%;
  }
  @media ${devicesMax.sm} {
    font-size: 55%;
    width: 100vw;
  }
}

body {
  font-family: var(--font-body);
  font-weight: 400;
  color: var(--color-grey-700);
  transition: color 0.3s, background-color 0.3s;
  min-height: 100vh;
  line-height: 1.5;
  font-size: 1.6rem;
  width: 100vw;
  overflow-x: hidden;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  font-weight: 500;
  line-height: 1.2;
  color: var(--color-grey-900);
}

h1 {
  font-weight: 600;
  font-size: 3.2rem;
}

h2 {
  font-weight: 600;
  font-size: 2.4rem;
}

h3 {
  font-weight: 500;
  font-size: 2rem;
}

h4 {
  font-weight: 500;
  font-size: 1.8rem;
}

h5 {
  font-weight: 500;
  font-size: 1.6rem;
}

h6 {
  font-weight: 500;
  font-size: 1.4rem;
}

input,
button,
textarea,
select {
  font: inherit;
  color: inherit;
}

button {
  cursor: pointer;
}

*:disabled {
  cursor: not-allowed;
}

select:disabled,
input:disabled {
  background-color: var(--color-grey-200);
  color: var(--color-grey-500);
}

input:focus,
button:focus,
textarea:focus,
select:focus {
  /* outline: 2px solid var(--color-black-950); */
  outline-offset: -1px;
}

/* Parent selector, finally 😃 */
button:has(svg) {
  line-height: 0;
}

a {
  color: inherit;
  text-decoration: none;
}

ul {
  list-style: none;
}

p,
h1,
h2,
h3,
h4,
h5,
h6 {
  overflow-wrap: break-word;
  hyphens: auto;
}

img {
  max-width: 100%;

  /* For dark mode */
  filter: grayscale(var(--image-grayscale)) opacity(var(--image-opacity));
}



`;
export default GlobalStyles;
