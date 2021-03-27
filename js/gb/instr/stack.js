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
            console.log(`  PUSH ${source} | internal`);
            break;
        case 2:
            writeByte(--registers.sp, registers[source[0]]);
            nextfunc = _push_r16.bind(this, source, 3);
            console.log(`  PUSH ${source} | write ${source[0]}->(--sp)`);
            break;
        case 3:
            writeByte(--registers.sp, registers[source[1]]);
            nextfunc = fetchInstruction;
            console.log(`  PUSH ${source} | write ${source[1]}->(--sp)`);
            break;
    }
}
for(let i = 0xc5; i <= 0xf5; i += 0x10)
    funcmap[i] = _push_r16.bind(this, ["bc", "de", "hl", "af"][(i & 0b110000) >> 4]);