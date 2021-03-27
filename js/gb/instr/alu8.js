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