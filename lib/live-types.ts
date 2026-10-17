export type Category = "Salon" | "Barbershop" | "Nail Studio" | "Spa";
export type BusinessStatus = "draft" | "pending_review" | "published" | "rejected";
export type BookingStatus = "pending" | "accepted" | "declined" | "expired" | "cancelled_by_customer" | "cancelled_by_seller" | "completed";

export type LiveService = { id: string; business_id: string; name: string; duration_minutes: number; price_idr: number; active: boolean };
export type LiveBusiness = {
  id: string; owner_id: string; slug: string; name: string; category: Category; area: string;
  address: string; description: string; lat: number; lng: number; cover_url: string | null;
  gallery_urls: string[]; status: BusinessStatus; rejection_reason: string | null;
  services?: LiveService[]; next_available?: string | null; available_days?: string[]; rating?: number | null; review_count?: number;
};
export type LiveBooking = {
  id: string; business_id: string; service_id: string; customer_id: string;
  customer_name: string; customer_email: string; customer_phone: string | null;
  service_name: string; duration_minutes: number; price_idr: number;
  starts_at: string; ends_at: string; expires_at: string; status: BookingStatus;
  cancellation_reason: string | null; created_at: string;
  businesses?: { name: string; slug: string; address: string; owner_id?: string } | null;
};

export const CATEGORIES: Category[] = ["Salon", "Barbershop", "Nail Studio", "Spa"];
export const JAKARTA_AREAS = [
  { name: "Jakarta Selatan", lat: -6.2615, lng: 106.8106 },
  { name: "Jakarta Pusat", lat: -6.1865, lng: 106.8341 },
  { name: "Jakarta Barat", lat: -6.1683, lng: 106.7588 },
  { name: "Jakarta Timur", lat: -6.225, lng: 106.9004 },
  { name: "Jakarta Utara", lat: -6.1384, lng: 106.8639 },
] as const;
