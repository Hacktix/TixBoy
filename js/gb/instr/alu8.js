//-------------------------------------------------------------------------------
// OR A, r8
//-------------------------------------------------------------------------------
function _or_mem_hl(cycle) {
    if(!cycle)
        nextfunc = _or_mem_hl.bind(this, 1);
    else {
        registers.a |= readByte(registers.hl);
        registers.flag_n = registers.flag_h = registers.flag_c = false;
        registers.flag_z = registers.a === 0;
        nextfunc = fetchInstruction;
    }
}
for(let i = 0xb0; i < 0xb8; i++) {
    if(i === 0xb6)
        funcmap[i] = _or_mem_hl;
    else
        funcmap[i] = ((source) => {
            registers.a |= registers[source];
            registers.flag_n = registers.flag_h = registers.flag_c = false;
            registers.flag_z = registers.a === 0;
        }).bind(this, ["b", "c", "d", "e", "h", "l", "(hl)", "a"][i & 0b111])
}



//-------------------------------------------------------------------------------
// AND A, r8
//-------------------------------------------------------------------------------
function _and_mem_hl(cycle) {
    if(!cycle)
        nextfunc = _and_mem_hl.bind(this, 1);
    else {
        registers.a &= readByte(registers.hl);
        registers.flag_n = registers.flag_c = false;
        registers.flag_h = true;
        registers.flag_z = registers.a === 0;
        nextfunc = fetchInstruction;
    }
}
for(let i = 0xa0; i < 0xa8; i++) {
    if(i === 0xa6)
        funcmap[i] = _and_mem_hl;
    else
        funcmap[i] = ((source) => {
            registers.a &= registers[source];
            registers.flag_n = registers.flag_c = false;
            registers.flag_h = true;
            registers.flag_z = registers.a === 0;
            nextfunc = fetchInstruction;
        }).bind(this, ["b", "c", "d", "e", "h", "l", "(hl)", "a"][i & 0b111])
}



//-------------------------------------------------------------------------------
// ADD A, r8
//-------------------------------------------------------------------------------
function _add_mem_hl(cycle) {
    if(!cycle)
        nextfunc = _add_mem_hl.bind(this, 1);
    else {
        let addv = readByte(registers.hl);
        registers.flag_n = false;
        registers.flag_h = (registers.a & 0xf) + (addv & 0xf) > 0xf;
        registers.flag_c = registers.a + addv > 0xff;
        registers.a += addv;
        registers.flag_z = registers.a === 0;
        nextfunc = fetchInstruction;
    }
}
for(let i = 0x80; i < 0x88; i++) {
    if(i === 0x86)
        funcmap[i] = _add_mem_hl;
    else
        funcmap[i] = ((source) => {
            let addv = registers[source];
            registers.flag_n = false;
            registers.flag_h = (registers.a & 0xf) + (addv & 0xf) > 0xf;
            registers.flag_c = registers.a + addv > 0xff;
            registers.a += addv;
            registers.flag_z = registers.a === 0;
            nextfunc = fetchInstruction;
        }).bind(this, ["b", "c", "d", "e", "h", "l", "(hl)", "a"][i & 0b111])
}



//-------------------------------------------------------------------------------
// ADC A, r8
//-------------------------------------------------------------------------------
function _adc_mem_hl(cycle) {
    if(!cycle)
        nextfunc = _adc_mem_hl.bind(this, 1);
    else {
        let addv = (readByte(registers.hl) + registers.flag_c) & 0xff;
        registers.flag_n = false;
        registers.flag_h = (registers.a & 0xf) + (readByte(registers.hl) & 0xf) + registers.flag_c > 0xf;
        registers.flag_c = registers.a + readByte(registers.hl) + registers.flag_c > 0xff;
        registers.a += addv;
        registers.flag_z = registers.a === 0;
        nextfunc = fetchInstruction;
    }
}
for(let i = 0x88; i < 0x90; i++) {
    if(i === 0x8e)
        funcmap[i] = _adc_mem_hl;
    else
        funcmap[i] = ((source) => {
            let addv = (registers[source] + registers.flag_c) & 0xff;
            registers.flag_n = false;
            registers.flag_h = (registers.a & 0xf) + (registers[source] & 0xf) + registers.flag_c > 0xf;
            registers.flag_c = registers.a + registers[source] + registers.flag_c > 0xff;
            registers.a += addv;
            registers.flag_z = registers.a === 0;
            nextfunc = fetchInstruction;
        }).bind(this, ["b", "c", "d", "e", "h", "l", "(hl)", "a"][i & 0b111])
}



//-------------------------------------------------------------------------------
// XOR A, r8
//-------------------------------------------------------------------------------
function _xor_mem_hl(cycle) {
    if(!cycle)
        nextfunc = _xor_mem_hl.bind(this, 1);
    else {
        registers.a ^= readByte(registers.hl);
        registers.flag_n = registers.flag_h = registers.flag_c = false;
        registers.flag_z = registers.a === 0;
        nextfunc = fetchInstruction;
    }
}
for(let i = 0xa8; i < 0xb0; i++) {
    if(i === 0xae)
        funcmap[i] = _xor_mem_hl;
    else
        funcmap[i] = ((source) => {
            registers.a ^= registers[source];
            registers.flag_n = registers.flag_h = registers.flag_c = false;
            registers.flag_z = registers.a === 0;
        }).bind(this, ["b", "c", "d", "e", "h", "l", "(hl)", "a"][i & 0b111])
}



//-------------------------------------------------------------------------------
// SUB A, r8
//-------------------------------------------------------------------------------
function _sub_mem_hl(cycle) {
    if(!cycle)
        nextfunc = _sub_mem_hl.bind(this, 1);
    else {
        let cpv = readByte(registers.hl);
        registers.flag_z = registers.a === cpv;
        registers.flag_n = true;
        registers.flag_h = (cpv & 0xf) > (registers.a & 0xf)
        registers.flag_c = cpv > registers.a;
        registers.a -= cpv;
        nextfunc = fetchInstruction;
    }
}
for(let i = 0x90; i < 0x98; i++) {
    if(i === 0x96) funcmap[i] = _sub_mem_hl;
    else funcmap[i] = ((source) => {
        let cpv = registers[source];
        registers.flag_z = registers.a === cpv;
        registers.flag_n = true;
        registers.flag_h = (cpv & 0xf) > (registers.a & 0xf)
        registers.flag_c = cpv > registers.a;
        registers.a -= cpv;
        nextfunc = fetchInstruction;
    }).bind(this, ["b", "c", "d", "e", "h", "l", "(hl)", "a"][i & 0b111]);
}



//-------------------------------------------------------------------------------
// SBC A, r8
//-------------------------------------------------------------------------------
function _sbc_mem_hl(cycle) {
    if(!cycle)
        nextfunc = _sbc_mem_hl.bind(this, 1);
    else {
        let bv = readByte(registers.hl);
        let cpv = (bv + registers.flag_c) & 0xff;
        registers.flag_z = registers.a === cpv;
        registers.flag_n = true;
        registers.flag_h = (bv & 0xf) + registers.flag_c > (registers.a & 0xf)
        registers.flag_c = bv + registers.flag_c > registers.a;
        registers.a -= cpv;
        nextfunc = fetchInstruction;
        // console.log(`  SUB a, u8 | read u8`);
    }
}
for(let i = 0x98; i < 0xa0; i++) {
    if(i === 0x9e) funcmap[i] = _sbc_mem_hl;
    else funcmap[i] = ((source) => {
        let cpv = (registers[source] + registers.flag_c) & 0xff;
        registers.flag_z = registers.a === cpv;
        registers.flag_n = true;
        registers.flag_h = (registers[source] & 0xf) + registers.flag_c > (registers.a & 0xf)
        registers.flag_c = registers[source] + registers.flag_c > registers.a;
        registers.a -= cpv;
        nextfunc = fetchInstruction;
    }).bind(this, ["b", "c", "d", "e", "h", "l", "(hl)", "a"][i & 0b111]);
}



//-------------------------------------------------------------------------------
// CP A, r8
//-------------------------------------------------------------------------------
function _cp_mem_hl(cycle) {
    if(!cycle)
        nextfunc = _cp_mem_hl.bind(this, 1);
    else {
        let cpv = readByte(registers.hl);
        registers.flag_z = registers.a === cpv;
        registers.flag_n = true;
        registers.flag_h = (cpv & 0xf) > (registers.a & 0xf)
        registers.flag_c = cpv > registers.a;
        nextfunc = fetchInstruction;
    }
}
for(let i = 0xb8; i < 0xc0; i++) {
    if(i === 0xbe) funcmap[i] = _cp_mem_hl;
    else funcmap[i] = ((source) => {
        let cpv = registers[source];
        registers.flag_z = registers.a === cpv;
        registers.flag_n = true;
        registers.flag_h = (cpv & 0xf) > (registers.a & 0xf)
        registers.flag_c = cpv > registers.a;
        nextfunc = fetchInstruction;
    }).bind(this, ["b", "c", "d", "e", "h", "l", "(hl)", "a"][i & 0b111]);
}



//-------------------------------------------------------------------------------
// AND A, u8
//-------------------------------------------------------------------------------
function _and_u8(cycle) {
    if(!cycle)
        nextfunc = _and_u8.bind(this, 1);
    else {
        registers.a &= readByte(registers.pc++);
        registers.flag_n = registers.flag_c = false;
        registers.flag_h = true;
        registers.flag_z = registers.a === 0;
        nextfunc = fetchInstruction;
    }
}
funcmap[0xe6] = _and_u8;



//-------------------------------------------------------------------------------
// OR A, u8
//-------------------------------------------------------------------------------
function _or_u8(cycle) {
    if(!cycle)
        nextfunc = _or_u8.bind(this, 1);
    else {
        registers.a |= readByte(registers.pc++);
        registers.flag_n = registers.flag_c = registers.flag_h = false;
        registers.flag_z = registers.a === 0;
        nextfunc = fetchInstruction;
    }
}
funcmap[0xf6] = _or_u8;



//-------------------------------------------------------------------------------
// XOR A, u8
//-------------------------------------------------------------------------------
function _xor_u8(cycle) {
    if(!cycle)
        nextfunc = _xor_u8.bind(this, 1);
    else {
        registers.a ^= readByte(registers.pc++);
        registers.flag_n = registers.flag_h = registers.flag_c = false;
        registers.flag_z = registers.a === 0;
        nextfunc = fetchInstruction;
    }
}
funcmap[0xee] = _xor_u8;



//-------------------------------------------------------------------------------
// CP A, u8
//-------------------------------------------------------------------------------
function _cp_u8(cycle) {
    if(!cycle)
        nextfunc = _cp_u8.bind(this, 1);
    else {
        let cpv = readByte(registers.pc++);
        registers.flag_z = registers.a === cpv;
        registers.flag_n = true;
        registers.flag_h = (cpv & 0xf) > (registers.a & 0xf)
        registers.flag_c = cpv > registers.a;
        nextfunc = fetchInstruction;
    }
}
funcmap[0xfe] = _cp_u8;



//-------------------------------------------------------------------------------
// SUB A, u8
//-------------------------------------------------------------------------------
function _sub_u8(cycle) {
    if(!cycle)
        nextfunc = _sub_u8.bind(this, 1);
    else {
        let cpv = readByte(registers.pc++);
        registers.flag_z = registers.a === cpv;
        registers.flag_n = true;
        registers.flag_h = (cpv & 0xf) > (registers.a & 0xf)
        registers.flag_c = cpv > registers.a;
        registers.a -= cpv;
        nextfunc = fetchInstruction;
        // console.log(`  SUB a, u8 | read u8`);
    }
}
funcmap[0xd6] = _sub_u8;



//-------------------------------------------------------------------------------
// SBC A, u8
//-------------------------------------------------------------------------------
function _sbc_u8(cycle) {
    if(!cycle)
        nextfunc = _sbc_u8.bind(this, 1);
    else {
        let bv = readByte(registers.pc++);
        let cpv = (bv + registers.flag_c) & 0xff;
        registers.flag_z = registers.a === cpv;
        registers.flag_n = true;
        registers.flag_h = (bv & 0xf) + registers.flag_c > (registers.a & 0xf)
        registers.flag_c = bv + registers.flag_c > registers.a;
        registers.a -= cpv;
        nextfunc = fetchInstruction;
    }
}
funcmap[0xde] = _sbc_u8;



//-------------------------------------------------------------------------------
// ADD A, u8
//-------------------------------------------------------------------------------
function _add_u8(cycle) {
    if(!cycle)
        nextfunc = _add_u8.bind(this, 1);
    else {
        let addv = readByte(registers.pc++);
        registers.flag_n = false;
        registers.flag_h = (registers.a & 0xf) + (addv & 0xf) > 0xf;
        registers.flag_c = registers.a + addv > 0xff;
        registers.a += addv;
        registers.flag_z = registers.a === 0;
        nextfunc = fetchInstruction;
    }
}
funcmap[0xc6] = _add_u8;



//-------------------------------------------------------------------------------
// ADC A, u8
//-------------------------------------------------------------------------------
function _adc_u8(cycle) {
    if(!cycle)
        nextfunc = _adc_u8.bind(this, 1);
    else {
        let bv = readByte(registers.pc++);
        let addv = (bv + registers.flag_c) & 0xff;
        registers.flag_n = false;
        registers.flag_h = (registers.a & 0xf) + (bv & 0xf) + registers.flag_c > 0xf;
        registers.flag_c = registers.a + bv + registers.flag_c > 0xff;
        registers.a += addv;
        registers.flag_z = registers.a === 0;
        nextfunc = fetchInstruction;
    }
}
funcmap[0xce] = _adc_u8;