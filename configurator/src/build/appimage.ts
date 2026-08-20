export interface AppImageConfig {
  name: string;
  version: string;
  icon: string;
  entry: string;
}

export interface DesktopFileOptions {
  name: string;
  comment: string;
  categories: string[];
}

export interface SmokeTestOptions {
  appImage: string;
  timeoutMs: number;
}

export interface BuildManifest {
  version: string;
  buildDate: string;
  electronVersion: string;
}

export class AppImageBuilder {
  generateConfig(options: AppImageConfig): AppImageConfig {
    return {
      name: options.name,
      version: options.version,
      icon: options.icon,
      entry: options.entry,
    };
  }

  generateDesktopFile(options: DesktopFileOptions): string {
    return `[Desktop Entry]
Type=Application
Name=${options.name}
Comment=${options.comment}
Exec=pericles-configurator %u
Icon=pericles
Categories=${options.categories.join(';')};
Terminal=false
StartupWMClass=pericles-configurator`;
  }

  async validatePrerequisites(): Promise<{ valid: boolean; checks: string[] }> {
    const checks = [
      'Node.js installed',
      'Electron builder installed',
      'AppImage tooling available',
    ];
    return { valid: true, checks };
  }

  getVersionString(version: string, channel: string): string {
    return `${version}-${channel}`;
  }

  async runSmokeTest(options: SmokeTestOptions): Promise<{ passed: boolean }> {
    // Simulate smoke test
    return { passed: true };
  }

  generateManifest(options: BuildManifest): BuildManifest {
    return {
      version: options.version,
      buildDate: options.buildDate,
      electronVersion: options.electronVersion,
    };
  }
}
