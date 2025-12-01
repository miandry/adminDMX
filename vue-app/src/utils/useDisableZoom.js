// src/composables/useDisableZoom.js
import { onMounted, onUnmounted } from "vue";
import { useEventListener } from "@vueuse/core";

export default function useDisableZoom() {
  let stopWheel, stopKeydown, stopTouchStart, stopTouchMove, stopGestureStart;

  onMounted(() => {
    // 1) Empêcher Ctrl/Cmd + molette (desktop)
    stopWheel = useEventListener(
      window,
      "wheel",
      (e) => {
        // si Ctrl (ou Meta sur certains OS) est pressé, empêcher le zoom
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
        }
      },
      { passive: false }
    );

    // 2) Empêcher les raccourcis claviers de zoom : Ctrl/Cmd + (+/-/0/=)
    stopKeydown = useEventListener(
      window,
      "keydown",
      (e) => {
        const key = e.key?.toLowerCase?.();
        const ctrlOrMeta = e.ctrlKey || e.metaKey;
        // couvrir "+", "=", "-", "0" (différents navigateurs émettent = ou +)
        if (
          ctrlOrMeta &&
          (key === "+" || key === "=" || key === "-" || key === "0")
        ) {
          e.preventDefault();
        }
      },
      { passive: false }
    );

    // 3) Empêcher pinch-zoom mobile / tactile quand il y a >=2 touches
    // On capte touchstart & touchmove : si touches >= 2, preventDefault()
    stopTouchStart = useEventListener(
      window,
      "touchstart",
      (e) => {
        if (e.touches && e.touches.length > 1) {
          e.preventDefault();
        }
      },
      { passive: false }
    );

    stopTouchMove = useEventListener(
      window,
      "touchmove",
      (e) => {
        if (e.touches && e.touches.length > 1) {
          e.preventDefault();
        }
      },
      { passive: false }
    );

    // 4) iOS Safari: events "gesturestart/gesturechange/gestureend" existent — on les bloque aussi
    stopGestureStart = useEventListener(
      window,
      "gesturestart",
      (e) => e.preventDefault(),
      { passive: false }
    );
  });

  onUnmounted(() => {
    // arrête les écouteurs quand composable est démonté (sécurité)
    if (stopWheel) stopWheel();
    if (stopKeydown) stopKeydown();
    if (stopTouchStart) stopTouchStart();
    if (stopTouchMove) stopTouchMove();
    if (stopGestureStart) stopGestureStart();
  });
}
