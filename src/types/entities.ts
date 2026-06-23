export type UserRole = "customer" | "vendor";
export type CatalogItemStatus = "active" | "draft" | "archived";
export type InquiryStatus = "new" | "reviewed" | "closed";

export interface User {
  id: string;
  role: UserRole;
  fullName: string;
  email: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  id: string;
  ownerUserId: string;
  businessName: string;
  description: string;
  location: string;
  contactEmail: string;
  contactPhone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CatalogItem {
  id: string;
  vendorId: string;
  name: string;
  category: string;
  description: string;
  priceFrom?: number;
  location: string;
  availabilityTags: string[];
  status: CatalogItemStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Inquiry {
  id: string;
  vendorId: string;
  catalogItemId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  eventType: string;
  eventDate?: string;
  message: string;
  status: InquiryStatus;
  createdAt: string;
  updatedAt: string;
}
