const GLOBAL_GAIN = audioCtx.createGain();
const GLOBAL_VOL = 0.1;
GLOBAL_GAIN.gain.value = GLOBAL_VOL;

var audio_state = {
    _global_gain_node: audioCtx.createGain(),
    _so1_node: audioCtx.createStereoPanner(),
    _so1_gain: audioCtx.createGain(),
    _so2_node: audioCtx.createStereoPanner(),
    _so2_gain: audioCtx.createGain(),

    _en_global: false,
    _cycles: 0,

    set nr50(v) {
        this._so2_gain.gain.value = (v & 0x70) ? ((v & 0x70) >> 4) / 7 : 0;
        this._so1_gain.gain.value = (v & 0x7) ? (v & 0x7) / 7 : 0;
    },

    set nr51(v) {
        // TODO: Implement sound selection for other channels

        // Channel 1
        if(v & (1 << 0)) try {this.ch1._ctrl.connect(this._so1_node);} catch(e){}
        else try {this.ch1._ctrl.disconnect(this._so1_node);} catch(e){}
        if(v & (1 << 4)) try {this.ch1._ctrl.connect(this._so2_node);} catch(e){}
        else try {this.ch1._ctrl.disconnect(this._so2_node);} catch(e){}

        // Channel 2
        if(v & (1 << 1)) try {this.ch2._ctrl.connect(this._so1_node);} catch(e){}
        else try {this.ch2._ctrl.disconnect(this._so1_node);} catch(e){}
        if(v & (1 << 5)) try {this.ch2._ctrl.connect(this._so2_node);} catch(e){}
        else try {this.ch2._ctrl.disconnect(this._so2_node);} catch(e){}
    },

    set nr52(v) {
        this._en_global = (v & 0x80) > 0;
        if(this._en_global)
            this._global_gain_node.gain.value = GLOBAL_VOL;
        else
            this._global_gain_node.gain.value = 0;
    },

    ch1: {
        _active: null,
        _en: false,
        _osc: audioCtx.createOscillator(),
        _gain: audioCtx.createGain(),
        _ctrl: audioCtx.createGain(),

        _sweep_dir: 0,
        _sweep_shift: 0,
        _sweep_period: 0,
        _sweep_counter: 0,

        _vol_internal: 0,
        _env_dir: 0,
        _env_period: 0,
        _env_counter: 0,
        set vol(v) {
            this._gain.gain.value = v ? v / 7 : 0
        },

        _len: 0,
        _enable_len: false,

        _freq_internal: 0,
        set freq(v) {
            this._osc.frequency.value = 131072/(2048-v);
        },

        set nr10(v) {
            this._sweep_period = this._sweep_counter = ((v & 0b1110000) >> 4);
            this._sweep_dir = (v & 0b1000) >> 3;
            this._sweep_shift = v & 0b111;
        },

        set nr11(v) {
            this._osc.setPeriodicWave(SQUARE_WAVES[(v & 0b11000000) >> 6]);
            this._len = v & 0b111111;
        },

        set nr12(v) {
            this._vol_internal = (v & 0xf0) >> 4;
            this._env_dir = (v & 0b1000) >> 3;
            this._env_period = this._env_counter = (v & 0b111);
        },

        set nr13(v) {
            this._freq_internal = (this._freq_internal & 0b11100000000) | v;
            this.freq = this._freq_internal;
        },

        set nr14(v) {
            this._freq_internal = (this._freq_internal & 0xff) | ((v & 0b111) << 8);
            this._en = (v & 0x80);
            this._enable_len = (v & 0x40);
            if(this._en) {
                this._ctrl.gain.value = 1;
                this.vol = this._vol_internal;
                this.freq = this._freq_internal;
                this._active = {
                    sweep_dir: this._sweep_dir,
                    sweep_shift: this._sweep_shift,
                    sweep_period: this._sweep_period ? this._sweep_period : 8,
                    sweep_counter: this._sweep_period ? this._sweep_period : 8,

                    freq_internal: this._freq_internal,
                    
                    vol_internal: this._vol_internal,
                    env_dir: this._env_dir,
                    env_period: this._env_period,
                    env_counter: this._env_counter,

                    len: 64-this._len,
                    enable_len: this._enable_len
                };
            }
        }
    },

    ch2: {
        _active: null,
        _en: false,
        _osc: audioCtx.createOscillator(),
        _gain: audioCtx.createGain(),
        _ctrl: audioCtx.createGain(),

        _vol_internal: 0,
        _env_dir: 0,
        _env_period: 0,
        _env_counter: 0,
        set vol(v) {
            this._gain.gain.value = v ? v / 7 : 0
        },

        _len: 0,
        _enable_len: false,

        _freq_internal: 0,
        set freq(v) {
            this._osc.frequency.value = 131072/(2048-v);
        },

        set nr21(v) {
            this._osc.setPeriodicWave(SQUARE_WAVES[(v & 0b11000000) >> 6]);
            this._len = v & 0b111111;
        },

        set nr22(v) {
            this._vol_internal = (v & 0xf0) >> 4;
            this._env_dir = (v & 0b1000) >> 3;
            this._env_period = this._env_counter = (v & 0b111);
        },

        set nr23(v) {
            this._freq_internal = (this._freq_internal & 0b11100000000) | v;
            this.freq = this._freq_internal;
        },

        set nr24(v) {
            this._freq_internal = (this._freq_internal & 0xff) | ((v & 0b111) << 8);
            this._en = (v & 0x80);
            this._enable_len = (v & 0x40);
            if(this._en) {
                this._ctrl.gain.value = 1;
                this.vol = this._vol_internal;
                this.freq = this._freq_internal;
                this._active = {
                    freq_internal: this._freq_internal,
                    
                    vol_internal: this._vol_internal,
                    env_dir: this._env_dir,
                    env_period: this._env_period,
                    env_counter: this._env_counter,

                    len: 64-this._len,
                    enable_len: this._enable_len
                };
            }
        }
    },
}

function resetAudio() {
    audio_state._en_global = false;
    audio_state._cycles = 0;
    audio_state._global_gain_node.gain.value = 0;

    // Channel 1
    audio_state.ch1._active = null;
    audio_state.ch1._en = false;
    audio_state.ch1._sweep_counter = 0;
    audio_state.ch1._sweep_dir = 0;
    audio_state.ch1._sweep_period = 0;
    audio_state.ch1._sweep_shift = 0;
    audio_state.ch1._vol_internal = 0;
    audio_state.ch1._env_counter = 0;
    audio_state.ch1._env_dir = 0;
    audio_state.ch1._env_period = 0;
    audio_state.ch1._len = 0;
    audio_state.ch1._enable_len = false;
    audio_state.ch1._freq_internal = 0;
    audio_state.ch1.freq = 0;
    audio_state.ch1.vol = 0;

    // Channel 2
    audio_state.ch2._active = null;
    audio_state.ch2._en = false;
    audio_state.ch2._vol_internal = 0;
    audio_state.ch2._env_counter = 0;
    audio_state.ch2._env_dir = 0;
    audio_state.ch2._env_period = 0;
    audio_state.ch2._len = 0;
    audio_state.ch2._enable_len = false;
    audio_state.ch2._freq_internal = 0;
    audio_state.ch2.freq = 0;
    audio_state.ch2.vol = 0;
}

function initAudio() {
    try {
        audio_state.ch1._osc.start();
        audio_state.ch2._osc.start();
    } catch(e) {}
}

function tickAudio() {
    if((audio_state._cycles & 1) === 0)
        tickLength();
    if(((audio_state._cycles - 2) & 3) === 0)
        tickSweep();
    if(((audio_state._cycles+1) & 7) === 0)
        tickVolEnv();
    audio_state._cycles++;
}

function tickLength() {
    // Channel 1
    if(audio_state.ch1._en && audio_state.ch1._active.enable_len && audio_state.ch1._active.len > 0 && --audio_state.ch1._active.len === 0) {
        audio_state.ch1._ctrl.gain.value = 0;
        audio_state.ch1._active = null;
        audio_state.ch1._en = false;
    }

    // Channel 2
    if(audio_state.ch2._en && audio_state.ch2._active.enable_len && audio_state.ch2._active.len > 0 && --audio_state.ch2._active.len === 0) {
        audio_state.ch2._ctrl.gain.value = 0;
        audio_state.ch2._active = null;
        audio_state.ch2._en = false;
    }
}

function tickVolEnv() {
    // Channel 1
    if(audio_state.ch1._en && audio_state.ch1._active.env_period && audio_state.ch1._active.env_counter > 0 && --audio_state.ch1._active.env_counter === 0) {
        audio_state.ch1._active.env_counter = audio_state.ch1._active.env_period;
        if((audio_state.ch1._active.vol_internal < 0xf && audio_state.ch1._active.env_dir) || (audio_state.ch1._active.vol_internal > 0 && !audio_state.ch1._active.env_dir)) {
            audio_state.ch1._active.vol_internal += audio_state.ch1._active.env_dir ? 1 : -1;
            audio_state.ch1.vol = audio_state.ch1._active.vol_internal;
        }
    }

    // Channel 2
    if(audio_state.ch2._en && audio_state.ch2._active.env_period && audio_state.ch2._active.env_counter > 0 && --audio_state.ch2._active.env_counter === 0) {
        audio_state.ch2._active.env_counter = audio_state.ch2._active.env_period;
        if((audio_state.ch2._active.vol_internal < 0xf && audio_state.ch2._active.env_dir) || (audio_state.ch2._active.vol_internal > 0 && !audio_state.ch2._active.env_dir)) {
            audio_state.ch2._active.vol_internal += audio_state.ch2._active.env_dir ? 1 : -1;
            audio_state.ch2.vol = audio_state.ch2._active.vol_internal;
        }
    }
}

function tickSweep() {
    if(audio_state.ch1._en && audio_state.ch1._active.sweep_shift !== 0 && audio_state.ch1._active.sweep_period !== 0) {
        if(audio_state.ch1._active.sweep_counter > 0 && --audio_state.ch1._active.sweep_counter === 0) {
            audio_state.ch1._active.sweep_counter = audio_state.ch1._active.sweep_period;
            let freq_change = audio_state.ch1._active.freq_internal >> audio_state.ch1._active.sweep_shift;
            let new_freq = audio_state.ch1._active.freq_internal + (audio_state.ch1._active.sweep_dir ? -freq_change : freq_change);
            if(new_freq < 0 || new_freq > 2047) {
                audio_state.ch1._ctrl.gain.value = 0;
                audio_state.ch1._active = null;
                audio_state.ch1._en = false;
            } else
                audio_state.ch1.freq = audio_state.ch1._active.freq_internal = new_freq;
        }
    }
}

// Initialize global audio nodes
audio_state._so1_node.connect(audio_state._so1_gain).connect(audio_state._global_gain_node);
audio_state._so1_node.pan.value = 1;
audio_state._so2_node.connect(audio_state._so2_gain).connect(audio_state._global_gain_node);
audio_state._so2_node.pan.value = -1;
audio_state._global_gain_node.connect(audioCtx.destination);
audio_state._global_gain_node.gain.value = 0.25;

// Initialize Channel 1
audio_state.ch1._osc.connect(audio_state.ch1._gain).connect(audio_state.ch1._ctrl);
audio_state.ch1._osc.setPeriodicWave(SQUARE_WAVES[0]);
audio_state.ch1._gain.gain.value = 0;

// Initialize Channel 2
audio_state.ch2._osc.connect(audio_state.ch2._gain).connect(audio_state.ch2._ctrl);
audio_state.ch2._osc.setPeriodicWave(SQUARE_WAVES[0]);
audio_state.ch2._gain.gain.value = 0;