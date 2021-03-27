var tmp = [];

var funcmap = {
    // NOP
    0x00: fetchInstruction,
    
    // JP u16
    0xc3: (cycle)=>{
        switch(cycle) {
            case 1:
                registers.pc = (readByte(registers.pc) << 8) + tmp.pop();
                nextfunc = funcmap[0xc3].bind(this, 2);
                console.log("  JP u16 | read u16:upper");
                break;
            case 2:
                nextfunc = fetchInstruction;
                console.log("  JP u16 | branch decision?");
                break;
            default:
                tmp.push(readByte(registers.pc++));
                nextfunc = funcmap[0xc3].bind(this, 1);
                console.log("  JP u16 | read u16:lower");
        }
    }
};