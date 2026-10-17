import { Business, Category } from "./types";

export const areas = [
  { name: "Jakarta Selatan", lat: -6.2615, lng: 106.8106 },
  { name: "Jakarta Pusat", lat: -6.1865, lng: 106.8341 },
  { name: "Jakarta Barat", lat: -6.1683, lng: 106.7588 },
  { name: "Jakarta Timur", lat: -6.2250, lng: 106.9004 },
  { name: "Jakarta Utara", lat: -6.1384, lng: 106.8639 }
];

export const categories: Category[] = ["Salon", "Barbershop", "Nail Studio", "Spa"];

export const businesses: Business[] = [
  {
    id: "b1", slug: "studio-rambut-senja", name: "Studio Rambut Senja", category: "Salon", area: "Jakarta Selatan", address: "Jl. Kemang Raya No. 18, Kemang, Jakarta Selatan", lat: -6.2607, lng: 106.8140,
    description: "Ruang kecil untuk merawat diri dan menemukan gaya rambut yang paling kamu. Ditangani stylist berpengalaman dengan suasana yang terasa seperti rumah.",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=85", rating: 4.9, reviewCount: 128,
    services: [{ id: "b1-s1", name: "Haircut & Styling", duration: 60, price: 175000 }, { id: "b1-s2", name: "Hair Spa", duration: 90, price: 250000 }, { id: "b1-s3", name: "Creambath", duration: 60, price: 150000 }], openingTime: "09:00", closingTime: "18:00"
  },
  {
    id: "b2", slug: "barber-bumi", name: "Barber Bumi", category: "Barbershop", area: "Jakarta Pusat", address: "Jl. Cikini Raya No. 32, Cikini, Jakarta Pusat", lat: -6.1931, lng: 106.8400,
    description: "Potongan rapi, obrolan santai, dan tempat singgah yang nyaman. Barber Bumi siap bikin harimu terasa lebih segar.",
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&q=85", rating: 4.8, reviewCount: 94,
    services: [{ id: "b2-s1", name: "Classic Haircut", duration: 45, price: 85000 }, { id: "b2-s2", name: "Haircut + Beard Trim", duration: 60, price: 120000 }, { id: "b2-s3", name: "Hair Wash", duration: 30, price: 45000 }], openingTime: "10:00", closingTime: "20:00"
  },
  {
    id: "b3", slug: "kuku-kita-studio", name: "Kuku Kita Studio", category: "Nail Studio", area: "Jakarta Selatan", address: "Jl. Cipete Raya No. 7, Cipete, Jakarta Selatan", lat: -6.2741, lng: 106.8001,
    description: "Nail studio mungil dengan warna-warna yang bikin senang. Dari manicure simpel sampai nail art yang benar-benar personal.",
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200&q=85", rating: 4.9, reviewCount: 76,
    services: [{ id: "b3-s1", name: "Classic Manicure", duration: 45, price: 120000 }, { id: "b3-s2", name: "Gel Polish", duration: 75, price: 195000 }, { id: "b3-s3", name: "Nail Art", duration: 90, price: 275000 }], openingTime: "10:00", closingTime: "18:00"
  },
  {
    id: "b4", slug: "rumah-rileks", name: "Rumah Rileks", category: "Spa", area: "Jakarta Barat", address: "Jl. Tanjung Duren Barat No. 12, Jakarta Barat", lat: -6.1783, lng: 106.7838,
    description: "Ambil jeda dari hiruk pikuk kota. Perawatan tubuh yang menenangkan dengan sentuhan personal dari terapis kami.",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=85", rating: 4.7, reviewCount: 112,
    services: [{ id: "b4-s1", name: "Relaxing Massage", duration: 60, price: 220000 }, { id: "b4-s2", name: "Aromatherapy Massage", duration: 90, price: 320000 }], openingTime: "09:00", closingTime: "20:00"
  },
  {
    id: "b5", slug: "atelier-beauty", name: "Atelier Beauty", category: "Salon", area: "Jakarta Utara", address: "Jl. Pluit Karang Ayu No. 9, Jakarta Utara", lat: -6.1167, lng: 106.7958,
    description: "Salon dengan sentuhan modern dan perhatian pada setiap detail. Datang untuk perawatan, pulang dengan percaya diri.",
    image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1200&q=85", rating: 4.8, reviewCount: 63,
    services: [{ id: "b5-s1", name: "Women Haircut", duration: 60, price: 190000 }, { id: "b5-s2", name: "Blow Dry", duration: 45, price: 120000 }, { id: "b5-s3", name: "Hair Coloring", duration: 150, price: 650000 }], openingTime: "10:00", closingTime: "19:00"
  },
  {
    id: "b6", slug: "pangkas-sore", name: "Pangkas Sore", category: "Barbershop", area: "Jakarta Timur", address: "Jl. Rawamangun Muka No. 21, Jakarta Timur", lat: -6.2019, lng: 106.8848,
    description: "Barbershop neighborhood dengan potongan presisi dan harga bersahabat. Tempat nyaman untuk reset penampilanmu.",
    image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=1200&q=85", rating: 4.7, reviewCount: 88,
    services: [{ id: "b6-s1", name: "Regular Cut", duration: 45, price: 75000 }, { id: "b6-s2", name: "Premium Grooming", duration: 75, price: 145000 }], openingTime: "11:00", closingTime: "20:00"
  }
];

export const rupiah = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

export function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getDates(count = 7) {
  return Array.from({ length: count }, (_, i) => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + i);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  });
}

export function timeSlots(openingTime: string, closingTime: string) {
  const [open] = openingTime.split(":").map(Number);
  const [close] = closingTime.split(":").map(Number);
  return Array.from({ length: Math.max(0, close - open) }, (_, i) => `${String(open + i).padStart(2, "0")}:00`);
}
