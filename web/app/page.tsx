'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { useThree } from './context/ThreeContext';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface CardItem {
  link: string;
  paragraph: string[];
}

interface StaffCard {
  image: string;
  role: string;
  name: string;
  phone: string;
}

interface CacheEntry {
  data: CardItem[];
  lastUpdated: number;
}

// ─── Constants ─────────────────────────────────────────────────────────────────
const CACHE_KEY = 'tiny_tigers_cards';
const CACHE_TTL = 30 * 60 * 1000;
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

// ─── Default fallback cards ────────────────────────────────────────────────────
const DEFAULT_CARDS: CardItem[] = [
  {
    link: '',
    paragraph: [
      'Welcome',
      "Tiny Tigers Daycare offers a safe, nurturing environment where children learn through hands-on activities, play, and cooperation.",
    ],
  },
];

// ─── Card Component ────────────────────────────────────────────────────────────
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

  const side = index % 2 === 0 ? 'left' : 'right';

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !entered) {
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

  const getTransform = () => {
    if (visible) return 'translateY(0) rotateX(0deg) translateX(0)';

    if (isMobile) {
      return side === 'left'
        ? 'translateX(-120%)'
        : 'translateX(120%)';
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
        transition:
          'transform 0.65s cubic-bezier(0.22,1,0.36,1), opacity 0.65s ease',
        perspective: '800px',
        transformStyle: 'preserve-3d',
      }}
      className="relative z-10 flex flex-col rounded-2xl overflow-hidden shadow-lg bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-4 focus:ring-[#FFB300]"
    >
      {card.link ? (
        <img
          src={card.link}
          alt={title}
          className="w-full h-48 object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-48 bg-[#FFB300]/20 flex items-center justify-center">
          <span className="text-5xl">🐯</span>
        </div>
      )}

      <div className="flex flex-col gap-3 p-5 flex-1">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
          {title}
        </h2>

        {body.map((para, i) => (
          <p
            key={i}
            className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300"
          >
            {para}
          </p>
        ))}
      </div>
    </article>
  );
}

// ─── Loading Screen ────────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-zinc-900">
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

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const three = useThree();
  const scene = three?.scene ?? null;
  const camera = three?.camera ?? null;

  const [cards, setCards] = useState<CardItem[]>([]);
  const [staff, setStaff] = useState<StaffCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const cardPlanesRef = useRef<THREE.Mesh[]>([]);
  const focusedIndexRef = useRef<number | null>(null);

  // ─── Responsive ────────────────────────────────────────────────────────────
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);

    check();

    window.addEventListener('resize', check);

    return () => window.removeEventListener('resize', check);
  }, []);

  // ─── Fetch Cards ───────────────────────────────────────────────────────────
  useEffect(() => {
    const raw =
      typeof window !== 'undefined'
        ? localStorage.getItem(CACHE_KEY)
        : null;

    let cached: CacheEntry | null = null;

    try {
      if (raw) cached = JSON.parse(raw);
    } catch {
      cached = null;
    }

    const now = Date.now();
    const cacheAge = cached ? now - cached.lastUpdated : Infinity;
    const cacheValid = cacheAge < CACHE_TTL;

    const fetchFresh = async (isBackground: boolean) => {
      try {
        // Main cards
        const cardsResponse = await fetch(`${API_BASE}/cards/items`);
        const cardsData = await cardsResponse.json();

        // Staff card
        const staffResponse = await fetch(
          `${API_BASE}/cards/getStaffCardByNumber/1`,
        );

        const staffData = await staffResponse.json();

        const mappedStaff: StaffCard = {
          image: staffData?.[0] ?? '',
          role: staffData?.[1] ?? '',
          name: staffData?.[2] ?? '',
          phone: staffData?.[3] ?? '',
        };

        setStaff(mappedStaff);

        const entry: CacheEntry = {
          data: cardsData,
          lastUpdated: Date.now(),
        };

        localStorage.setItem(CACHE_KEY, JSON.stringify(entry));

        setCards(cardsData);

        if (!isBackground) setLoading(false);
      } catch {
        if (cached) {
          setCards(cached.data);
        } else {
          setCards(DEFAULT_CARDS);
        }

        if (!isBackground) setLoading(false);
      }
    };

    if (cached && cacheValid) {
      setCards(cached.data);
      setLoading(false);

      fetchFresh(true);
    } else {
      fetchFresh(false);
    }
  }, []);

  // ─── Three.js planes ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!scene || cards.length === 0) return;

    cardPlanesRef.current.forEach((mesh) => {
      scene.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    });

    cardPlanesRef.current = [];

    cards.forEach((_, i) => {
      const geometry = new THREE.PlaneGeometry(3.2, 2.2);

      geometry.computeBoundingBox();

      const material = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(geometry, material);

      mesh.position.set(0, 1.5 - i * 2.6, -1);

      scene.add(mesh);

      cardPlanesRef.current.push(mesh);
    });

    return () => {
      cardPlanesRef.current.forEach((mesh) => {
        scene.remove(mesh);
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      });

      cardPlanesRef.current = [];
    };
  }, [scene, cards]);

  // ─── Overlay Position ──────────────────────────────────────────────────────
  const updateOverlayPosition = useCallback(() => {
    const el = document.getElementById('overlay-text');

    if (!el || focusedIndexRef.current === null || !camera) return;

    const mesh = cardPlanesRef.current[focusedIndexRef.current];

    if (!mesh) return;

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
      <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 bg-[#FFB300] shadow-md">
        <div className="flex items-center gap-3">
          <a href="/">
            <img
            src="/lilvic.png"
            alt="Tiny Tigers mascot"
            className="w-10 h-10"
            />
          </a>
          

          <span className="text-xl font-bold text-zinc-900 tracking-tight">
            Tiny Tigers Daycare
          </span>
        </div>

        <a
          href="/waitlist"
          className="inline-block rounded-full bg-zinc-900 text-white text-sm font-semibold px-5 py-2"
        >
          Join Waitlist
        </a>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-5xl px-4 py-12">
        <section className="mb-16 text-center">
          <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-white mb-4 tracking-tight">
            TINY TIGERS CHILD CARE FACILITY
          </h1>

          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            A safe, nurturing environment where children learn through play,
            creativity, and cooperation.
          </p>
        </section>

        <section
          className={`grid gap-8 ${
            isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'
          }`}
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
      </main>

      <footer className="relative z-10 mt-16 border-t border-zinc-200 dark:border-zinc-700 py-10 text-sm text-zinc-500 dark:text-zinc-500">
        <div className="max-w-5xl mx-auto px-6 flex flex-col gap-10">

          {/* Head Staff Card */}
          <section
            aria-labelledby="staff-heading"
            className="rounded-2xl bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm border border-zinc-200 dark:border-zinc-700 p-8 flex flex-col sm:flex-row items-start gap-6"
          >
            <div
              className="w-20 h-20 rounded-full overflow-hidden bg-[#FFB300]/30 flex items-center justify-center flex-shrink-0"
              aria-hidden="true"
            >
              {staff?.image ? (
                <img
                  src={staff.image}
                  alt={staff.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl">👤</span>
              )}
            </div>

            <div className="w-full flex flex-col">
              <h2
                id="staff-heading"
                className="text-lg font-bold mb-1 text-zinc-900 dark:text-white"
              >
                {staff?.role || 'Head Staff'}
              </h2>

              <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                {staff?.name || 'Loading...'}
              </p>

              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Contact: {staff?.phone || '—'}
              </p>


            </div>
          </section>

          {/* Parent Resources */}
          <section className="flex flex-col sm:flex-row gap-4">
            <a
              href="https://www.fhnw.edu/document_center/download/tiny-tigers-daycare/Parent_Handbook-1-1.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center rounded-full border-2 border-[#FFB300] text-[#FFB300] font-semibold py-3 px-6 hover:bg-[#FFB300] hover:text-zinc-900 transition-colors"
            >
              PARENT HANDBOOK
            </a>

            <a
              href="/waitlist"
              className="flex-1 text-center rounded-full bg-[#FFB300] text-zinc-900 font-semibold py-3 px-6 hover:bg-[#e6a000] transition-colors"
            >
              TINY TIGERS WAITLIST FORM →
            </a>
          </section>

          {/* Copyright */}
          <div className="text-center text-xs text-zinc-500 pt-4 border-t border-zinc-200 dark:border-zinc-700">
            <p>Tiny Tigers is under Fort Hays Tech Northwest</p>
            © {new Date().getFullYear()} Tiny Tigers Child Care Facility — Fort
            Hays Tech Northwest
          </div>
        </div>
      </footer>
    </>
  );
}