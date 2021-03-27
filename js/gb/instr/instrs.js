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
                console.log("  JP u16 | read u16:lower");
                break;
            case 2:
                registers.pc = (readByte(registers.pc) << 8) + tmp.pop();
                nextfunc = funcmap[0xc3].bind(this, 3);
                console.log("  JP u16 | read u16:upper");
                break;
            case 3:
                nextfunc = fetchInstruction;
                console.log("  JP u16 | branch decision?");
                break;
        }
    },
};

//------------------------------------------------------------------------------
// Dynamically Generated Functions
// ------------------------------------------------------------------------------

// LD r16, u16
function _ld_r16_u16(target, cycle) {
    switch(cycle) {
        default:
            nextfunc = _ld_r16_u16.bind(this, target, 1);
            break;
        case 1:
            registers[target[1]] = readByte(registers.pc++);
            nextfunc = _ld_r16_u16.bind(this, target, 2);
            console.log(`  LD ${target},u16 | read u16:lower->${target[1]}`);
            break;
        case 2:
            registers[target[0]] = readByte(registers.pc++);
            nextfunc = fetchInstruction;
            console.log(`  LD ${target},u16 | read u16:upper->${target[0]}`);
            break;
    }
}
for(let i = 0x01; i <= 0x31; i+= 0x10)
    funcmap[i] = _ld_r16_u16.bind(this, ["bc", "de", "hl", "sp"][(i & 0xf0) >> 4]);