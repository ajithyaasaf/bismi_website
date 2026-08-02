// ─── Web Audio & Web Speech API Generator for Admin Order Alerts ───
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
    if (!audioCtx) {
        const AudioContextClass =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

/**
 * Plays a bright 2-tone chime sound via Web Audio API.
 * Optional repeat count (default: 2 times) to make sure it's loud & clear.
 */
export function playOrderNotificationChime(repeatCount = 2) {
    try {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        for (let i = 0; i < repeatCount; i++) {
            const delay = i * 0.45; // 450ms between chimes
            const now = ctx.currentTime + delay;

            // Tone 1: Crisp notification ping (880Hz - A5)
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(880, now);
            gain1.gain.setValueAtTime(0.35, now);
            gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.start(now);
            osc1.stop(now + 0.3);

            // Tone 2: Ascending resolution ping (1174.66Hz - D6)
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(1174.66, now + 0.12);
            gain2.gain.setValueAtTime(0.45, now + 0.12);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start(now + 0.12);
            osc2.stop(now + 0.4);
        }
    } catch (e) {
        console.warn('Audio chime playback error:', e);
    }
}

/**
 * Plays original chime sound AND speaks voice alert safely.
 */
export function speakOrderAnnouncement(customerName: string, totalAmount: number) {
    // 1. ALWAYS play the audio chime (plays twice for high clarity)
    playOrderNotificationChime(2);

    // 2. Speak voice announcement if browser supports SpeechSynthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
            // Do NOT call cancel() or wrap in setTimeout as it can strip user activation context on mobile
            const cleanName = customerName.replace(/[^a-zA-Z0-9 ]/g, '').trim() || 'a customer';
            const text = `New order from ${cleanName} for ${Math.round(totalAmount)} rupees!`;
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;

            window.speechSynthesis.speak(utterance);
        } catch (err) {
            console.warn('Voice announcement fallback to chime:', err);
        }
    }
}
