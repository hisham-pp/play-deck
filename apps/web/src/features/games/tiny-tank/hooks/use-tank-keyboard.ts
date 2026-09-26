import { useEffect } from 'react';
import {
  DEFAULT_PLAYER_ID,
  WEAPON_BOUNCING,
  WEAPON_CANNON,
  WEAPON_HOMING,
  WEAPON_LASER,
  WEAPON_MINE,
  WEAPON_RUBBER,
  type TankInput,
  type WeaponType,
} from '../types/tiny-tank.types';

const DIGIT_WEAPON_MAP: Record<string, WeaponType> = {
  Digit1: WEAPON_CANNON,
  Digit2: WEAPON_BOUNCING,
  Digit3: WEAPON_HOMING,
  Digit4: WEAPON_MINE,
  Digit5: WEAPON_LASER,
  Digit6: WEAPON_RUBBER,
};

function updateMovementKey(p1: TankInput, code: string, pressed: boolean) {
  if (code === 'KeyW' || code === 'ArrowUp') p1.moveForward = pressed;
  if (code === 'KeyS' || code === 'ArrowDown') p1.moveBackward = pressed;
  if (code === 'KeyA' || code === 'ArrowLeft') p1.turnLeft = pressed;
  if (code === 'KeyD' || code === 'ArrowRight') p1.turnRight = pressed;
  if (code === 'Space') p1.fire = pressed;
}

export function useTankKeyboardControls(
  inputsRef: React.MutableRefObject<Record<string, TankInput>>,
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const p1 = inputsRef.current[DEFAULT_PLAYER_ID];
      if (!p1) return;

      updateMovementKey(p1, e.code, true);
      if (e.code === 'Space') e.preventDefault();

      if (DIGIT_WEAPON_MAP[e.code]) {
        p1.switchWeapon = DIGIT_WEAPON_MAP[e.code];
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const p1 = inputsRef.current[DEFAULT_PLAYER_ID];
      if (!p1) return;

      updateMovementKey(p1, e.code, false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [inputsRef]);
}
