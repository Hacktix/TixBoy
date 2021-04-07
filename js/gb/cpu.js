const CLOCK_FREQ = 4194304/4;
const BLOCK_SIZE = 70224/4;
const DEBUG_LOG_DOWNLOAD = false;
const DEBUG_LOG_LEN_LIMIT = 0;
var CYCLE_COUNT = 0;

// Include other relevant things
include('gb/instr/instrs.js');     // Instruction Mappings
include('gb/interrupts.js');       // Interrupt Handling
include('gb/timers.js');           // Hardware Timers
include('gb/ppu.js');              // PPU
include('gb/dma.js');              // OAM DMA

// Debug breakpoints cause CPU bad
var debug_brk = [];

// CPU Registers
var registers = null;

function resetRegistersCPU() {
    registers = {
        // Internal register values
        _a: 0,
        _f: 0,
        _b: 0,
        _c: 0,
        _d: 0,
        _e: 0,
        _h: 0,
        _l: 0,
        _pc: 0,
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
    cpu_halted = false;
    skip_interrupt = false;
    halt_bug = false;
    nextfunc = fetchInstruction;
    dbg_log = [];
    CYCLE_COUNT = 0;
    count_cycles = true;
}

// Boolean flags related to HALT mode
var cpu_halted = false;
var skip_interrupt = false;
var halt_bug = false;
var count_cycles = true;

// Function pointer showing what to do on the next tick
var nextfunc = fetchInstruction;

// Debug log string for later download
var dbg_log = [];

// Function for fetching instructions to execute
function fetchInstruction() {
    // Handle IME Enable Queuing
    if(intr_state.ime_queue > 0 && --intr_state.ime_queue === 0)
        intr_state.ime = true;

    // Handle Interrupts
    if((skip_interrupt || intr_state.ime) && (intr_state._if & intr_state._ie) !== 0) {
        if(!skip_interrupt) {
            let vec = 0x40;
            let bmp = 1;
            while(((intr_state._if & intr_state._ie) & bmp) === 0) {
                bmp <<= 1;
                vec += 0x8;
            }
            intr_state.if &= ~bmp;
            nextfunc = handleInterrupt.bind(this, vec, cpu_halted ? 0 : 1);
            return;
        }
        skip_interrupt = cpu_halted = false;
    }

    // Check HALT State
    if(cpu_halted)
        return;

    // Debug Logging
    if(!bootrom_mapped && DEBUG_LOG_DOWNLOAD)
        dbg_log.push(`A: ${registers.a.toString(16).padStart(2, '0')} F: ${registers.f.toString(16).padStart(2, '0')} B: ${registers.b.toString(16).padStart(2, '0')} C: ${registers.c.toString(16).padStart(2, '0')} D: ${registers.d.toString(16).padStart(2, '0')} E: ${registers.e.toString(16).padStart(2, '0')} H: ${registers.h.toString(16).padStart(2, '0')} L: ${registers.l.toString(16).padStart(2, '0')} SP: ${registers.sp.toString(16).padStart(4, '0')} PC: 00:${registers.pc.toString(16).padStart(4, '0')} (${readByte(registers.pc).toString(16).padStart(2, '0')} ${readByte(registers.pc+1).toString(16).padStart(2, '0')} ${readByte(registers.pc+2).toString(16).padStart(2, '0')} ${readByte(registers.pc+3).toString(16).padStart(2, '0')})`.toUpperCase());
    if(DEBUG_LOG_LEN_LIMIT > 0 && dbg_log.length === DEBUG_LOG_LEN_LIMIT)
        throw "Log length limit reached."

    // Breakpoints
    if(!bootrom_mapped && debug_brk.includes(registers.pc))
        throw `Breakpoint hit: $${registers.pc.toString(16).padStart(4, '0')}`;

    // Decode & Run Opcode
    let opcode = readByte(registers.pc++);
    if(halt_bug) {
        halt_bug = false;
        registers.pc--;
    }
    if(funcmap[opcode] === undefined)
        throw `Encountered unknown opcode $${opcode.toString(16).padStart(2, '0')} at $${(registers.pc-1).toString(16).padStart(4, '0')}`;
    funcmap[opcode]();
}

// Wrapper for a single next-tick-function call
function step() {
    if(count_cycles === true) CYCLE_COUNT++;
    nextfunc();
    tickTimers();
    updatePPU();
    updateOAMDMA();
}

// Debugging function for stepping over individual instructions
function stepInstr() {
    do {
        step();
    } while(nextfunc !== fetchInstruction);
}

// Wrapper called by setInterval() function
function execBlock() {
    try {
        for(let i = 0; i < BLOCK_SIZE; i++)
            step();
        if(resettingEmulator === true) {
            resettingEmulator = false;
            return;
        }
        window.requestAnimationFrame(execBlock);
    } catch(e) {
        if(DEBUG_LOG_DOWNLOAD) download("log.txt", dbg_log.join("\n"));
        console.error(e);
        startedOnce = false;
    }
}

// Function that starts a timer that continuously updates the CPU and all other components
function startCPU() {
    window.requestAnimationFrame(execBlock);
}