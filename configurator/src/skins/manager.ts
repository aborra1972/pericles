export type SkinState =
  | 'idle'
  | 'happy'
  | 'thinking'
  | 'surprised'
  | 'funny'
  | 'angry'
  | 'listening'
  | 'speaking';

export interface Skin {
  name: string;
  displayName: string;
  states: SkinState[];
  isDefault: boolean;
}

const REQUIRED_STATES: SkinState[] = [
  'idle', 'happy', 'thinking', 'surprised',
  'funny', 'angry', 'listening', 'speaking',
];

const BUILTIN_SKINS: Skin[] = [
  { name: 'default', displayName: 'Pericles Default', states: [...REQUIRED_STATES], isDefault: true },
  { name: 'minimal', displayName: 'Minimal', states: [...REQUIRED_STATES], isDefault: false },
  { name: 'colorful', displayName: 'Colorful', states: [...REQUIRED_STATES], isDefault: false },
  { name: 'dark', displayName: 'Dark Mode', states: [...REQUIRED_STATES], isDefault: false },
  { name: 'retro', displayName: 'Retro', states: [...REQUIRED_STATES], isDefault: false },
];

export class SkinManager {
  private skins: Skin[];

  constructor() {
    this.skins = [...BUILTIN_SKINS];
  }

  list(): Skin[] {
    return [...this.skins];
  }

  getByName(name: string): Skin | null {
    return this.skins.find((s) => s.name === name) ?? null;
  }

  getDefault(): Skin {
    return this.skins.find((s) => s.isDefault) ?? this.skins[0];
  }

  preview(skinName: string, state: SkinState): { svg: string } | null {
    const skin = this.getByName(skinName);
    if (!skin) return null;
    return {
      svg: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="white" stroke="black"/><text x="50" y="55" text-anchor="middle" font-size="14">${state}</text></svg>`,
    };
  }

  validate(skinName: string): boolean {
    const skin = this.getByName(skinName);
    if (!skin) return false;
    return REQUIRED_STATES.every((state) => skin.states.includes(state));
  }
}
