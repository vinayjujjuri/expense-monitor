// Shared application types

// Transaction model (mirrors models/transaction.ts)
export type CreditType = "salary" | "other" | null;
export type DebitType =
  | "Other Expenses"
  | "Recharges/Bills"
  | "Office travel"
  | "Fast food"
  | "EMI"
  | "Offline Shopping/Online Shopping"
  | null;

export interface ITransaction {
  _id?: string;
  userId?: string;
  amount: number;
  type: "credit" | "debit";
  creditType?: CreditType;
  category?: string | null;
  createdAt: string | Date;
  transactionDate: string | Date;
}

// Request bodies accepted by API routes
export interface CreditRequestBody {
  amount: number;
  creditType?: CreditType | string | null;
  transactionDate?: string | Date;
}

export interface DebitRequestBody {
  amount: number;
  category?: DebitType | string | null;
  transactionDate?: string | Date;
}

// Analytics payloads
export type MonthlySummary = { month: number; totalAmount: number };
export type CategorySummary = { category: string | null; totalAmount: number };
export type MonthlyCategoryBucket = { _id: string; totalAmount: number };

export interface MonthlyAnalyticsPayload {
  month: number;
  year: number;
  totalSpent: number;
  categories: Array<{ _id: string; totalAmount: number }>;
}

// Reusable dropdown generics (matches app/components/dropdown)
export interface Option<T = unknown> {
  label: string;
  value: T;
  disabled?: boolean;
}

export interface DropdownProps<T = unknown> {
  options: Option<T>[];
  value?: T | T[];
  onChange?: (value: T | T[]) => void;
  placeholder?: string;
  multi?: boolean;
  renderValue?: (selected: Option<T> | Option<T>[] | null) => unknown;
  renderOption?: (option: Option<T>, isSelected: boolean) => unknown;
  className?: string;
  id?: string;
}

// Small utility types
export type Nullable<T> = T | null | undefined;
