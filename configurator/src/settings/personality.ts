export type PersonalityStyle = 'casual' | 'formal' | 'playful' | 'serious';

export interface PersonalityConfig {
  name: string;
  style: PersonalityStyle;
  language: string;
}

const VALID_STYLES: PersonalityStyle[] = ['casual', 'formal', 'playful', 'serious'];

const DEFAULT_CONFIG: PersonalityConfig = {
  name: 'Pericles',
  style: 'casual',
  language: 'es',
};

export class PersonalitySettings {
  private config: PersonalityConfig;

  constructor(config?: Partial<PersonalityConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  get(): PersonalityConfig {
    return { ...this.config };
  }

  update(update: Partial<PersonalityConfig>): void {
    if (update.style && !VALID_STYLES.includes(update.style)) {
      throw new Error(`Invalid style: ${update.style}`);
    }
    this.config = { ...this.config, ...update };
  }

  toJSON(): string {
    return JSON.stringify(this.config);
  }

  static fromJSON(json: string): PersonalitySettings {
    const config = JSON.parse(json) as PersonalityConfig;
    return new PersonalitySettings(config);
  }

  export(): PersonalityConfig {
    return this.get();
  }
}
