import { Suspense } from "react";
import Explore from "./view";

export default function ExplorePage() { return <Suspense fallback={<main className="container-page min-h-[70vh] py-20">Memuat katalog...</main>}><Explore /></Suspense>; }
