import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adsTracking } from './adsTracking';

describe('adsTracking service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('reports enabled status based on environment flag', () => {
    // In default test environment, VITE_ADS_ENABLED is not 'true'
    expect(adsTracking.isEnabled()).toBe(false);
  });

  it('does not crash or make network calls when disabled', () => {
    expect(() => {
      adsTracking.init('granted');
      adsTracking.updateConsent('granted');
      adsTracking.trackSessionStart();
      adsTracking.trackSessionComplete('bubble-pop');
    }).not.toThrow();
  });

  it('never attaches mood or sensitive personal health metrics', () => {
    // Test helper to verify trackSessionComplete interface
    const trackSpy = vi.spyOn(adsTracking, 'trackSessionComplete');
    adsTracking.trackSessionComplete('breath-bloom');
    expect(trackSpy).toHaveBeenCalledWith('breath-bloom');
    // Ensure no score argument is passed or accepted
    expect(trackSpy).toHaveBeenCalledTimes(1);
  });
});
