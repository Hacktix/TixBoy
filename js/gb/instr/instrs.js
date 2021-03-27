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

    0xcd: (cycle)=>{
        switch(cycle) {
            default:
                console.log(registers.pc.toString(16))
                nextfunc = funcmap[0xcd].bind(this, 1);
                break;
            case 1:
                tmp.push(readByte(registers.pc++));
                nextfunc = funcmap[0xcd].bind(this, 2);
                console.log(`  CALL u16 | read u16:lower`);
                break;
            case 2:
                tmp.push(tmp.pop() | (readByte(registers.pc++) << 8));
                nextfunc = funcmap[0xcd].bind(this, 3);
                console.log(`  CALL u16 | read u16:upper`);
                break;
            case 3:
                nextfunc = funcmap[0xcd].bind(this, 4);
                console.log(`  CALL u16 | branch decision?`);
                break;
            case 4:
                writeByte(--registers.sp, (registers.pc & 0xff00) >> 8);
                nextfunc = funcmap[0xcd].bind(this, 5);
                console.log(`  CALL u16 | write pc:upper->(--sp)`);
                break;
            case 5:
                writeByte(--registers.sp, registers.pc & 0xff);
                registers.pc = tmp.pop();
                nextfunc = fetchInstruction;
                console.log(`  CALL u16 | write pc:upper->(--sp)`);
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