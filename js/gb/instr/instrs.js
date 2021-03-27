var tmp = [];

var funcmap = {
    // NOP
    0x00: ()=>{ nextfunc = fetchInstruction },
    
    // JP u16
    0xc3: (cycle)=>{
        switch(cycle) {
            default:
                nextfunc = funcmap[0xc3].bind(this, 1);
                break;
            case 1:
                tmp.push(readByte(registers.pc++));
                nextfunc = funcmap[0xc3].bind(this, 2);
                //console.log("  JP u16 | read u16:lower");
                break;
            case 2:
                registers.pc = (readByte(registers.pc) << 8) + tmp.pop();
                nextfunc = funcmap[0xc3].bind(this, 3);
                //console.log("  JP u16 | read u16:upper");
                break;
            case 3:
                nextfunc = fetchInstruction;
                //console.log("  JP u16 | branch decision?");
                break;
        }
    },

    // DI
    0xf3: () => {
        intr_state.ime = false;
        nextfunc = fetchInstruction;
        //console.log(`  DI`);
    }
};

//-------------------------------------------------------------------------------
// Dynamically Generated Functions
// ------------------------------------------------------------------------------

include("gb/instr/ld.js");
include("gb/instr/incdec.js");
include("gb/instr/ctrlflow.js");