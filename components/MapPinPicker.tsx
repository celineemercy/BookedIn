"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";
import type mapboxgl from "mapbox-gl";
import { MapPin, Search } from "lucide-react";

type Point = { lat: number; lng: number };

export function MapPinPicker({ value, onChange, compact = false }: { value: Point; onChange: (point: Point) => void; compact?: boolean }) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!token || !container.current || map.current) return;
    let active = true;
    import("mapbox-gl").then(module => {
      if (!active || !container.current) return;
      const mapbox = module.default;
      mapbox.accessToken = token;
      const instance = new mapbox.Map({ container: container.current, style: "mapbox://styles/mapbox/streets-v12", center: [value.lng, value.lat], zoom: 13 });
      const pin = new mapbox.Marker({ color: "#F36B45", draggable: true }).setLngLat([value.lng, value.lat]).addTo(instance);
      instance.on("click", event => { pin.setLngLat(event.lngLat); onChange({ lat: event.lngLat.lat, lng: event.lngLat.lng }); });
      pin.on("dragend", () => { const point = pin.getLngLat(); onChange({ lat: point.lat, lng: point.lng }); });
      map.current = instance; marker.current = pin;
    }).catch(() => setError("Peta gagal dimuat. Masukkan koordinat secara manual."));
    return () => { active = false; map.current?.remove(); map.current = null; marker.current = null; };
    // The map is created once; changes are handled by the next effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);
  useEffect(() => { marker.current?.setLngLat([value.lng, value.lat]); map.current?.flyTo({ center: [value.lng, value.lat], zoom: 14 }); }, [value.lat, value.lng]);

  const search = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || !address.trim()) return;
    setLoading(true); setError("");
    try {
      const url = new URL("https://api.mapbox.com/search/geocode/v6/forward");
      url.searchParams.set("q", address.trim()); url.searchParams.set("country", "ID"); url.searchParams.set("limit", "1"); url.searchParams.set("access_token", token);
      const response = await fetch(url);
      const result = await response.json();
      const coordinates = result.features?.[0]?.geometry?.coordinates;
      if (!response.ok || !coordinates) throw new Error("Alamat tidak ditemukan. Geser pin pada peta atau isi koordinat.");
      onChange({ lng: Number(coordinates[0]), lat: Number(coordinates[1]) });
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Pencarian lokasi gagal."); }
    setLoading(false);
  };

  return <div className="space-y-3"><form onSubmit={search} className="flex gap-2"><label className="flex flex-1 items-center gap-2 rounded-xl border border-[#E8D8CF] bg-white px-3"><Search size={17} className="text-accentText" /><span className="sr-only">Cari alamat di peta</span><input value={address} onChange={event => setAddress(event.target.value)} placeholder="Cari jalan atau area" className="w-full py-3 outline-none" /></label><button type="submit" disabled={!token || loading} className="btn-outline !min-h-10 !px-4 text-sm">Cari</button></form>
    {token ? <div ref={container} role="application" aria-label="Peta untuk memilih titik lokasi" className={`${compact ? "h-64" : "h-80"} overflow-hidden rounded-2xl bg-[#FFF0E8]`} /> : <div className="flex h-28 items-center gap-3 rounded-2xl bg-[#FFF0E8] p-5 text-sm text-muted"><MapPin className="text-accentText" />Peta aktif setelah token Mapbox dikonfigurasi. Koordinat dapat diisi manual.</div>}
    <div className="grid grid-cols-2 gap-3"><div><label htmlFor="pin-lat" className="label">Lintang</label><input id="pin-lat" type="number" step="any" value={value.lat} onChange={event => onChange({ ...value, lat: Number(event.target.value) })} className="field" /></div><div><label htmlFor="pin-lng" className="label">Bujur</label><input id="pin-lng" type="number" step="any" value={value.lng} onChange={event => onChange({ ...value, lng: Number(event.target.value) })} className="field" /></div></div>
    {error && <p role="alert" className="text-sm font-semibold text-accentText">{error}</p>}<p className="text-xs text-muted">Pilih titik di peta atau geser pin agar jarak yang ditampilkan akurat.</p></div>;
}
