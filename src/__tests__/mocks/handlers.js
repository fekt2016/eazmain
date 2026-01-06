/**
 * MSW Request Handlers
 * 
 * Mock handlers for all API endpoints used in the eazmain app.
 * These handlers simulate realistic backend responses.
 * 
 * CRITICAL: These handlers simulate cookie-based authentication.
 * - No localStorage tokens
 * - Cookies are simulated via response headers
 * - 401 responses indicate unauthenticated state
 */

import { http, HttpResponse } from 'msw';

const API_BASE = 'http://localhost:4000/api/v1';

// Mock user data
const mockUser = {
  _id: 'user123',
  id: 'user123',
  email: 'user@test.com',
  phone: '+233123456789',
  name: 'Test User',
  role: 'user',
  status: 'active',
  emailVerified: true,
  phoneVerified: true,
};

// Track authentication state (simulates cookie)
let isAuthenticated = false;
let currentUser = null;

/**
 * Helper to check if request is authenticated
 * In real app, this would check cookies
 */
const checkAuth = (request) => {
  // Check for cookie in request headers
  const cookies = request.headers.get('cookie') || '';
  const hasAuthCookie = cookies.includes('jwt') || cookies.includes('main_jwt');
  
  // Also check if we've set authentication state in tests
  return hasAuthCookie || isAuthenticated;
};

/**
 * Helper to set authentication state (for tests)
 */
export const setAuthenticated = (user = mockUser) => {
  isAuthenticated = true;
  currentUser = user;
};

/**
 * Helper to clear authentication state (for tests)
 */
export const clearAuthenticated = () => {
  isAuthenticated = false;
  currentUser = null;
};

export const handlers = [
  /**
   * Authentication Endpoints
   */
  
  // GET /users/me - Get current user
  http.get(`${API_BASE}/users/me`, ({ request }) => {
    if (!checkAuth(request)) {
      return HttpResponse.json(
        { status: 'fail', message: 'You are not logged in! Please log in to get access.' },
        { status: 401 }
      );
    }
    
    return HttpResponse.json({
      status: 'success',
      data: currentUser || mockUser,
    });
  }),

  // POST /users/login - Login
  http.post(`${API_BASE}/users/login`, async ({ request }) => {
    const body = await request.json();
    const { email, password } = body;
    
    // Simulate login validation
    if (email === 'user@test.com' && password === 'password123') {
      setAuthenticated(mockUser);
      
      // Set cookie in response (simulated)
      return HttpResponse.json(
        {
          status: 'success',
          message: 'Login successful',
          user: mockUser,
        },
        {
          status: 200,
          headers: {
            'Set-Cookie': 'jwt=mock-jwt-token; Path=/; HttpOnly',
          },
        }
      );
    }
    
    return HttpResponse.json(
      { status: 'fail', message: 'Invalid email or password' },
      { status: 401 }
    );
  }),

  // POST /users/logout - Logout
  http.post(`${API_BASE}/users/logout`, ({ request }) => {
    if (!checkAuth(request)) {
      return HttpResponse.json(
        { status: 'fail', message: 'You are not logged in!' },
        { status: 401 }
      );
    }
    
    clearAuthenticated();
    
    return HttpResponse.json(
      { status: 'success', message: 'Logged out successfully' },
      {
        headers: {
          'Set-Cookie': 'jwt=; Path=/; HttpOnly; Max-Age=0',
        },
      }
    );
  }),

  // POST /users/signup - Register
  http.post(`${API_BASE}/users/signup`, async ({ request }) => {
    const body = await request.json();
    
    // Simulate successful registration
    return HttpResponse.json(
      {
        status: 'success',
        message: 'Registration successful',
        user: { ...mockUser, email: body.email },
      },
      { status: 201 }
    );
  }),

  // POST /users/send-otp - Send OTP
  http.post(`${API_BASE}/users/send-otp`, async ({ request }) => {
    const body = await request.json();
    
    // Always succeed for testing
    return HttpResponse.json({
      status: 'success',
      message: 'OTP sent successfully',
      sessionId: 'otp-session-123',
    });
  }),

  // POST /users/verify-otp - Verify OTP
  http.post(`${API_BASE}/users/verify-otp`, async ({ request }) => {
    const body = await request.json();
    const { sessionId, otp, password } = body;
    
    // Simulate OTP verification
    if (otp === '123456') {
      setAuthenticated(mockUser);
      
      return HttpResponse.json(
        {
          status: 'success',
          message: 'OTP verified successfully',
          user: mockUser,
        },
        {
          status: 200,
          headers: {
            'Set-Cookie': 'jwt=mock-jwt-token; Path=/; HttpOnly',
          },
        }
      );
    }
    
    return HttpResponse.json(
      { status: 'fail', message: 'Invalid OTP' },
      { status: 401 }
    );
  }),

  /**
   * Product Endpoints
   */
  
  // GET /product - Get products
  http.get(`${API_BASE}/product`, ({ request }) => {
    return HttpResponse.json({
      status: 'success',
      data: {
        products: [],
      },
    });
  }),

  // GET /product/:id - Get product by ID
  http.get(`${API_BASE}/product/:id`, ({ request, params }) => {
    return HttpResponse.json({
      status: 'success',
      data: {
        product: {
          _id: params.id,
          name: 'Test Product',
          price: 100,
        },
      },
    });
  }),

  /**
   * Cart Endpoints
   */
  
  // GET /cart - Get user cart
  http.get(`${API_BASE}/cart`, ({ request }) => {
    if (!checkAuth(request)) {
      return HttpResponse.json(
        { status: 'fail', message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return HttpResponse.json({
      status: 'success',
      data: {
        cart: {
          items: [],
          total: 0,
        },
      },
    });
  }),

  /**
   * Wishlist Endpoints
   */
  
  // GET /wishlist - Get user wishlist
  http.get(`${API_BASE}/wishlist`, ({ request }) => {
    if (!checkAuth(request)) {
      return HttpResponse.json(
        { status: 'fail', message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return HttpResponse.json({
      status: 'success',
      data: {
        wishlist: [],
      },
    });
  }),

  /**
   * Order Endpoints
   */
  
  // GET /order - Get user orders
  http.get(`${API_BASE}/order`, ({ request }) => {
    if (!checkAuth(request)) {
      return HttpResponse.json(
        { status: 'fail', message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return HttpResponse.json({
      status: 'success',
      data: {
        orders: [],
      },
    });
  }),
];



