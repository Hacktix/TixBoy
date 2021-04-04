var timer_state = {
    // Internal timer variables
    _last_tick_state: false,
    _last_apu_tick_state: false,
    _queued_reload: true,

    // DIV Register
    _div_internal: 0,
    get div() { return (this._div_internal & 0xff00) >> 8; },
    set div(v) {
        this._div_internal = 0;
        tickTimers(false);
    },

    // TIMA Register
    _tima: 0,
    get tima() { return this._tima; },
    set tima(v) {
        this._tima = v;
        this._queued_reload = false;
    },

    // TAC Register
    _tac: 0,
    get tac() { return this._tac | 0xf8; },
    set tac(v) {
        this._tac = v & 0b111;
        tickTimers(false);
    },

    // TMA Register
    tma: 0
};

function resetTimers() {
    timer_state = {
        // Internal timer variables
        _last_tick_state: false,
        _last_apu_tick_state: false,
        _queued_reload: true,
    
        // DIV Register
        _div_internal: 0,
        get div() { return (this._div_internal & 0xff00) >> 8; },
        set div(v) {
            this._div_internal = 0;
            tickTimers(false);
        },
    
        // TIMA Register
        _tima: 0,
        get tima() { return this._tima; },
        set tima(v) {
            this._tima = v;
            this._queued_reload = false;
        },
    
        // TAC Register
        _tac: 0,
        get tac() { return this._tac | 0xf8; },
        set tac(v) {
            this._tac = v & 0b111;
            tickTimers(false);
        },
    
        // TMA Register
        tma: 0
    };
}

function tickTimers(inc = true) {
    // Increment internal DIV
    if(inc) {
        timer_state._div_internal += 4;

        // Check if TIMA reload is required
        if(timer_state._queued_reload) {
            timer_state.tima = timer_state.tma;
            intr_state.if |= 0b100;
        }
    }

    // Check for APU update
    let apu_tick_state = (timer_state._div_internal & 0b1000000000000) > 0;
    if(timer_state._last_apu_tick_state && !apu_tick_state)
        tickAudio();
    timer_state._last_apu_tick_state = apu_tick_state;

    // Check for falling edge
    let tick_state = ((timer_state._div_internal & (1 << [9, 3, 5, 7][timer_state.tac & 0b11])) > 0) && ((timer_state.tac & 0b100) > 0);
    if(timer_state._last_tick_state && !tick_state) {
        // Increment TIMA
        if(timer_state.tima === 0xff) {
            timer_state._tima = 0;
            timer_state._queued_reload = true;
        } else
            timer_state.tima++;
    }
    timer_state._last_tick_state = tick_state;
}