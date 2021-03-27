//-------------------------------------------------------------------------------
// INC r8
//-------------------------------------------------------------------------------
function _inc_mem_hl(cycle) {
    switch(cycle) {
        default:
            nextfunc = _inc_mem_hl.bind(this, 1);
            break;
        case 1:
            tmp.push(readByte(registers.hl));
            nextfunc = _inc_mem_hl.bind(this, 2);
            //console.log(`  INC (hl) | read (hl)`);
        case 2:
            registers.flag_h = (tmp[0] & 0xf) === 0xf;
            let v = (tmp.pop() + 1) & 0xff;
            registers.flag_z = v === 0;
            registers.flag_n = false;
            writeByte(registers.hl, v);
            nextfunc = fetchInstruction
            //console.log(`  INC (hl) | write (hl)`);
    }
}
for(let i = 0x04; i <= 0x3c; i += 0x08) {
    if(i === 0x34)
        funcmap[i] = _inc_mem_hl.bind(this);
    else
        funcmap[i] = ((target) => {
            registers.flag_h = (registers[target] & 0xf) === 0xf;
            let v = (registers[target] + 1) & 0xff;
            registers.flag_z = v === 0;
            registers.flag_n = false;
            registers[target] = v;
            nextfunc = fetchInstruction;
            //console.log(`  INC ${target}`);
        }).bind(this, ["b", "c", "d", "e", "h", "l", "(hl)", "a"][(i & 0b111000) >> 3])
}

//-------------------------------------------------------------------------------
// DEC r8
//-------------------------------------------------------------------------------
function _dec_mem_hl(cycle) {
    switch(cycle) {
        default:
            nextfunc = _dec_mem_hl.bind(this, 1);
            break;
        case 1:
            tmp.push(readByte(registers.hl));
            nextfunc = _dec_mem_hl.bind(this, 2);
            //console.log(`  DEC (hl) | read (hl)`);
        case 2:
            registers.flag_h = (tmp[0] & 0xf) === 0;
            let v = (tmp.pop() - 1) & 0xff;
            registers.flag_z = v === 0;
            registers.flag_n = true;
            writeByte(registers.hl, v);
            nextfunc = fetchInstruction
            //console.log(`  DEC (hl) | write (hl)`);
    }
}
for(let i = 0x05; i <= 0x3d; i += 0x08) {
    if(i === 0x35)
        funcmap[i] = _dec_mem_hl.bind(this);
    else
        funcmap[i] = ((target) => {
            registers.flag_h = (registers[target] & 0xf) === 0;
            let v = (registers[target] - 1) & 0xff;
            registers.flag_z = v === 0;
            registers.flag_n = true;
            registers[target] = v;
            nextfunc = fetchInstruction;
            //console.log(`  DEC ${target}`);
        }).bind(this, ["b", "c", "d", "e", "h", "l", "(hl)", "a"][(i & 0b111000) >> 3])
}



//-------------------------------------------------------------------------------
// INC r16
//-------------------------------------------------------------------------------
function _inc_r16(target, cycle) {
    if(!cycle)
        nextfunc = _inc_r16.bind(this, target, 1);
    else {
        registers[target]++;
        nextfunc = fetchInstruction;
        console.log(`  INC ${target}`);
    }
}
for(let i = 0x03; i <= 0x33; i += 0x10)
    funcmap[i] = _inc_r16.bind(this, ["bc", "de", "hl", "sp"][(i & 0b110000) >> 4]);