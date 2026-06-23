import type { CatalogItem, Vendor } from "../types/entities.js";

const now = new Date().toISOString();
const lioraVendorId = "0f7dd1b5-e8f9-4dcc-96ce-3172f3ac02b2";
const northlightVendorId = "70f238fa-e913-4d20-891c-4ed8b5d9134b";

export const vendorsSeed: Vendor[] = [
  {
    id: lioraVendorId,
    ownerUserId: "2dbd9a4f-e61a-4eaa-918b-c0f5b9b244e5",
    businessName: "Liora Table Catering",
    description: "Seasonal buffet and plated menus for personal events.",
    location: "Makati",
    contactEmail: "hello@lioratable.example",
    contactPhone: "+63 917 100 1200",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: northlightVendorId,
    ownerUserId: "cc73e48c-f29f-4d26-bf83-a5bf9a7b27a2",
    businessName: "Northlight Photo Co.",
    description: "Event photography packages with preview galleries.",
    location: "Quezon City",
    contactEmail: "bookings@northlight.example",
    contactPhone: "+63 917 200 2200",
    createdAt: now,
    updatedAt: now,
  },
];

export const catalogItemsSeed: CatalogItem[] = [
  {
    id: "a1a559a7-6a1c-49a5-8d77-c9771698de3d",
    vendorId: lioraVendorId,
    name: "Family Celebration Buffet",
    category: "Catering",
    description: "Buffet package for birthdays, reunions, and casual receptions.",
    priceFrom: 45000,
    location: "Makati",
    availabilityTags: ["weekends", "indoor", "outdoor"],
    status: "active",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "da93adf6-5f53-4d1b-9a68-c95ef26d3385",
    vendorId: northlightVendorId,
    name: "Half-Day Event Photo Coverage",
    category: "Photography",
    description: "Four-hour event photography coverage with edited online gallery.",
    priceFrom: 28000,
    location: "Quezon City",
    availabilityTags: ["weekdays", "weekends"],
    status: "active",
    createdAt: now,
    updatedAt: now,
  },
];
