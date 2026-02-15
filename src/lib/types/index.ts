// Enum Types - Defined FIRST to avoid conflicts with re-exports
export type UserRole = 'admin' | 'brand_manager' | 'supervisor' | 'promotor' | 'asesor_de_ventas' | 'market_analyst' | 'client';
export type VisitStatus = 'in_progress' | 'completed' | 'cancelled';
export type PackageCondition = 'excellent' | 'good' | 'fair' | 'poor';
export type StockLevel = 'full' | 'medium' | 'low' | 'out_of_stock';
export type PaymentMethod = 'cash' | 'credit' | 'transfer';

// API Types
export * from './api';

// Visit API types (excluding Visit interface which is in database.ts)
export type {
  CreateVisitRequest,
  CreateVisitResponse,
  UpdateAssessmentRequest,
  UpdateAssessmentResponse,
  CreatePurchaseRequest,
  CreatePurchaseResponse,
  VisitAssessment
} from './visits';

// Database Types (authoritative source for Visit, Order, etc.)
export * from './database';
