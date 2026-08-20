export interface VoiceConfig {
  voice: string;
  speed: number;
  pitch: number;
}

const DEFAULT_CONFIG: VoiceConfig = {
  voice: 'alloy',
  speed: 1.0,
  pitch: 1.0,
};

export class VoiceSettings {
  private config: VoiceConfig;

  constructor(config?: Partial<VoiceConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  get(): VoiceConfig {
    return { ...this.config };
  }

  update(update: Partial<VoiceConfig>): void {
    if (update.speed !== undefined && (update.speed < 0.5 || update.speed > 2.0)) {
      throw new Error('Speed must be between 0.5 and 2.0');
    }
    this.config = { ...this.config, ...update };
  }

  preview(): string {
    return `Hola, soy ${this.config.voice}. Esta es una vista previa de mi voz a velocidad ${this.config.speed}.`;
  }

  toJSON(): string {
    return JSON.stringify(this.config);
  }

  static fromJSON(json: string): VoiceSettings {
    const config = JSON.parse(json) as VoiceConfig;
    return new VoiceSettings(config);
  }
}
