var tmp = [];

var funcmap = {
    // NOP
    0x00: ()=>{ nextfunc = fetchInstruction },

    // DI
    0xf3: () => {
        intr_state.ime = false;
        nextfunc = fetchInstruction;
        //console.log(`  DI`);
    },

    // EI
    0xfb: () => {
        intr_state.ime_queue = 2;
        nextfunc = fetchInstruction;
    },

    // HALT
    0x76: () => {
        if(intr_state.ime) cpu_halted = true;
        else {
            if((intr_state.ie & intr_state.if) === 0) skip_interrupt = cpu_halted = true;
            else halt_bug = true;
        }
        nextfunc = fetchInstruction;
    },

    // DAA
    0x27: () => {
        let cor = 0;
        let sc = false;
        if(registers.flag_h || (!registers.flag_n && (registers.a & 0xf) > 9)) cor |= 0x6;
        if(registers.flag_c || (!registers.flag_n && registers.a > 0x99)) {
            cor |= 0x60;
            sc = true;
        }
        registers.a += registers.flag_n ? -cor : cor;
        registers.flag_z = registers.a === 0;
        registers.flag_c = sc;
        registers.flag_h = false;
    },
};

//-------------------------------------------------------------------------------
// Dynamically Generated Functions
// ------------------------------------------------------------------------------

include("gb/instr/ld.js");
include("gb/instr/incdec.js");
include("gb/instr/ctrlflow.js");
include("gb/instr/stack.js");
include("gb/instr/alu8.js");
include("gb/instr/bitops.js");
include("gb/instr/cb_prefix.js");
include("gb/instr/alu16.js");