/**
 * CalmPop Ads & Conversion Tracking Service
 * 
 * PRIVACY & COMPLIANCE RULES:
 * 1. ZERO NETWORK REQUESTS by default. If VITE_ADS_ENABLED !== 'true', this module is a no-op.
 * 2. CONSENT MODE V2: All storage types default to 'denied'.
 * 3. NO SENSITIVE DATA: Never tracks mood values, stress ratings, or personal thoughts.
 * 4. Only fires safe lifecycle signals (start_session, complete_session) when consented.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const IS_ADS_ENABLED = import.meta.env.VITE_ADS_ENABLED === 'true';
const ADSENSE_CLIENT_ID = import.meta.env.VITE_ADSENSE_CLIENT_ID || '';

import type { AdConsentType } from '../store/useAppStore';

class AdsTrackingService {
  private initialized = false;

  public init(consent: AdConsentType) {
    if (!IS_ADS_ENABLED || typeof window === 'undefined') {
      return;
    }

    if (!this.initialized) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function (...args: unknown[]) {
        window.dataLayer?.push(args);
      };

      // Set Google Consent Mode v2 defaults to DENIED
      window.gtag('consent', 'default', {
        ad_storage: 'denied',
        analytics_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      });

      this.initialized = true;
    }

    this.updateConsent(consent);
  }

  public updateConsent(consent: AdConsentType) {
    if (!IS_ADS_ENABLED || !window.gtag) return;

    if (consent === 'granted') {
      window.gtag('consent', 'update', {
        ad_storage: 'granted',
        analytics_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted'
      });
    } else if (consent === 'non_personalized') {
      window.gtag('consent', 'update', {
        ad_storage: 'granted',
        analytics_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      });
    } else {
      window.gtag('consent', 'update', {
        ad_storage: 'denied',
        analytics_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      });
    }
  }

  /**
   * Track session start conversion
   * NEVER sends mood, personal feelings, or private inputs
   */
  public trackSessionStart() {
    if (!IS_ADS_ENABLED || !window.gtag) return;
    window.gtag('event', 'start_session', {
      event_category: 'engagement',
      non_interaction: false
    });
  }

  /**
   * Track session completion conversion
   * Safe metric only: activity type ('game' or 'bloom'), NO personal or emotional data
   */
  public trackSessionComplete(activityType: string = 'game') {
    if (!IS_ADS_ENABLED || !window.gtag) return;
    window.gtag('event', 'complete_session', {
      event_category: 'engagement',
      activity_type: activityType,
      non_interaction: false
    });
  }

  public isEnabled(): boolean {
    return IS_ADS_ENABLED;
  }

  public getClientId(): string {
    return ADSENSE_CLIENT_ID;
  }
}

export const adsTracking = new AdsTrackingService();
