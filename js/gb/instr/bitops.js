//-------------------------------------------------------------------------------
// RRA
//-------------------------------------------------------------------------------
funcmap[0x1f] = () => {
    let rv = registers.flag_c ? (1 << 7) : 0;
    registers.flag_c = (registers.a & 1) > 0;
    registers.a = (registers.a >> 1) | rv;
    registers.flag_h = registers.flag_n = registers.flag_z = false;
};

//-------------------------------------------------------------------------------
// RLA
//-------------------------------------------------------------------------------
funcmap[0x17] = () => {
    let rv = registers.flag_c ? 1 : 0;
    registers.flag_c = (registers.a & 0x80) > 0;
    registers.a = (registers.a << 1) | rv;
    registers.flag_h = registers.flag_n = registers.flag_z = false;
};

//-------------------------------------------------------------------------------
// RRCA
//-------------------------------------------------------------------------------
funcmap[0x0f] = () => {
    let rv = (registers.a & 1) << 7
    registers.flag_c = (registers.a & 1) > 0;
    registers.a = (registers.a >> 1) | rv;
    registers.flag_h = registers.flag_n = registers.flag_z = false;
};

//-------------------------------------------------------------------------------
// RLCA
//-------------------------------------------------------------------------------
funcmap[0x07] = () => {
    let rv = (registers.a & 0x80) >> 7
    registers.flag_c = (registers.a & 0x80) > 0;
    registers.a = (registers.a << 1) | rv;
    registers.flag_h = registers.flag_n = registers.flag_z = false;
};

//-------------------------------------------------------------------------------
// CPL
//-------------------------------------------------------------------------------
funcmap[0x2f] = () => {
    registers.a = ~registers.a
    registers.flag_n = registers.flag_h = true;
}

//-------------------------------------------------------------------------------
// SCF
//-------------------------------------------------------------------------------
funcmap[0x37] = () => {
    registers.flag_n = registers.flag_h = false;
    registers.flag_c = true;
}

//-------------------------------------------------------------------------------
// CCF
//-------------------------------------------------------------------------------
funcmap[0x3f] = () => {
    registers.flag_n = registers.flag_h = false;
    registers.flag_c = !registers.flag_c;
}