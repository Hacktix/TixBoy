//-------------------------------------------------------------------------------
// LD r16, u16
//-------------------------------------------------------------------------------
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



//-------------------------------------------------------------------------------
// LD r8, r8
//-------------------------------------------------------------------------------
function _ld_mem_hl_r8(source, target, cycle) {
    if(!cycle)
        nextfunc = _ld_mem_hl_r8.bind(this, source, target, 1);
    else {
        console.log(`  LD ${target}, ${source} | read ${source}->${target}`);
        if(source === "(hl)")
            registers[target] = readByte(registers.hl);
        else
            writeByte(registers.hl, registers[source]);
    }
}
for(let i = 0x40; i < 0x80; i++) {
    if(i === 0x76) continue;              // HALT
    let src = ["b", "c", "d", "e", "h", "l", "(hl)", "a"][i & 0b111];
    let dst = ["b", "c", "d", "e", "h", "l", "(hl)", "a"][(i & 0b111000) >> 3];
    if(src === "(hl)" || dst === "(hl)")
        funcmap[i] = _ld_mem_hl_r8.bind(this, src, dst);
    else
        funcmap[i] = ((source, target)=>{
            registers[target] = registers[source];
            console.log(`  LD ${target}, ${source}`);
            nextfunc = fetchInstruction;
        }).bind(this, src, dst);
}



//-------------------------------------------------------------------------------
// LD r8, u8
//-------------------------------------------------------------------------------
function _ld_r8_u8(target, cycle) {
    switch(cycle) {
        default:
            nextfunc = _ld_r8_u8.bind(this, target, 1);
            break;
        case 1:
            if(target === "(hl)") {
                tmp.push(readByte(registers.pc++));
                nextfunc = _ld_r8_u8.bind(this, target, 2);
                console.log(`  LD ${target}, u8 | read u8`);
            } else {
                registers[target] = readByte(registers.pc++);
                nextfunc = fetchInstruction;
                console.log(`  LD ${target}, u8 | read u8->${target}`);
            }
            break;
        case 2:
            writeByte(registers.hl, tmp.pop);
            nextfunc = fetchInstruction;
            console.log(`  LD ${target}, u8 | write ${target}`);
            break;
    }
}
for(let i = 0x06; i <= 0x3e; i+= 8)
    funcmap[i] = _ld_r8_u8.bind(this, ["b", "c", "d", "e", "h", "l", "(hl)", "a"][(i & 0b111000) >> 3]);