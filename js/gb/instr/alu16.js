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