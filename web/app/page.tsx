'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { useThree } from './context/ThreeContext';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface CardItem {
  link: string;
  paragraph: string[];
}

interface CacheEntry {
  data: CardItem[];
  lastUpdated: number;
}

// ─── Constants ─────────────────────────────────────────────────────────────────
const CACHE_KEY = 'tiny_tigers_cards';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

// ─── Default Figma fallback data ────────────────────────────────────────────────
const DEFAULT_CARDS: CardItem[] = [
  {
    link: '',
    paragraph: [
      'Welcome',
      "Tiny Tigers Daycare offers a safe, nurturing environment where children learn through hands-on activities, play, and cooperation. Daily experiences are designed to build creativity, confidence, and social skills while supporting each child's growth.",
      'Our partnership with future educators, guided by experienced instructors and childcare providers, gives children extra attention and enriching learning experiences while preparing students with real-world practice.',
      'At Tiny Tigers, every child is valued and encouraged to explore, grow, and shine.',
    ],
  },
  {
    link: '',
    paragraph: [
      'Description of Services',
      'Children thrive when surrounded by love, security, and engaging opportunities. We provide a safe and stimulating environment where every child feels valued and supported.',
      'Our curriculum is individualized and focuses on the whole child—social, emotional, physical, and cognitive development.',
      'Activities include: child-directed learning, child-directed play, and teacher-supported activities.',
    ],
  },
  {
    link: '',
    paragraph: [
      'Curriculum & Activities',
      'Our program serves children from birth through school age and provides a semi-structured environment with guided learning and play.',
      'Small Muscles: puzzles, playdough, blocks • Large Muscle: running, jumping, climbing • Creative Play: dress-up, puppets, dramatic play • Arts & Crafts: creative projects • Music & Movement: singing and instruments • Science: cooking, planting, experiments • Language: storytime and sharing • Responsibilities: helping with daily routines.',
    ],
  },
  {
    link: '',
    paragraph: [
      'Hours & Location',
      'School Year (Aug–May): Monday–Friday: 7:30 a.m.–4:30 p.m.',
      'Summer (June–July): Monday–Thursday: 7:30 a.m.–3:15 p.m.',
      'Tiny Tigers follows the Fort Hays Tech Northeast calendar. Weather or campus closures may affect hours.',
    ],
  },
  {
    link: '',
    paragraph: [
      'Enrollment Information',
      'Enrollment is open year-round based on availability. A waiting list is available if full.',
      'Required: First monthly tuition, $30 enrollment fee, current physical, immunization record, emergency notice, and intake/child information.',
      'Families must complete orientation and submit all paperwork before care begins due to state regulations.',
    ],
  },
];

// ─── Card component ─────────────────────────────────────────────────────────────
interface CardProps {
  card: CardItem;
  index: number;
  isMobile: boolean;
  onFocus: (index: number) => void;
}

function Card({ card, index, isMobile, onFocus }: CardProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [entered, setEntered] = useState(false);
  // alternating scroll side tracking is handled by parent; we just receive isMobile
  const side = index % 2 === 0 ? 'left' : 'right';

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !entered) {
          setVisible(false);
          // Small delay so the initial off-screen state renders first
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setVisible(true);
              setEntered(true);
            });
          });
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [entered]);

  const title = card.paragraph[0] ?? '';
  const body = card.paragraph.slice(1);

  // Desktop: enter from bottom with X-axis rotation
  // Mobile: enter from alternating sides
  const getTransform = () => {
    if (visible) return 'translateY(0) rotateX(0deg) translateX(0)';
    if (isMobile) {
      return side === 'left'
        ? 'translateX(-120%) rotateX(0deg)'
        : 'translateX(120%) rotateX(0deg)';
    }
    return 'translateY(80px) rotateX(-35deg)';
  };

  return (
    <article
      ref={ref}
      tabIndex={0}
      aria-label={title}
      onFocus={() => onFocus(index)}
      onMouseEnter={() => onFocus(index)}
      style={{
        transform: getTransform(),
        opacity: visible ? 1 : 0,
        transition: 'transform 0.65s cubic-bezier(0.22,1,0.36,1), opacity 0.65s ease',
        perspective: '800px',
        transformStyle: 'preserve-3d',
      }}
      className="relative z-10 flex flex-col rounded-2xl overflow-hidden shadow-lg bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-4 focus:ring-[#FFB300]"
    >
      {/* Card image */}
      {card.link ? (
        <img
          src={card.link}
          alt={title}
          className="w-full h-48 object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-48 bg-[#FFB300]/20 flex items-center justify-center">
          <span className="text-5xl" role="img" aria-label="Tiger">🐯</span>
        </div>
      )}

      {/* Card content */}
      <div className="flex flex-col gap-3 p-5 flex-1">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{title}</h2>
        {body.map((para, i) => (
          <p key={i} className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {para}
          </p>
        ))}
      </div>
    </article>
  );
}

// ─── Loading Screen ─────────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-zinc-900"
      role="status"
      aria-live="polite"
    >
      {/* Full image (no cropping, no rounding, no clipping) */}
      <img
        src="/lilvic.png"
        alt="Tiny Tigers mascot"
        className="mb-6 max-w-50 h-auto"
      />

      <p className="text-xl font-semibold text-[#FFB300] animate-pulse">
        Loading Tiny Tigers…
      </p>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────
export default function HomePage() {
  const three = useThree();
  const scene = three?.scene ?? null;
  const camera = three?.camera ?? null;

  const [cards, setCards] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Three.js planes for accessibility overlay positioning
  const cardPlanesRef = useRef<THREE.Mesh[]>([]);
  const focusedIndexRef = useRef<number | null>(null);

  // ── Responsive breakpoint ──────────────────────────────────────────────────
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ── Caching & data fetch (deterministic flow) ──────────────────────────────
  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(CACHE_KEY) : null;
    let cached: CacheEntry | null = null;
    try {
      if (raw) cached = JSON.parse(raw) as CacheEntry;
    } catch {
      cached = null;
    }

    const now = Date.now();
    const cacheAge = cached ? now - cached.lastUpdated : Infinity;
    const cacheValid = cacheAge < CACHE_TTL;

    const fetchFresh = (isBackground: boolean) =>
      fetch(`${API_BASE}/cards/items`)
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json() as Promise<CardItem[]>;
        })
        .then((freshData) => {
          const freshTimestamp = Date.now();
          // Always update cache on a successful fetch — backend data is authoritative
          if (!cached || freshTimestamp > cached.lastUpdated) {
            const entry: CacheEntry = { data: freshData, lastUpdated: freshTimestamp };
            localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
            if (!isBackground || !cacheValid) {
              setCards(freshData);
            } else {
              // Background: update state with fresh data
              setCards(freshData);
            }
          }
          if (!isBackground) setLoading(false);
        })
        .catch(() => {
          if (!isBackground) {
            // Backend unreachable on initial load
            if (cached) {
              setCards(cached.data);
            } else {
              // No cache, no backend → use Figma defaults
              setCards(DEFAULT_CARDS);
            }
            setLoading(false);
          }
          // Background failure: silently keep current cache
        });

    if (cached && cacheValid) {
      // 3. Cache exists and is fresh → render immediately, background refresh
      setCards(cached.data);
      setLoading(false);
      fetchFresh(true);
    } else {
      // 2 / 5. No cache, or TTL expired → show loading, fetch first
      setLoading(true);
      fetchFresh(false);
    }
  }, []);

  // ── Create Three.js plane meshes for each card (page-specific objects) ──────
  useEffect(() => {
    if (!scene || cards.length === 0) return;

    // Clean up old planes
    cardPlanesRef.current.forEach((mesh) => {
      scene.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    });
    cardPlanesRef.current = [];

    // Create one invisible plane per card — used for screen-reader overlay positioning
    cards.forEach((_, i) => {
      const geometry = new THREE.PlaneGeometry(3.2, 2.2);
      geometry.computeBoundingBox();
      const material = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geometry, material);
      // Spread planes in a vertical column behind content
      mesh.position.set(0, 1.5 - i * 2.6, -1);
      scene.add(mesh);
      cardPlanesRef.current.push(mesh);
    });

    // Cleanup on unmount (page navigation)
    return () => {
      cardPlanesRef.current.forEach((mesh) => {
        scene.remove(mesh);
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      });
      cardPlanesRef.current = [];
    };
  }, [scene, cards]);

  // ── updateOverlayPosition — implemented exactly as specified ─────────────────
  //    Positions #overlay-text over the focused card's Three.js plane projection.
  const updateOverlayPosition = useCallback(() => {
    const el = document.getElementById('overlay-text');
    if (!el || focusedIndexRef.current === null || !camera) return;

    const mesh = cardPlanesRef.current[focusedIndexRef.current];
    if (!mesh) return;

    // Bind required closure variables with the exact names from the spec
    const textGeometry = mesh.geometry;
    const text = mesh;

    if (!textGeometry.boundingBox) textGeometry.computeBoundingBox();
    if (!textGeometry.boundingBox) return;

    const min = textGeometry.boundingBox.min.clone();
    const max = textGeometry.boundingBox.max.clone();

    min.applyMatrix4(text.matrixWorld);
    max.applyMatrix4(text.matrixWorld);

    min.project(camera);
    max.project(camera);

    const x1 = (min.x * 0.5 + 0.5) * window.innerWidth;
    const y1 = (-(min.y * 0.5) + 0.5) * window.innerHeight;

    const x2 = (max.x * 0.5 + 0.5) * window.innerWidth;
    const y2 = (-(max.y * 0.5) + 0.5) * window.innerHeight;

    const left = Math.min(x1, x2);
    const top = Math.min(y1, y2);
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);

    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
    el.style.fontSize = `${height}px`;

    const actualWidth = el.offsetWidth;
    const scaleX = width / actualWidth;

    el.style.transform = `scaleX(${scaleX})`;
    el.style.transformOrigin = 'left top';
  }, [camera]);

  // Call updateOverlayPosition on card focus
  const handleCardFocus = useCallback(
    (index: number) => {
      focusedIndexRef.current = index;
      updateOverlayPosition();
    },
    [updateOverlayPosition],
  );

  // ─── Render ────────────────────────────────────────────────────────────────
  if (loading) return <LoadingScreen />;

  return (
    <>
      {/* ── Screen-reader overlay — positioned by updateOverlayPosition ────── */}
      <div
        id="overlay-text"
        role="status"
        aria-live="polite"
        className="fixed pointer-events-none select-none"
        style={{
          position: 'fixed',
          zIndex: 5,
          // Visually hidden but not display:none so getBoundingClientRect works
          clip: 'rect(0 0 0 0)',
          clipPath: 'inset(50%)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          width: '1px',
          height: '1px',
        }}
      >
        {focusedIndexRef.current !== null && cards[focusedIndexRef.current]
          ? cards[focusedIndexRef.current].paragraph.join(' ')
          : ''}
      </div>

      {/* ── Sticky header ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 bg-[#FFB300] shadow-md">
        <div className="flex items-center gap-3">
          <img
            src="/lilvic.png"
            alt="Tiny Tigers mascot"
            className="w-10 h-10"
          />

          <span className="text-xl font-bold text-zinc-900 tracking-tight">
            Tiny Tigers Daycare
          </span>
        </div>

        <nav aria-label="Main navigation">
          <a
            href="/waitlist"
            className="inline-block rounded-full bg-zinc-900 text-white text-sm font-semibold px-5 py-2 hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-4 focus:ring-white"
          >
            Join Waitlist
          </a>
        </nav>
      </header>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main
        className="relative z-10 mx-auto w-full max-w-5xl px-4 py-12"
        id="main-content"
      >
        {/* Hero */}
        <section className="mb-16 text-center" aria-labelledby="hero-heading">
          <h1
            id="hero-heading"
            className="text-4xl font-extrabold text-zinc-900 dark:text-white mb-4 tracking-tight"
          >
            TINY TIGERS CHILD CARE FACILITY
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            A safe, nurturing environment where children learn through play, creativity, and cooperation.
          </p>
        </section>

        {/* Cards grid */}
        <section
          aria-label="Program information cards"
          className={`grid gap-8 ${
            isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'
          }`}
          style={{ perspective: '1200px' }}
        >
          {cards.map((card, i) => (
            <Card
              key={i}
              card={card}
              index={i}
              isMobile={isMobile}
              onFocus={handleCardFocus}
            />
          ))}
        </section>

        {/* Head Staff section */}
        <section
          aria-labelledby="staff-heading"
          className="mt-20 rounded-2xl bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm border border-zinc-200 dark:border-zinc-700 p-8 flex flex-col sm:flex-row items-start gap-6 z-10 relative"
        >
          <div
            className="w-16 h-16 rounded-full bg-[#FFB300]/30 flex items-center justify-center flex-shrink-0"
            aria-hidden="true"
          >
            <span className="text-3xl">👤</span>
          </div>
          <div>
            <h2 id="staff-heading" className="text-lg font-bold mb-1 text-zinc-900 dark:text-white">
              Head Staff
            </h2>
            <p className="font-semibold text-zinc-800 dark:text-zinc-200">Head Position Name</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Head Position Holder Name</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Contact: (888) 888-8888</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">
              Tiny Tigers is under Fort Hays Tech Northwest
            </p>
          </div>
        </section>

        {/* Parent Resources */}
        <section
          aria-labelledby="resources-heading"
          className="mt-8 flex flex-col sm:flex-row gap-4 z-10 relative"
        >
          <h2 id="resources-heading" className="sr-only">Parent Resources</h2>
          <a
            href="#parent-handbook"
            className="flex-1 text-center rounded-full border-2 border-[#FFB300] text-[#FFB300] font-semibold py-3 px-6 hover:bg-[#FFB300] hover:text-zinc-900 transition-colors focus:outline-none focus:ring-4 focus:ring-[#FFB300]"
          >
            PARENT HANDBOOK
          </a>
          <a
            href="/waitlist"
            className="flex-1 text-center rounded-full bg-[#FFB300] text-zinc-900 font-semibold py-3 px-6 hover:bg-[#e6a000] transition-colors focus:outline-none focus:ring-4 focus:ring-[#FFB300]"
          >
            TINY TIGERS WAITLIST FORM →
          </a>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="relative z-10 mt-16 border-t border-zinc-200 dark:border-zinc-700 py-6 text-center text-sm text-zinc-500 dark:text-zinc-500">
        © {new Date().getFullYear()} Tiny Tigers Child Care Facility — Fort Hays Tech Northwest
      </footer>
    </>
  );
}
