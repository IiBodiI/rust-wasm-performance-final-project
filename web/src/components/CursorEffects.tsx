import { useEffect, useRef, useState } from "react";

export function CursorEffects() {
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);
  const rafRef = useRef<number | null>(null);
  const pointRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointerQuery = window.matchMedia("(pointer: fine)");

    const updateAvailability = () => {
      setEnabled(pointerQuery.matches && !motionQuery.matches);
    };

    updateAvailability();
    motionQuery.addEventListener("change", updateAvailability);
    pointerQuery.addEventListener("change", updateAvailability);

    return () => {
      motionQuery.removeEventListener("change", updateAvailability);
      pointerQuery.removeEventListener("change", updateAvailability);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const root = document.documentElement;
    const updatePosition = () => {
      rafRef.current = null;
      root.style.setProperty("--cursor-x", `${pointRef.current.x}px`);
      root.style.setProperty("--cursor-y", `${pointRef.current.y}px`);
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointRef.current = { x: event.clientX, y: event.clientY };
      setActive(true);
      if (rafRef.current === null) {
        rafRef.current = window.requestAnimationFrame(updatePosition);
      }
    };

    const handlePointerLeave = () => setActive(false);

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener("pointerleave", handlePointerLeave);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className={active ? "cursor-effects cursor-effects-active" : "cursor-effects"}>
      {Array.from({ length: 9 }).map((_, index) => (
        <span className="cursor-bubble" key={index} />
      ))}
    </div>
  );
}
