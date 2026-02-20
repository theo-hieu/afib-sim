// A simple synthesized heartbeat using the Web Audio API
class HeartbeatSynthesizer {
  private ctx: AudioContext | null = null;
  private intervalId: number | null = null;

  // Tinnitus and Lowpass
  private tinnitusOsc: OscillatorNode | null = null;
  private tinnitusGain: GainNode | null = null;
  private masterFilter: BiquadFilterNode | null = null;
  private masterGain: GainNode | null = null;

  init() {
    if (!this.ctx) {
      this.ctx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);

      // Lowpass Filter for "muffled reality"
      this.masterFilter = this.ctx.createBiquadFilter();
      this.masterFilter.type = "lowpass";
      // Normally fully open
      this.masterFilter.frequency.setValueAtTime(20000, this.ctx.currentTime);
      this.masterFilter.connect(this.masterGain);
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playBeat(frequency = 50, duration = 0.1, volume = 1.0) {
    if (!this.ctx || !this.masterFilter) return;

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    // Use a triangle wave for a punchier "thud" during Afib
    osc.type = volume > 1 ? "triangle" : "sine";
    osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      0.01,
      this.ctx.currentTime + duration,
    );

    gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.ctx.currentTime + duration,
    );

    osc.connect(gainNode);
    gainNode.connect(this.masterFilter); // route through the global filter

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  // Plays a "lub-dub" sound
  playHeartbeat(volume = 1) {
    // A heavier thud for higher volume (Afib)
    const baseFreq = volume > 1 ? 45 : 60;
    this.playBeat(baseFreq, 0.15, volume);
    setTimeout(() => {
      this.playBeat(baseFreq + 10, 0.2, volume * 0.8);
    }, 150);
  }

  startTinnitus() {
    if (!this.ctx || !this.masterGain) return;
    if (this.tinnitusOsc) return; // already running

    this.tinnitusOsc = this.ctx.createOscillator();
    this.tinnitusOsc.type = "sine";
    this.tinnitusOsc.frequency.setValueAtTime(6000, this.ctx.currentTime); // high pitch

    this.tinnitusGain = this.ctx.createGain();
    // Fade in the ringing slowly
    this.tinnitusGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.tinnitusGain.gain.linearRampToValueAtTime(
      0.15,
      this.ctx.currentTime + 3,
    );

    this.tinnitusOsc.connect(this.tinnitusGain);
    this.tinnitusGain.connect(this.masterGain); // Bypass the lowpass filter so ringing is clear

    this.tinnitusOsc.start();
  }

  stopTinnitus() {
    if (!this.ctx || !this.tinnitusOsc || !this.tinnitusGain) return;

    // Fade out
    this.tinnitusGain.gain.setValueAtTime(
      this.tinnitusGain.gain.value,
      this.ctx.currentTime,
    );
    this.tinnitusGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1);

    this.tinnitusOsc.stop(this.ctx.currentTime + 1);

    setTimeout(() => {
      if (this.tinnitusOsc) {
        this.tinnitusOsc.disconnect();
        this.tinnitusOsc = null;
      }
      if (this.tinnitusGain) {
        this.tinnitusGain.disconnect();
        this.tinnitusGain = null;
      }
    }, 1100);
  }

  setMuffled(isMuffled: boolean) {
    if (!this.ctx || !this.masterFilter) return;
    // Muffle external sounds by filtering highs
    const targetFreq = isMuffled ? 500 : 20000;
    this.masterFilter.frequency.linearRampToValueAtTime(
      targetFreq,
      this.ctx.currentTime + 1,
    );
  }

  start(isAfib: boolean) {
    this.init();
    this.stop();

    if (isAfib) {
      this.startTinnitus();
      this.setMuffled(true);

      // Afib rhythm: Fast, violent, skipping
      let beatsPlayed = 0;
      const scheduleNext = () => {
        beatsPlayed++;

        // Randomly skip a beat to simulate a palpitation (long pause)
        const isSkippedBeat = Math.random() < 0.15;

        if (!isSkippedBeat) {
          // Loud and punchy
          this.playHeartbeat(2.5);
        }

        // Extremely erratic timing
        const nextTime = isSkippedBeat
          ? 800 + Math.random() * 400
          : 150 + Math.random() * 300;
        this.intervalId = window.setTimeout(scheduleNext, nextTime);
      };
      scheduleNext();
    } else {
      this.stopTinnitus();
      this.setMuffled(false);

      // Normal rhythm: Steady 60-70 BPM
      this.intervalId = window.setInterval(() => {
        this.playHeartbeat(0.5);
      }, 1000);
    }
  }

  stop() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
    this.stopTinnitus();
    this.setMuffled(false);
  }
}

export const heartbeatAudio = new HeartbeatSynthesizer();
