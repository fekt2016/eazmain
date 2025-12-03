/**
 * Support Ticket Types
 * Shared type definitions for support system
 */

/**
 * Support Ticket Status
 */
export const TICKET_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  AWAITING_USER: 'awaiting_user',
  ESCALATED: 'escalated',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
};

/**
 * Support Ticket Priority
 */
export const TICKET_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

/**
 * Support Ticket Department
 */
export const TICKET_DEPARTMENT = {
  ORDERS_DELIVERY: 'Orders & Delivery',
  PAYMENTS_BILLING: 'Payments & Billing',
  SHIPPING_RETURNS: 'Shipping & Returns',
  ACCOUNT_PROFILE: 'Account & Profile',
  PAYOUT_FINANCE: 'Payout & Finance',
  LISTINGS: 'Listings',
  ACCOUNT_VERIFICATION: 'Account Verification',
  INFRASTRUCTURE: 'Infrastructure',
  COMPLIANCE: 'Compliance',
  PAYMENTS: 'Payments',
  SELLERS: 'Sellers',
  ORDERS: 'Orders',
  GENERAL: 'General',
};

/**
 * Support Ticket Role
 */
export const TICKET_ROLE = {
  BUYER: 'buyer',
  SELLER: 'seller',
  ADMIN: 'admin',
};

/**
 * Support Ticket Shape
 * @typedef {Object} SupportTicket
 * @property {string} _id
 * @property {string} ticketNumber
 * @property {string} userId
 * @property {string} role - "buyer" | "seller" | "admin"
 * @property {string} department
 * @property {string} priority - "low" | "medium" | "high" | "critical"
 * @property {string} issueType
 * @property {string} relatedOrderId
 * @property {string} relatedPayoutId
 * @property {string} title
 * @property {string} message
 * @property {string} status - "open" | "in_progress" | "awaiting_user" | "escalated" | "resolved" | "closed"
 * @property {string} assignedTo
 * @property {Array} attachments
 * @property {Date} createdAt
 * @property {Date} updatedAt
 * @property {Date} lastMessageAt
 * @property {Date} resolvedAt
 * @property {Date} closedAt
 */

/**
 * Support Message Shape
 * @typedef {Object} SupportMessage
 * @property {string} _id
 * @property {string} ticketId
 * @property {string} senderId
 * @property {string} senderRole - "buyer" | "seller" | "admin" | "system"
 * @property {string} senderName
 * @property {string} message
 * @property {Array} attachments
 * @property {boolean} isInternal
 * @property {Date} createdAt
 */

/**
 * Status badge colors
 */
export const STATUS_COLORS = {
  open: '#3B82F6',
  in_progress: '#F59E0B',
  awaiting_user: '#8B5CF6',
  escalated: '#EF4444',
  resolved: '#10B981',
  closed: '#6B7280',
};

/**
 * Priority badge colors
 */
export const PRIORITY_COLORS = {
  low: '#6B7280',
  medium: '#3B82F6',
  high: '#F59E0B',
  critical: '#EF4444',
};

