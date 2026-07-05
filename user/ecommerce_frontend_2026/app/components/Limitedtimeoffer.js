'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/app/lib/api';
import Cards from '@/app/components/cards';

function OfferCarousel({ products }) {
  const scrollRef = useRef(null);
  const resumeTimerRef = useRef(null);
  const manualFrameRef = useRef(null);
  const autoScrollLeftRef = useRef(0);
  const loopWidthRef = useRef(0);
  const pausedRef = useRef(false);
  const [interactionPaused, setInteractionPaused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const canLoop = products.length > 1;
  const isPaused = userPaused || interactionPaused || prefersReducedMotion;
  const displayProducts = canLoop ? Array.from({ length: 6 }, () => products).flat() : products;

  const getLoopPoint = useCallback((element) => {
    const firstRepeatedCard = element.children[products.length];
    if (!firstRepeatedCard || !element.firstElementChild) return 0;

    return firstRepeatedCard.offsetLeft - element.firstElementChild.offsetLeft;
  }, [products.length]);

  const normalizeScroll = useCallback((element) => {
    const loopPoint = loopWidthRef.current || getLoopPoint(element);
    if (loopPoint <= 0) return;

    loopWidthRef.current = loopPoint;

    if (element.scrollLeft >= loopPoint) {
      element.scrollLeft %= loopPoint;
    }

    autoScrollLeftRef.current = element.scrollLeft;
  }, [getLoopPoint]);

  const pauseForInteraction = useCallback(() => {
    window.clearTimeout(resumeTimerRef.current);
    setInteractionPaused(true);
  }, []);

  const resumeSoon = useCallback(() => {
    window.clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = window.setTimeout(() => setInteractionPaused(false), 900);
  }, []);

  useEffect(() => {
    pausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateReducedMotion = () => setPrefersReducedMotion(motionQuery.matches);

    updateReducedMotion();
    motionQuery.addEventListener('change', updateReducedMotion);

    return () => motionQuery.removeEventListener('change', updateReducedMotion);
  }, []);

  useEffect(() => {
    if (!canLoop) return undefined;

    let frameId;
    let lastTime;
    const pixelsPerSecond = 60;

    const tick = (time) => {
      const element = scrollRef.current;
      if (!element) {
        frameId = requestAnimationFrame(tick);
        return;
      }

      if (lastTime === undefined) {
        lastTime = time;
      }

      loopWidthRef.current = getLoopPoint(element);

      if (!pausedRef.current && loopWidthRef.current > 0) {
        autoScrollLeftRef.current += ((time - lastTime) / 1000) * pixelsPerSecond;

        if (autoScrollLeftRef.current >= loopWidthRef.current) {
          autoScrollLeftRef.current %= loopWidthRef.current;
        }

        element.scrollLeft = autoScrollLeftRef.current;
        normalizeScroll(element);
      }

      lastTime = time;
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameId);
  }, [canLoop, getLoopPoint, normalizeScroll]);

  useEffect(() => {
    loopWidthRef.current = 0;
    window.clearTimeout(resumeTimerRef.current);
    cancelAnimationFrame(manualFrameRef.current);
    autoScrollLeftRef.current = 0;

    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
    }

    return () => {
      window.clearTimeout(resumeTimerRef.current);
      cancelAnimationFrame(manualFrameRef.current);
    };
  }, [products]);

  const move = (direction) => {
    const element = scrollRef.current;
    if (!element) return;

    const firstCard = element.firstElementChild;
    if (!firstCard) return;

    pauseForInteraction();
    window.clearTimeout(resumeTimerRef.current);
    cancelAnimationFrame(manualFrameRef.current);
    loopWidthRef.current = getLoopPoint(element);

    const loopPoint = loopWidthRef.current;
    const step = Math.max(firstCard.getBoundingClientRect().width + 12, 180);
    let start = element.scrollLeft;

    if (direction < 0 && loopPoint > 0 && start < step) {
      start += loopPoint;
      element.scrollLeft = start;
    }

    const target = start + direction * step;
    const duration = 560;
    const startedAt = performance.now();

    const animate = (time) => {
      const progress = Math.min((time - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      autoScrollLeftRef.current = start + (target - start) * eased;
      element.scrollLeft = Math.round(autoScrollLeftRef.current);

      if (progress < 1) {
        manualFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      normalizeScroll(element);
      resumeSoon();
    };

    manualFrameRef.current = requestAnimationFrame(animate);
  };

  return (
    <div
      aria-label="Offer carousel"
      className="relative w-full max-w-full overflow-hidden"
      role="region"
      onMouseEnter={pauseForInteraction}
      onMouseLeave={resumeSoon}
      onFocus={pauseForInteraction}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          resumeSoon();
        }
      }}
      onTouchStart={pauseForInteraction}
      onTouchEnd={resumeSoon}
    >
      <Cards
        products={displayProducts}
        layout="scroll"
        scrollRef={scrollRef}
        onTouchStart={pauseForInteraction}
        onTouchEnd={resumeSoon}
        onScroll={(event) => {
          if (pausedRef.current) {
            autoScrollLeftRef.current = event.currentTarget.scrollLeft;
          }

          normalizeScroll(event.currentTarget);
        }}
      />
      {canLoop && (
        <>
          <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-[5] w-5 bg-gradient-to-r from-slate-50 to-transparent sm:w-16" />
          <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-[5] w-5 bg-gradient-to-l from-slate-50 to-transparent sm:w-16" />
        </>
      )}
      {canLoop && (
        <>
          <button
            type="button"
            onClick={() => move(-1)}
            aria-label="Previous offers"
            className="group absolute left-1 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/80 bg-white/95 text-slate-900 shadow-xl ring-1 ring-slate-900/10 transition hover:scale-105 hover:bg-rose-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 sm:left-2 sm:h-12 sm:w-12"
          >
            <span className="h-3 w-3 translate-x-0.5 rotate-45 border-b-[3px] border-l-[3px] border-current sm:h-3.5 sm:w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            aria-label="Next offers"
            className="group absolute right-1 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/80 bg-white/95 text-slate-900 shadow-xl ring-1 ring-slate-900/10 transition hover:scale-105 hover:bg-rose-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 sm:right-2 sm:h-12 sm:w-12"
          >
            <span className="h-3 w-3 -translate-x-0.5 rotate-45 border-r-[3px] border-t-[3px] border-current sm:h-3.5 sm:w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              window.clearTimeout(resumeTimerRef.current);
              setInteractionPaused(false);
              setUserPaused((current) => !current);
            }}
            aria-label={userPaused ? 'Play offer carousel' : 'Pause offer carousel'}
            aria-pressed={userPaused}
            className="absolute right-2 top-2 z-10 grid h-9 w-9 place-items-center rounded-full border border-white/80 bg-white/95 text-slate-900 shadow-lg ring-1 ring-slate-900/10 transition hover:bg-rose-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 sm:h-10 sm:w-10"
          >
            {userPaused ? (
              <span className="ml-0.5 block h-0 w-0 border-y-[7px] border-l-[11px] border-y-transparent border-l-current" />
            ) : (
              <span className="flex h-4 w-4 items-center justify-center gap-1">
                <span className="h-4 w-1.5 rounded-sm bg-current" />
                <span className="h-4 w-1.5 rounded-sm bg-current" />
              </span>
            )}
          </button>
        </>
      )}
    </div>
  );
}

export default function Limitedtimeoffer() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setOffers(await apiFetch('/offers'));
      } catch (error) {
        console.error(error);
        setOffers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const groupedOffers = offers.reduce((groups, offer) => {
    const title = offer.offer_group || offer.offer_title || 'Limited Time Offer';
    groups[title] = [...(groups[title] || []), offer];
    return groups;
  }, {});
  const groupEntries = Object.entries(groupedOffers);

  return (
    <section id="offers" className="mx-auto w-full max-w-7xl bg-slate-50 px-3 py-6 sm:px-5">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-rose-600">Do not miss</p>
          <h2 className="text-2xl font-bold text-slate-950">Limited Time Offer</h2>
        </div>
      </div>
      {loading ? (
        <div className="rounded-md bg-white p-6 text-center text-sm text-slate-500 shadow-sm">Loading offers...</div>
      ) : groupEntries.length === 0 ? (
        <div className="rounded-md bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
          No limited time offers are active right now.
        </div>
      ) : (
        <div className="space-y-7">
          {groupEntries.map(([title, products]) => (
            <div key={title}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                <span className="text-sm font-semibold text-rose-600">{products.length} deals</span>
              </div>
              <OfferCarousel products={products} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
