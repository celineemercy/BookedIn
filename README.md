# BookedIn Prototype

Prototipe marketplace booking jasa berbasis Next.js App Router, React, TypeScript, dan Tailwind CSS. Semua data berjalan di frontend.

## Menjalankan

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000). Untuk pemeriksaan produksi, jalankan `npm run lint` dan `npm run build`.

## Alur demo

1. Jelajahi katalog, cari layanan, pilih kategori dan area Jakarta.
2. Buka detail usaha, pilih layanan, tanggal, dan jam untuk membuat booking simulasi.
3. Buka **Untuk Pemilik Usaha** untuk melihat dashboard demo Studio Rambut Senja. Booking pada toko ini muncul di dashboard.
4. Pilih **Buka Toko** untuk membuat toko sendiri. Toko baru langsung tampil di katalog dan dapat diedit di dashboard.

Data toko baru, perubahan toko, dan booking tersimpan dalam `localStorage` browser yang sama. Data dapat direset dengan menghapus local storage situs ini. Tidak ada autentikasi, pembayaran, notifikasi, atau API backend.

## Struktur data

- `lib/types.ts`: kontrak `Business`, `Service`, `AvailabilitySlot`, dan `Booking`.
- `lib/data.ts`: data awal dan fungsi jarak, harga, tanggal, serta slot.
- `lib/store.ts`: lapisan penyimpanan lokal; dapat diganti dengan panggilan API saat backend Next.js ditambahkan.
