import { describe, it, expect, beforeEach } from 'vitest';
import { ShellRouter } from '../src/router.js';

describe('ShellRouter', () => {
  let router: ShellRouter;

  beforeEach(() => {
    router = new ShellRouter();
  });

  it('has all required routes', () => {
    const routes = router.getRoutes();
    expect(routes).toContain('onboarding');
    expect(routes).toContain('device');
    expect(routes).toContain('personality');
    expect(routes).toContain('skins');
    expect(routes).toContain('diagnostics');
    expect(routes).toContain('firmware');
    expect(routes).toContain('profiles');
  });

  it('defaults to onboarding', () => {
    expect(router.getCurrent()).toBe('onboarding');
  });

  it('navigates to a route', () => {
    router.navigate('device');
    expect(router.getCurrent()).toBe('device');
  });

  it('rejects unknown route', () => {
    expect(() => router.navigate('unknown')).toThrow('Unknown route');
  });

  it('tracks navigation history', () => {
    router.navigate('device');
    router.navigate('personality');
    const history = router.getHistory();
    expect(history).toContain('onboarding');
    expect(history).toContain('device');
    expect(history).toContain('personality');
  });

  it('can go back', () => {
    router.navigate('device');
    router.navigate('personality');
    router.back();
    expect(router.getCurrent()).toBe('device');
  });

  it('cannot go back from first route', () => {
    router.back();
    expect(router.getCurrent()).toBe('onboarding');
  });
});
