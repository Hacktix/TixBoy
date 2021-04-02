const GLOBAL_GAIN = audioCtx.createGain();
GLOBAL_GAIN.gain.value = 0.125;

var audio_state = {
    set nr50(v) {
        if((v & 0b10001000) === 0)
            GLOBAL_GAIN.gain = 0;
        else {
            // TODO: Implement Stereo Panning
            GLOBAL_GAIN.gain.value = (7/(v & 0b111))/8;
        }
    },

    set nr51(v) {
        audio_ch1._vol.gain.value = (v & 0b00010001) ? audio_ch1._vol.gain.value : 0;
        audio_ch2._vol.gain.value = (v & 0b00100010) ? audio_ch2._vol.gain.value : 0;
    },
}

var audio_ch1 = {
    _osc: audioCtx.createOscillator(),
    _vol: audioCtx.createGain(),
    _freq_internal: 0,
    set freq_internal(v) {
        this._freq_internal = v;
        this._osc.frequency.value = 131072/(2048-this._freq_internal);
    },

    set nr12(v) {
        this._vol.gain.value = (v & 0xf0) === 0 ? 0 : 0xf / ((v & 0xf0) >> 4);
    },
    set nr13(v) {
        this.freq_internal = (this._freq_internal & 0b11100000000) | v;
    },
    set nr14(v) {
        this.freq_internal = (this._freq_internal & 0xff) | ((v & 0b111) << 8);
    },
}

var audio_ch2 = {
    _osc: audioCtx.createOscillator(),
    _vol: audioCtx.createGain(),
    _freq_internal: 0,
    set freq_internal(v) {
        this._freq_internal = v;
        this._osc.frequency.value = 131072/(2048-this._freq_internal);
    },

    set nr22(v) {
        this._vol.gain.value = (v & 0xf0) === 0 ? 0 : 0xf / ((v & 0xf0) >> 4);
    },
    set nr23(v) {
        this.freq_internal = (this._freq_internal & 0b11100000000) | v;
    },
    set nr24(v) {
        this.freq_internal = (this._freq_internal & 0xff) | ((v & 0b111) << 8);
    },
}

// Initialize Channel 1
audio_ch1._osc.setPeriodicWave(SQUARE_WAVE);
audio_ch1._osc.frequency.value = 0;
audio_ch1._osc.connect(audio_ch1._vol).connect(GLOBAL_GAIN).connect(audioCtx.destination);

// Initialize Channel 2
audio_ch2._osc.setPeriodicWave(SQUARE_WAVE);
audio_ch2._osc.frequency.value = 0;
audio_ch2._osc.connect(audio_ch2._vol).connect(GLOBAL_GAIN).connect(audioCtx.destination);