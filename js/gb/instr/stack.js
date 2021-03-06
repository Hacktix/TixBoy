//-------------------------------------------------------------------------------
// PUSH r16
//-------------------------------------------------------------------------------
function _push_r16(source, cycle) {
    switch(cycle) {
        default:
            nextfunc = _push_r16.bind(this, source, 1);
            break;
        case 1:
            nextfunc = _push_r16.bind(this, source, 2);
            break;
        case 2:
            writeByte(--registers.sp, registers[source[0]]);
            nextfunc = _push_r16.bind(this, source, 3);
            break;
        case 3:
            writeByte(--registers.sp, registers[source[1]]);
            nextfunc = fetchInstruction;
            break;
    }
}
for(let i = 0xc5; i <= 0xf5; i += 0x10)
    funcmap[i] = _push_r16.bind(this, ["bc", "de", "hl", "af"][(i & 0b110000) >> 4]);

//-------------------------------------------------------------------------------
// POP r16
//-------------------------------------------------------------------------------
function _pop_r16(destination, cycle) {
    switch(cycle) {
        default:
            nextfunc = _pop_r16.bind(this, destination, 1);
            break;
        case 1:
            registers[destination[1]] = readByte(registers.sp++);
            nextfunc = _pop_r16.bind(this, destination, 2);
            break;
        case 2:
            registers[destination[0]] = readByte(registers.sp++);
            nextfunc = fetchInstruction;
            break;
    }
}
for(let i = 0xc1; i <= 0xf1; i += 0x10)
    funcmap[i] = _pop_r16.bind(this, ["bc", "de", "hl", "af"][(i & 0b110000) >> 4]);