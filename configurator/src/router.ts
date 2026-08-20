export type RouteName =
  | 'onboarding'
  | 'device'
  | 'personality'
  | 'skins'
  | 'diagnostics'
  | 'firmware'
  | 'profiles';

const ROUTES: RouteName[] = [
  'onboarding',
  'device',
  'personality',
  'skins',
  'diagnostics',
  'firmware',
  'profiles',
];

export class ShellRouter {
  private current: RouteName = 'onboarding';
  private history: RouteName[] = ['onboarding'];

  getRoutes(): RouteName[] {
    return [...ROUTES];
  }

  getCurrent(): RouteName {
    return this.current;
  }

  navigate(route: RouteName): void {
    if (!ROUTES.includes(route)) {
      throw new Error(`Unknown route: ${route}`);
    }
    this.current = route;
    this.history.push(route);
  }

  getHistory(): RouteName[] {
    return [...this.history];
  }

  back(): void {
    if (this.history.length > 1) {
      this.history.pop();
      this.current = this.history[this.history.length - 1];
    }
  }
}
