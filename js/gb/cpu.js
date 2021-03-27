const CLOCK_FREQ = 4194304;
const BLOCK_SIZE = 5000;
var CYCLE_COUNT = 0;

// Include instruction mappings
include('gb/instr/instrs.js');

// CPU Registers
var registers = {
    // Internal register values
    _a: 0,
    _f: 0,
    _b: 0,
    _c: 0,
    _d: 0,
    _e: 0,
    _h: 0,
    _l: 0,
    _pc: 0x100,
    _sp: 0,

    // 8-bit Getters
    get a() { return this._a; },
    get f() { return this._f; },
    get b() { return this._b; },
    get c() { return this._c; },
    get d() { return this._d; },
    get e() { return this._e; },
    get h() { return this._h; },
    get l() { return this._l; },

    // 16-bit Getters
    get af() { return (this.a << 8) | this.f; },
    get bc() { return (this.b << 8) | this.c; },
    get de() { return (this.d << 8) | this.e; },
    get hl() { return (this.h << 8) | this.l; },
    get pc() { return this._pc; },
    get sp() { return this._sp; },

    // Flag Setters (Because im lazy)
    get flag_z() { return (this._f & 0b10000000) > 0; },
    get flag_n() { return (this._f & 0b01000000) > 0; },
    get flag_h() { return (this._f & 0b00100000) > 0; },
    get flag_c() { return (this._f & 0b00010000) > 0; },

    // 8-bit Setters
    set a(v) { this._a = v & 0xff },
    set f(v) { this._f = v & 0xf0 },
    set b(v) { this._b = v & 0xff },
    set c(v) { this._c = v & 0xff },
    set d(v) { this._d = v & 0xff },
    set e(v) { this._e = v & 0xff },
    set h(v) { this._h = v & 0xff },
    set l(v) { this._l = v & 0xff },

    // 8-bit SP Setters (because I'm lazy)
    set s(v) { this._sp = (v << 8) | (this._sp & 0xff); },
    set p(v) { this._sp = (this._sp & 0xff00) | v; },

    // 16-bit Setters
    set af(v) {
        this.a = (v & 0xff00) >> 8;
        this.f = v & 0xff;
    },
    set bc(v) {
        this.b = (v & 0xff00) >> 8;
        this.c = v & 0xff;
    },
    set de(v) {
        this.d = (v & 0xff00) >> 8;
        this.e = v & 0xff;
    },
    set hl(v) {
        this.h = (v & 0xff00) >> 8;
        this.l = v & 0xff;
    },
    set pc(v) { this._pc = v & 0xffff; },
    set sp(v) { this._sp = v & 0xffff; },

    // Flag Setters (also because im lazy)
    set flag_z(v) {
        if(v) this._f |= 0b10000000;
        else this._f &= 0b01111111;
    },
    set flag_n(v) {
        if(v) this._f |= 0b01000000;
        else this._f &= 0b10111111;
    },
    set flag_h(v) {
        if(v) this._f |= 0b00100000;
        else this._f &= 0b11011111;
    },
    set flag_c(v) {
        if(v) this._f |= 0b00010000;
        else this._f &= 0b11101111;
    },
};

// Interrupt-related CPU variables
var intr_state = {
    if: 0,
    ie: 0,
    ime: false,
    ime_queue: false,
};

// Function pointer showing what to do on the next tick
var nextfunc = fetchInstruction;

// Function for fetching instructions to execute
function fetchInstruction() {
    let opcode = readByte(registers.pc++);
    if(funcmap[opcode] === undefined)
        throw `Encountered unknown opcode $${opcode.toString(16).padStart(2, '0')} at $${(registers.pc-1).toString(16).padStart(4, '0')}`;
    funcmap[opcode]();
}

// Wrapper for a single next-tick-function call
function step() {
    //console.log(`* Cycle ${CYCLE_COUNT++} (PC: $${registers.pc.toString(16).padStart(4, '0')})`);
    nextfunc();
}

// Wrapper called by setInterval() function
function execBlock() {
    try {
        for(let i = 0; i < BLOCK_SIZE; i++)
            step();
    } catch(e) {
        clearInterval(intervalId);
        console.error(e);
    }
}

// Function that starts a timer that continuously updates the CPU and all other components
var intervalId = null;
async function startCPU() {
    intervalId = setInterval(execBlock, (1/CLOCK_FREQ)*1000*BLOCK_SIZE);
}