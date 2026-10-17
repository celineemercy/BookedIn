import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Privasi | BookedIn" };

export default function PrivacyPage() {
  const operator = process.env.NEXT_PUBLIC_OPERATOR_NAME;
  const contact = process.env.NEXT_PUBLIC_PRIVACY_CONTACT_EMAIL;
  return <main className="container-page max-w-4xl py-12 md:py-20">
    <p className="eyebrow">Privasi</p>
    <h1 className="mt-3 text-4xl font-extrabold tracking-tight">Bagaimana BookedIn memakai datamu</h1>
    {!operator || !contact ? <p className="mt-6 rounded-2xl bg-[#FFF0E8] p-5 text-sm font-semibold text-[#963C25]">Informasi pengelola dan kontak privasi sedang dilengkapi. Permintaan booking sungguhan belum dibuka.</p> : <p className="mt-5 text-muted">Layanan BookedIn dikelola oleh {operator}. Pertanyaan tentang data pribadi dapat dikirim ke <a className="font-bold text-cobalt underline" href={`mailto:${contact}`}>{contact}</a>.</p>}
    <div className="mt-9 space-y-8 leading-7 text-muted">
      <section><h2 className="text-xl font-extrabold text-ink">Data yang kami gunakan</h2><p className="mt-2">Saat kamu masuk atau meminta jadwal, kami menyimpan email akun, nama dan nomor telepon yang kamu berikan, layanan dan waktu pilihanmu, serta riwayat status booking. Pemilik usaha mengisi profil, alamat, pin lokasi, foto, layanan, dan jam buka. Ulasan dan tempat tersimpan dikaitkan dengan akunmu.</p></section>
      <section><h2 className="text-xl font-extrabold text-ink">Untuk apa data dipakai</h2><p className="mt-2">Data dipakai untuk mengelola akun, menampilkan katalog, menyampaikan permintaan kepada pemilik usaha, memperbarui status janji, mengirim email terkait booking, dan menampilkan ulasan dari kunjungan yang selesai. Nama, kontak, dan rincian booking dibagikan kepada pemilik usaha yang kamu pilih agar mereka dapat menanggapi permintaanmu.</p></section>
      <section><h2 className="text-xl font-extrabold text-ink">Lokasi dan pengukuran produk</h2><p className="mt-2">Kamu bisa memilih area secara manual. Jika kamu mengizinkan lokasi perangkat, koordinat digunakan di browser untuk mengurutkan jarak perkiraan garis lurus. Koordinat GPS pelanggan tidak disimpan dalam akun atau peristiwa analitik. Kami dapat mencatat langkah umum seperti membuka katalog atau mengirim permintaan tanpa nama, nomor telepon, atau koordinat GPS.</p></section>
      <section><h2 className="text-xl font-extrabold text-ink">Penyimpanan dan permintaanmu</h2><p className="mt-2">Informasi akun, usaha, booking, dan ulasan disimpan melalui penyedia infrastruktur yang digunakan BookedIn. Kamu dapat melihat booking dan data profil di halaman akun. {contact ? <>Untuk meminta akses, koreksi, atau penghapusan data, hubungi <a className="font-bold text-cobalt underline" href={`mailto:${contact}`}>{contact}</a>.</> : "Kontak untuk permintaan akses, koreksi, atau penghapusan data akan ditampilkan sebelum booking dibuka."} Sebagian catatan booking mungkin perlu dipertahankan selama permintaan tersebut diproses atau untuk kewajiban yang berlaku.</p></section>
    </div>
    <Link href="/" className="btn-outline mt-10">Kembali ke beranda</Link>
  </main>;
}
