//-------------------------------------------------------------------------------
// RRA
//-------------------------------------------------------------------------------
funcmap[0x1f] = () => {
    let rv = registers.flag_c ? (1 << 7) : 0;
    registers.flag_c = (registers.a & 1) > 0;
    registers.a = (registers.a >> 1) | rv;
    registers.flag_h = registers.flag_n = registers.flag_z = false;
    //console.log(`  RRA`);
};