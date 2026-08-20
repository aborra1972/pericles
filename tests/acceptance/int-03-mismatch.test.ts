import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const PROFILES_DIR = join(__dirname, '../../firmware/profiles');

describe('INT-03: Profile/Firmware Mismatch Detection', () => {
  const integrated = JSON.parse(readFileSync(join(PROFILES_DIR, 'integrated.json'), 'utf-8'));
  const respeaker = JSON.parse(readFileSync(join(PROFILES_DIR, 'respeaker.json'), 'utf-8'));

  describe('Variant detection', () => {
    it('detects integrated variant', () => {
      expect(integrated.id).toBe('integrated');
      expect(integrated.mcu.chip).toBe('ESP32-S3-N16R8');
    });

    it('detects respeaker variant', () => {
      expect(respeaker.id).toBe('respeaker');
      expect(respeaker.mcu.chip).toBe('XIAO-ESP32-S3R8');
    });
  });

  describe('Audio capability mismatch', () => {
    it('integrated has no external mic', () => {
      expect(integrated.audio.input).toBe('internal_adc');
      expect(integrated.audio.microphones).toBe(0);
      expect(integrated.audio.aec).toBe(false);
      expect(integrated.audio.beamforming).toBe(false);
    });

    it('respeaker has XVF3800 mic array', () => {
      expect(respeaker.audio.input).toBe('xvf3800_i2s');
      expect(respeaker.audio.microphones).toBe(4);
      expect(respeaker.audio.aec).toBe(true);
      expect(respeaker.audio.beamforming).toBe(true);
    });
  });

  describe('Feature capability mismatch', () => {
    it('integrated has no WS2812 LEDs', () => {
      expect(integrated.leds.count).toBe(0);
      expect(integrated.leds.type).toBeNull();
    });

    it('respeaker has 12 WS2812 LEDs', () => {
      expect(respeaker.leds.count).toBe(12);
      expect(respeaker.leds.type).toBe('WS2812');
    });

    it('integrated has no external codec', () => {
      expect(integrated.audio.codec).toBeNull();
    });

    it('respeaker has TLV320AIC3104 codec', () => {
      expect(respeaker.audio.codec).toBe('TLV320AIC3104');
    });
  });

  describe('Mismatch blocking logic', () => {
    function detectMismatch(firmwareProfile: any, hardwareProfile: any): string[] {
      const errors: string[] = [];

      if (firmwareProfile.audio.input === 'internal_adc' && hardwareProfile.audio.input === 'xvf3800') {
        errors.push('Firmware expects internal ADC but hardware has XVF3800');
      }

      if (firmwareProfile.audio.input === 'xvf3800' && hardwareProfile.audio.input === 'internal_adc') {
        errors.push('Firmware expects XVF3800 but hardware has internal ADC');
      }

      if (firmwareProfile.leds.count !== hardwareProfile.leds.count) {
        errors.push(`LED count mismatch: firmware expects ${firmwareProfile.leds.count}, hardware has ${hardwareProfile.leds.count}`);
      }

      if (firmwareProfile.audio.microphones !== hardwareProfile.audio.microphones) {
        errors.push(`Microphone count mismatch: firmware expects ${firmwareProfile.audio.microphones}, hardware has ${hardwareProfile.audio.microphones}`);
      }

      return errors;
    }

    it('blocks integrated firmware on respeaker hardware', () => {
      const errors = detectMismatch(integrated, respeaker);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.includes('internal ADC') || e.includes('LED count') || e.includes('Microphone count'))).toBe(true);
    });

    it('blocks respeaker firmware on integrated hardware', () => {
      const errors = detectMismatch(respeaker, integrated);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.includes('XVF3800') || e.includes('LED count') || e.includes('Microphone count'))).toBe(true);
    });

    it('allows matching profiles', () => {
      const errors = detectMismatch(integrated, integrated);
      expect(errors.length).toBe(0);
    });

    it('allows matching respeaker profiles', () => {
      const errors = detectMismatch(respeaker, respeaker);
      expect(errors.length).toBe(0);
    });
  });
});
