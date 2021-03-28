// Interrupt-related CPU variables
var intr_state = {
    _if: 0,
    _ie: 0,
    ime: false,
    ime_queue: 0,

    get if() { return this._if; },
    set if(v) { this._if = v & 0x1f; },

    get ie() { return this._ie; },
    set ie(v) { this._ie = v & 0x1f; },
};

function handleInterrupt(vec, cycle) {
    switch(cycle) {
        case 0:
        case 1:
        case 2:
            nextfunc = handleInterrupt.bind(this, vec, cycle+1);
            break;
        case 3:
            writeByte(--registers.sp, (registers.pc & 0xff00) >> 8);
            nextfunc = handleInterrupt.bind(this, vec, 4);
            break;
        case 4:
            writeByte(--registers.sp, registers.pc & 0xff);
            registers.pc = vec;
            intr_state.ime = false;
            nextfunc = fetchInstruction;
            break;

    }
}