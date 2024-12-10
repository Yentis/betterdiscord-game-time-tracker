import { TrackedGame } from '../services/gameService';

export default interface Settings {
  games: Record<string, TrackedGame>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Setting<T = any> = {
  id: string;
  name?: string;
  note?: string;
  value?: T;
  inline?: boolean;
  disabled?: boolean;
  onChange?: (value: T) => void;
};
