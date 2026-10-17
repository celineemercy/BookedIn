import Link from "next/link";
import { Mail, ShieldCheck } from "lucide-react";
import { sendMagicLink } from "@/app/actions/auth";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string; sent?: string }> }) {
  const params = await searchParams;
  const messages: Record<string, string> = {
    email: "Masukkan alamat email yang valid.", setup: "Login belum tersedia. Hubungi tim BookedIn.",
    send: "Email gagal dikirim. Coba lagi sebentar.", callback: "Tautan masuk tidak berlaku. Minta tautan baru.",
  };
  return <main className="container-page grid min-h-[70vh] gap-10 py-12 lg:grid-cols-2 lg:items-center"><div><p className="eyebrow">Satu akun, banyak kemudahan</p><h1 className="mt-3 max-w-xl text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">Masuk ke BookedIn.</h1><p className="mt-5 max-w-lg leading-8 text-muted">Lihat status booking, simpan tempat favorit, atau kelola usahamu dari perangkat mana saja.</p><div className="mt-8 flex items-start gap-3 rounded-2xl bg-[#E9EEFF] p-5 text-sm"><ShieldCheck className="shrink-0 text-cobalt" /><span>Kami mengirim tautan sekali pakai ke emailmu. Kamu tidak perlu mengingat kata sandi.</span></div></div>
    <form action={sendMagicLink} className="card p-6 md:p-10"><Mail size={32} className="text-cobalt" /><h2 className="mt-5 text-2xl font-extrabold">Masuk dengan email</h2><p className="mt-2 text-sm text-muted">Tautan masuk akan dikirim ke kotak masukmu.</p><input type="hidden" name="next" value={params.next || "/account"} /><label htmlFor="login-email" className="label mt-7">Alamat email</label><input id="login-email" name="email" type="email" required autoComplete="email" className="field" placeholder="nama@email.com" />{params.error && <p role="alert" className="mt-4 rounded-xl bg-[#FFE5DC] p-3 text-sm font-semibold text-[#963C25]">{messages[params.error] || "Terjadi kesalahan."}</p>}{params.sent && <p role="status" className="mt-4 rounded-xl bg-[#E9EEFF] p-3 text-sm font-semibold text-cobalt">Cek emailmu dan buka tautan masuk dari perangkat ini.</p>}<button className="btn-primary mt-6 w-full" type="submit">Kirim tautan masuk</button><p className="mt-5 text-center text-xs text-muted">Dengan masuk, kamu menyetujui penggunaan data untuk mengelola booking. <Link href="/privacy" className="font-bold text-cobalt underline">Baca privasi</Link>.</p></form></main>;
}
