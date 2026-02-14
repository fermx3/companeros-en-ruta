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

// Enum Types
export type UserRole = 'admin' | 'brand' | 'supervisor' | 'promotor' | 'asesor_de_ventas' | 'market_analyst' | 'client';
export type VisitStatus = 'in_progress' | 'completed' | 'cancelled';
export type PackageCondition = 'excellent' | 'good' | 'fair' | 'poor';
export type StockLevel = 'full' | 'medium' | 'low' | 'out_of_stock';
export type PaymentMethod = 'cash' | 'credit' | 'transfer';
