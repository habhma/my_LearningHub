/**
 * Sound utility for quiz feedback
 * Uses Web Audio API to generate sounds without external files
 */

class SoundManager {
  private audioContext: AudioContext | null = null;

  constructor() {
    // Initialize AudioContext only when needed (user interaction required)
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      // Don't initialize here, wait for first user interaction
    }
  }

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  /**
   * Play a success sound (pleasant ascending tones)
   */
  playCorrect() {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      // Create oscillator for main tone
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Success sound: C5 -> E5 (pleasant major third interval)
      oscillator.frequency.setValueAtTime(523.25, now); // C5
      oscillator.frequency.setValueAtTime(659.25, now + 0.1); // E5

      // Envelope
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      oscillator.type = 'sine';
      oscillator.start(now);
      oscillator.stop(now + 0.3);
    } catch (error) {
      console.warn('Could not play correct sound:', error);
    }
  }

  /**
   * Play an error sound (descending tones)
   */
  playWrong() {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      // Create oscillator for main tone
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Error sound: E4 -> C4 (descending minor third)
      oscillator.frequency.setValueAtTime(329.63, now); // E4
      oscillator.frequency.setValueAtTime(261.63, now + 0.1); // C4

      // Envelope
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.2, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      oscillator.type = 'triangle';
      oscillator.start(now);
      oscillator.stop(now + 0.25);
    } catch (error) {
      console.warn('Could not play wrong sound:', error);
    }
  }

  /**
   * Play a neutral click sound for navigation
   */
  playClick() {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(800, now);
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

      oscillator.type = 'sine';
      oscillator.start(now);
      oscillator.stop(now + 0.1);
    } catch (error) {
      console.warn('Could not play click sound:', error);
    }
  }
}

// Export singleton instance
export const soundManager = new SoundManager();
