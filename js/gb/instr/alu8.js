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
// CP A, u8
//-------------------------------------------------------------------------------
function _cp_u8(cycle) {
    if(!cycle)
        nextfunc = _cp_u8.bind(this, 1);
    else {
        let cpv = readByte(registers.pc++);
        registers.flag_z = registers.a === cpv;
        registers.flag_n = true;
        registers.flag_h = (((registers.a & 0xf) - (cpv & 0xf)) & 0x10) < 0;
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
        registers.flag_h = (((registers.a & 0xf) - (cpv & 0xf)) & 0x10) < 0;
        registers.flag_c = cpv > registers.a;
        registers.a -= cpv;
        nextfunc = fetchInstruction;
        // console.log(`  SUB a, u8 | read u8`);
    }
}
funcmap[0xd6] = _sub_u8;



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
        console.log(`  ADC a, u8`);
    }
}
funcmap[0xce] = _adc_u8;