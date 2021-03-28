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
        //console.log(`  OR a, (hl)`);
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
            //console.log(`  OR a, ${source}`);
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
        registers.flag_h = (registers.a & 0xf) + (addv & 0xf) > 0xf;
        registers.flag_c = registers.a + addv > 0xff;
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
            registers.flag_h = (registers.a & 0xf) + (addv & 0xf) > 0xf;
            registers.flag_c = registers.a + addv > 0xff;
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
        //console.log(`  XOR a, (hl)`);
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
            //console.log(`  XOR a, ${source}`);
        }).bind(this, ["b", "c", "d", "e", "h", "l", "(hl)", "a"][i & 0b111])
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
        //console.log(`  AND a, u8`);
    }
}
funcmap[0xe6] = _and_u8;



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
        //console.log(`  XOR a, (hl)`);
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
        //console.log(`  CP a, u8 | read u8`);
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
        let cpv = (readByte(registers.pc++) + registers.flag_c) & 0xff;
        registers.flag_z = registers.a === cpv;
        registers.flag_n = true;
        registers.flag_h = (cpv & 0xf) > (registers.a & 0xf)
        registers.flag_c = cpv > registers.a;
        registers.a -= cpv;
        nextfunc = fetchInstruction;
        // console.log(`  SUB a, u8 | read u8`);
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
        //console.log(`  ADD a, u8`);
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
        let addv = (readByte(registers.pc++) + registers.flag_c) & 0xff;
        registers.flag_n = false;
        registers.flag_h = (registers.a & 0xf) + (addv & 0xf) > 0xf;
        registers.flag_c = registers.a + addv > 0xff;
        registers.a += addv;
        registers.flag_z = registers.a === 0;
        nextfunc = fetchInstruction;
        //console.log(`  ADC a, u8`);
    }
}
funcmap[0xce] = _adc_u8;