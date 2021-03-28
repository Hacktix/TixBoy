//-------------------------------------------------------------------------------
// ADD HL, r16
//-------------------------------------------------------------------------------
function _add_hl_r16(source, cycle) {
    if(!cycle)
        nextfunc = _add_hl_r16.bind(this, source, 1);
    else {
        let addv = registers[source];
        registers.flag_n = false;
        registers.flag_h = (addv & 0xfff) + (registers.hl & 0xfff) > 0xfff;
        registers.flag_c = addv + registers.hl > 0xffff;
        registers.hl += addv;
        nextfunc = fetchInstruction;
    }
}
for(let i = 0x09; i <= 0x39; i += 0x10)
    funcmap[i] = _add_hl_r16.bind(this, ["bc", "de", "hl", "sp"][(i&0b110000) >> 4]);



//-------------------------------------------------------------------------------
// ADD sp, e8
//-------------------------------------------------------------------------------
function _add_sp_e8(cycle) {
    switch(cycle) {
        default:
            nextfunc = _add_sp_e8.bind(this, 1);
            break;
        case 1:
            tmp.push(e8(readByte(registers.pc++)));
            nextfunc = _add_sp_e8.bind(this, 2);
            break;
        case 2:
            nextfunc = _add_sp_e8.bind(this, 3);
            break;
        case 3:
            registers.flag_z = registers.flag_n = false;
            registers.flag_h = (tmp[0] & 0xf) + (registers.sp & 0xf) > 0xf;
            registers.flag_c = (tmp[0] & 0xff) + (registers.sp & 0xff) > 0xff;
            registers.sp += tmp.pop();
            nextfunc = fetchInstruction;
            break;
    }
}
funcmap[0xe8] = _add_sp_e8;



//-------------------------------------------------------------------------------
// LD HL, SP+e8
//-------------------------------------------------------------------------------
function _ld_hl_sp_e8(cycle) {
    switch(cycle) {
        default:
            nextfunc = _ld_hl_sp_e8.bind(this, 1);
            break;
        case 1:
            tmp.push(e8(readByte(registers.pc++)));
            nextfunc = _ld_hl_sp_e8.bind(this, 2);
            break;
        case 2:
            registers.flag_z = registers.flag_n = false;
            registers.flag_h = (tmp[0] & 0xf) + (registers.sp & 0xf) > 0xf;
            registers.flag_c = (tmp[0] & 0xff) + (registers.sp & 0xff) > 0xff;
            registers.hl = registers.sp + tmp.pop();
            nextfunc = fetchInstruction;
            break;
    }
}
funcmap[0xf8] = _ld_hl_sp_e8;