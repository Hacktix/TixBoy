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
// RLC r8
//-------------------------------------------------------------------------------
function _rlc_mem_hl(cycle) {
    switch(cycle) {
        default:
            nextfunc = _rlc_mem_hl.bind(this, 1);
            break;
        case 1:
            tmp.push(readByte(registers.hl));
            registers.flag_n = registers.flag_h = false;
            registers.flag_c = (tmp[0] & 0x80) > 0;
            nextfunc = _rlc_mem_hl.bind(this, 2);
            break;
        case 2:
            let v = tmp.pop();
            v = (v << 1) | ((v & 0x80) >> 7);
            registers.flag_z = v === 0;
            writeByte(registers.hl, v);
            nextfunc = fetchInstruction;
            break;
    }
}
for(let i = 0x00; i < 0x08; i++) {
    if(i === 0x06) cb_funcmap[i] = _rlc_mem_hl;
    else cb_funcmap[i] = ((target) => {
        let v = registers[target];
        registers.flag_n = registers.flag_h = false;
        registers.flag_c = (v & 0x80) > 0;
        v = (v << 1) | ((v & 0x80) >> 7);
        registers.flag_z = v === 0;
        registers[target] = v;
        nextfunc = fetchInstruction;
    }).bind(this, ["b", "c", "d", "e", "h", "l", "(hl)", "a"][i & 0b111]);
}

//-------------------------------------------------------------------------------
// RRC r8
//-------------------------------------------------------------------------------
function _rrc_mem_hl(cycle) {
    switch(cycle) {
        default:
            nextfunc = _rrc_mem_hl.bind(this, 1);
            break;
        case 1:
            tmp.push(readByte(registers.hl));
            registers.flag_n = registers.flag_h = false;
            registers.flag_c = (tmp[0] & 1) > 0;
            nextfunc = _rrc_mem_hl.bind(this, 2);
            break;
        case 2:
            let v = tmp.pop();
            v = (v >> 1) | ((v & 1) << 7);
            registers.flag_z = v === 0;
            writeByte(registers.hl, v);
            nextfunc = fetchInstruction;
            break;
    }
}
for(let i = 0x08; i < 0x10; i++) {
    if(i === 0x0e) cb_funcmap[i] = _rrc_mem_hl;
    else cb_funcmap[i] = ((target) => {
        let v = registers[target];
        registers.flag_n = registers.flag_h = false;
        registers.flag_c = (v & 1) > 0;
        v = (v >> 1) | ((v & 1) << 7);
        registers.flag_z = v === 0;
        registers[target] = v;
        nextfunc = fetchInstruction;
    }).bind(this, ["b", "c", "d", "e", "h", "l", "(hl)", "a"][i & 0b111]);
}

//-------------------------------------------------------------------------------
// RL r8
//-------------------------------------------------------------------------------
function _rl_mem_hl(cycle) {
    switch(cycle) {
        default:
            nextfunc = _rl_mem_hl.bind(this, 1);
            break;
        case 1:
            let val = readByte(registers.hl);
            let cfill = registers.flag_c ? 1 : 0;
            registers.flag_n = registers.flag_h = false;
            registers.flag_c = (val & 0x80) > 0;
            registers.flag_z = (((val << 1) | cfill) & 0xff) === 0;
            tmp.push((((val << 1) | cfill) & 0xff));
            nextfunc = _rl_mem_hl.bind(this, 2);
            break;
        case 2:
            writeByte(registers.hl, tmp.pop());
            nextfunc = fetchInstruction;
            break;
    }
}
for(let i = 0x10; i <= 0x18; i++) {
    if(i === 0x16) cb_funcmap[i] = _rl_mem_hl;
    else cb_funcmap[i] = ((target) => {
        let val = registers[target];
        let cfill = registers.flag_c ? 1 : 0;
        registers.flag_n = registers.flag_h = false;
        registers.flag_c = (val & 0x80) > 0;
        registers.flag_z = (((val << 1) | cfill) & 0xff) === 0;
        registers[target] = ((val << 1) | cfill);
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

//-------------------------------------------------------------------------------
// BIT u3, r8
//-------------------------------------------------------------------------------
function _bit_mem_hl(bit, cycle) {
    if(!cycle)
        nextfunc = _bit_mem_hl.bind(this, bit, 1);
    else {
        registers.flag_n = false;
        registers.flag_h = true;
        registers.flag_z = (readByte(registers.hl) & (1 << bit)) === 0;
        nextfunc = fetchInstruction;
    }
}
for(let i = 0x40; i < 0x80; i++) {
    let src = ["b", "c", "d", "e", "h", "l", "(hl)", "a"][i & 0b111];
    if(src === "(hl)")
        cb_funcmap[i] = _bit_mem_hl.bind(this, (i&0b111000) >> 3);
    else
        cb_funcmap[i] = ((bit, target)=>{
            registers.flag_n = false;
            registers.flag_h = true;
            registers.flag_z = (registers[target] & (1 << bit)) === 0;
            nextfunc = fetchInstruction;
        }).bind(this, (i&0b111000) >> 3, src);
}

//-------------------------------------------------------------------------------
// RES u3, r8
//-------------------------------------------------------------------------------
function _bit_res_hl(bit, cycle) {
    switch(cycle) {
        default:
            nextfunc = _bit_res_hl.bind(this, bit, 1);
            break;
        case 1:
            tmp.push(readByte(registers.hl));
            nextfunc = _bit_res_hl.bind(this, bit, 2);
            break;
        case 2:
            writeByte(registers.hl, tmp.pop() & (~(1 << bit)));
            nextfunc = fetchInstruction;
            break;
    }
}
for(let i = 0x80; i < 0xc0; i++) {
    let src = ["b", "c", "d", "e", "h", "l", "(hl)", "a"][i & 0b111];
    if(src === "(hl)")
        cb_funcmap[i] = _bit_res_hl.bind(this, (i&0b111000) >> 3);
    else
        cb_funcmap[i] = ((bit, target)=>{
            registers[target] = registers[target] & (~(1 << bit));
            nextfunc = fetchInstruction;
        }).bind(this, (i&0b111000) >> 3, src);
}

//-------------------------------------------------------------------------------
// SET u3, r8
//-------------------------------------------------------------------------------
function _bit_set_hl(bit, cycle) {
    switch(cycle) {
        default:
            nextfunc = _bit_set_hl.bind(this, bit, 1);
            break;
        case 1:
            tmp.push(readByte(registers.hl));
            nextfunc = _bit_set_hl.bind(this, bit, 2);
            break;
        case 2:
            writeByte(registers.hl, tmp.pop() | (1 << bit));
            nextfunc = fetchInstruction;
            break;
    }
}
for(let i = 0xc0; i < 0x100; i++) {
    let src = ["b", "c", "d", "e", "h", "l", "(hl)", "a"][i & 0b111];
    if(src === "(hl)")
        cb_funcmap[i] = _bit_set_hl.bind(this, (i&0b111000) >> 3);
    else
        cb_funcmap[i] = ((bit, target)=>{
            registers[target] = registers[target] | (1 << bit);
            nextfunc = fetchInstruction;
        }).bind(this, (i&0b111000) >> 3, src);
}

//-------------------------------------------------------------------------------
// SLA r8
//-------------------------------------------------------------------------------
function _sla_mem_hl(cycle) {
    switch(cycle) {
        default:
            nextfunc = _sla_mem_hl.bind(this, 1);
            break;
        case 1:
            tmp.push(readByte(registers.hl));
            nextfunc = _sla_mem_hl.bind(this, 2);
            break;
        case 2:
            let v = tmp.pop();
            registers.flag_c = (v & 0b10000000) > 0;
            registers.flag_n = registers.flag_h = false;
            v = (v << 1) & 0xff;
            registers.flag_z = v === 0;
            writeByte(registers.hl, v);
            nextfunc = fetchInstruction;
    }
}
for(let i = 0x20; i < 0x28; i++) {
    if(i === 0x26) cb_funcmap[i] = _sla_mem_hl;
    else cb_funcmap[i] = ((target) => {
        let v = registers[target];
        registers.flag_c = (v & 0b10000000) > 0;
        registers.flag_n = registers.flag_h = false;
        v = (v << 1) & 0xff;
        registers.flag_z = v === 0;
        registers[target] = v;
        nextfunc = fetchInstruction;
    }).bind(this, ["b", "c", "d", "e", "h", "l", "(hl)", "a"][i & 0b111]);
}



//-------------------------------------------------------------------------------
// SRA r8
//-------------------------------------------------------------------------------
function _sra_mem_hl(cycle) {
    switch(cycle) {
        default:
            nextfunc = _sra_mem_hl.bind(this, 1);
            break;
        case 1:
            tmp.push(readByte(registers.hl));
            nextfunc = _sra_mem_hl.bind(this, 2);
            break;
        case 2:
            let v = tmp.pop();
            registers.flag_c = (v & 1) > 0;
            registers.flag_n = registers.flag_h = false;
            v = (v >> 1) | (v & 0x80);
            registers.flag_z = v === 0;
            writeByte(registers.hl, v);
            nextfunc = fetchInstruction;
    }
}
for(let i = 0x28; i < 0x30; i++) {
    if(i === 0x2e) cb_funcmap[i] = _sra_mem_hl;
    else cb_funcmap[i] = ((target) => {
        let v = registers[target];
        registers.flag_c = (v & 1) > 0;
        registers.flag_n = registers.flag_h = false;
        v = (v >> 1) | (v & 0x80);
        registers.flag_z = v === 0;
        registers[target] = v;
        nextfunc = fetchInstruction;
    }).bind(this, ["b", "c", "d", "e", "h", "l", "(hl)", "a"][i & 0b111]);
}