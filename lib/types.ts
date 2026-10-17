export type Category = "Salon" | "Barbershop" | "Nail Studio" | "Spa";

export type Service = { id: string; name: string; duration: number; price: number };
export type AvailabilitySlot = { date: string; time: string; available: boolean };
export type Business = {
  id: string;
  slug: string;
  name: string;
  category: Category;
  area: string;
  address: string;
  lat: number;
  lng: number;
  description: string;
  image: string;
  rating: number;
  reviewCount: number;
  services: Service[];
  openingTime: string;
  closingTime: string;
  ownerCreated?: boolean;
};
export type Booking = {
  id: string;
  businessId: string;
  serviceId: string;
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  createdAt: string;
};
