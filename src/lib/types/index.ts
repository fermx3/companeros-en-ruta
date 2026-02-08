// API Types
export * from './api';
export * from './visits';

// Database Types
export * from './database';

// Enum Types
export type UserRole = 'admin' | 'brand' | 'supervisor' | 'promotor' | 'asesor_de_ventas' | 'market_analyst' | 'client';
export type VisitStatus = 'in_progress' | 'completed' | 'cancelled';
export type PackageCondition = 'excellent' | 'good' | 'fair' | 'poor';
export type StockLevel = 'full' | 'medium' | 'low' | 'out_of_stock';
export type PaymentMethod = 'cash' | 'credit' | 'transfer';
