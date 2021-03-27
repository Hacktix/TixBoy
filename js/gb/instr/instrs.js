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

    0xfb: () => {
        intr_state.ime_queue = true;
        nextfunc = fetchInstruction;
    }
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