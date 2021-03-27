var cb_funcmap = {};
funcmap[0xcb] = () => {
    let cb_op = readByte(registers.pc++);
    nextfunc = cb_funcmap[cb_op];
    if(nextfunc === undefined)
        throw `Encountered unknown opcode $cb $${cb_op.toString(16).padStart(2, '0')} at $${(registers.pc-2).toString(16).padStart(4, '0')}`;
}

//-------------------------------------------------------------------------------
// SRL r8
//-------------------------------------------------------------------------------
function _srl_mem_hl(cycle) {
    switch(cycle) {
        default:
            nextfunc = _srl_mem_hl.bind(this, 1);
            break;
        case 1:
            tmp.push(readByte(registers.hl));
            registers.flag_n = registers.flag_h = false;
            registers.flag_c = (tmp[0] & 1) > 0;
            registers.flag_z = (tmp[0] >> 1) === 0;
            nextfunc = _srl_mem_hl.bind(this, 2);
            break;
        case 2:
            writeByte(registers.hl, tmp.pop() >> 1);
            nextfunc = fetchInstruction;
            break;
    }
}
for(let i = 0x38; i <= 0x3f; i++) {
    if(i === 0x3e) cb_funcmap[i] = _srl_mem_hl;
    else cb_funcmap[i] = ((target) => {
        let val = registers[target];
        registers.flag_n = registers.flag_h = false;
        registers.flag_c = (val & 1) > 0;
        registers.flag_z = (val >> 1) === 0;
        registers[target] = val >> 1;
        nextfunc = fetchInstruction;
    }).bind(this, ["b", "c", "d", "e", "h", "l", "(hl)", "a"][i & 0b111]);
}

//-------------------------------------------------------------------------------
// RR r8
//-------------------------------------------------------------------------------
function _rr_mem_hl(cycle) {
    switch(cycle) {
        default:
            nextfunc = _rr_mem_hl.bind(this, 1);
            break;
        case 1:
            let val = readByte(registers.hl);
            let cfill = registers.flag_c ? 1 << 7 : 0;
            registers.flag_n = registers.flag_h = false;
            registers.flag_c = (val & 1) > 0;
            registers.flag_z = ((val >> 1) | cfill) === 0;
            tmp.push((val >> 1) | cfill);
            nextfunc = _rr_mem_hl.bind(this, 2);
            break;
        case 2:
            writeByte(registers.hl, tmp.pop());
            nextfunc = fetchInstruction;
            break;
    }
}
for(let i = 0x18; i <= 0x1f; i++) {
    if(i === 0x1e) cb_funcmap[i] = _rr_mem_hl;
    else cb_funcmap[i] = ((target) => {
        let val = registers[target];
        let cfill = registers.flag_c ? 1 << 7 : 0;
        registers.flag_n = registers.flag_h = false;
        registers.flag_c = (val & 1) > 0;
        registers.flag_z = ((val >> 1) | cfill) === 0;
        registers[target] = ((val >> 1) | cfill);
        nextfunc = fetchInstruction;
    }).bind(this, ["b", "c", "d", "e", "h", "l", "(hl)", "a"][i & 0b111]);
}

//-------------------------------------------------------------------------------
// SWAP r8
//-------------------------------------------------------------------------------
function _swap_mem_hl(cycle) {
    switch(cycle) {
        default:
            nextfunc = _swap_mem_hl.bind(this, 1);
            break;
        case 1:
            tmp.push(readByte(registers.hl));
            nextfunc = _swap_mem_hl.bind(this, 2);
            break;
        case 2:
            let val = tmp.pop();
            val = ((val & 0xf) << 4) | ((val & 0xf0) >> 4);
            writeByte(registers.hl, val);
            registers.flag_c = registers.flag_h = registers.flag_n = false;
            registers.flag_z = val === 0;
            nextfunc = fetchInstruction;
            break;
    }
}
for(let i = 0x30; i <= 0x37; i++) {
    if(i === 0x36) cb_funcmap[i] = _swap_mem_hl;
    else cb_funcmap[i] = ((target) => {
        registers[target] = ((registers[target] & 0xf) << 4) | ((registers[target] & 0xf0) >> 4);
        registers.flag_c = registers.flag_h = registers.flag_n = false;
        registers.flag_z = registers[target] === 0;
        nextfunc = fetchInstruction;
        //console.log(`  SWAP ${target}`)
    }).bind(this, ["b", "c", "d", "e", "h", "l", "(hl)", "a"][i & 0b111]);
}