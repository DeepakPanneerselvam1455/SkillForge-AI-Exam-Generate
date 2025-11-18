import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  constructor() {
    // Always run in live mode - remove any existing demo mode settings
    this.clearDemoModeConfig();
  }

  isDemoMode(): boolean {
    // Always return false - project runs in live mode only
    return false;
  }

  isLiveMode(): boolean {
    // Always return true - project runs in live mode only
    return true;
  }

  private clearDemoModeConfig(): void {
    // Remove any existing demo mode configuration
    localStorage.removeItem('DEMO_MODE');
  }

  clearConfig(): void {
    // Method kept for compatibility but does nothing since we're always in live mode
    this.clearDemoModeConfig();
  }
}
