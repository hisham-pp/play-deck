import { useEffect, useRef, useState } from 'react';
import type { Ball } from '../engine/mini-golf-types';

interface UseMiniGolfControlsOptions {
  ball: Ball;
  isAiming: boolean;
  disabled: boolean;
  onShoot: (angle: number, power: number) => void;
  onAimUpdate: (angle: number, power: number) => void;
  onAimCancel: () => void;
  onToggleFullscreen?: () => void;
  onResetHole?: () => void;
}

export function useMiniGolfControls({
  ball,
  isAiming,
  disabled,
  onShoot,
  onAimUpdate,
  onAimCancel,
  onToggleFullscreen,
  onResetHole,
}: UseMiniGolfControlsOptions) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragCurrent, setDragCurrent] = useState<{ x: number; y: number } | null>(null);
  const [keyAimAngle, setKeyAimAngle] = useState<number>(0);
  const [keyPower, setKeyPower] = useState<number>(0);
  const isChargingSpaceRef = useRef(false);
  const chargeStartRef = useRef<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Helper to get canvas relative coordinates
  const getCanvasCoords = (e: MouseEvent | Touch): { x: number; y: number } | null => {
    if (!canvasRef.current) return null;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = 800 / rect.width;
    const scaleY = 600 / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  // Pointer Down (Mouse or Touch)
  const handlePointerDown = (clientX: number, clientY: number) => {
    if (!isAiming || disabled) return;
    const coords = getCanvasCoords({ clientX, clientY } as Touch);
    if (!coords) return;

    setIsDragging(true);
    setDragCurrent(coords);

    // Calculate initial pull angle and power
    const dx = ball.x - coords.x;
    const dy = ball.y - coords.y;
    const dist = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);
    const power = Math.min(1.0, dist / 180);

    onAimUpdate(angle, power);
  };

  // Pointer Move
  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!isDragging || !isAiming || disabled) return;
    const coords = getCanvasCoords({ clientX, clientY } as Touch);
    if (!coords) return;

    setDragCurrent(coords);

    const dx = ball.x - coords.x;
    const dy = ball.y - coords.y;
    const dist = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);
    const power = Math.min(1.0, dist / 180);

    onAimUpdate(angle, power);
  };

  // Pointer Up
  const handlePointerUp = () => {
    if (!isDragging || !isAiming || disabled) {
      setIsDragging(false);
      setDragCurrent(null);
      return;
    }

    if (dragCurrent) {
      const dx = ball.x - dragCurrent.x;
      const dy = ball.y - dragCurrent.y;
      const dist = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);
      const power = Math.min(1.0, dist / 180);

      if (power >= 0.05) {
        onShoot(angle, power);
      } else {
        onAimCancel();
      }
    }

    setIsDragging(false);
    setDragCurrent(null);
  };

  // Mouse Listeners
  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return;
    handlePointerDown(e.clientX, e.clientY);
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    handlePointerMove(e.clientX, e.clientY);
  };

  const onMouseUp = () => {
    handlePointerUp();
  };

  // Touch Listeners
  const onTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const onTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const onTouchEnd = () => {
    handlePointerUp();
  };

  // Keyboard Aiming & Charging
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      if (e.code === 'KeyF' && onToggleFullscreen) {
        onToggleFullscreen();
        return;
      }

      if (e.code === 'KeyR' && onResetHole) {
        onResetHole();
        return;
      }

      if (!isAiming || disabled) return;

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        setKeyAimAngle((prev) => {
          const next = prev - 0.08;
          onAimUpdate(next, keyPower || 0.4);
          return next;
        });
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        setKeyAimAngle((prev) => {
          const next = prev + 0.08;
          onAimUpdate(next, keyPower || 0.4);
          return next;
        });
      } else if (e.code === 'Space' && !isChargingSpaceRef.current) {
        e.preventDefault();
        isChargingSpaceRef.current = true;
        chargeStartRef.current = Date.now();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isChargingSpaceRef.current) {
        isChargingSpaceRef.current = false;
        if (chargeStartRef.current && isAiming && !disabled) {
          const elapsedMs = Date.now() - chargeStartRef.current;
          // Charge full power in 1.2 seconds
          const power = Math.min(1.0, Math.max(0.1, elapsedMs / 1200));
          onShoot(keyAimAngle, power);
        }
        chargeStartRef.current = null;
        setKeyPower(0);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [
    isAiming,
    disabled,
    keyAimAngle,
    keyPower,
    onShoot,
    onAimUpdate,
    onToggleFullscreen,
    onResetHole,
  ]);

  return {
    canvasRef,
    isDragging,
    dragCurrent,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}
