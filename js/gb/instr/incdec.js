//-------------------------------------------------------------------------------
// INC r8
//-------------------------------------------------------------------------------
function _inc_mem_hl(cycle) {
    switch(cycle) {
        default:
            nextfunc = _inc_mem_hl.bind(this, 1);
            break;
        case 1:
            tmp.push(readByte(registers.hl));
            nextfunc = _inc_mem_hl.bind(this, 2);
            console.log(`  INC (hl) | read (hl)`);
        case 2:
            writeByte(registers.hl, (tmp.pop() + 1) & 0xff)
            nextfunc = fetchInstruction
            console.log(`  INC (hl) | write (hl)`);
    }
}
for(let i = 0x04; i <= 0x3c; i += 0x08) {
    if(i === 0x34)
        funcmap[i] = _inc_mem_hl.bind(this);
    else
        funcmap[i] = ((target) => {
            registers[target]++;
            nextfunc = fetchInstruction;
            console.log(`  INC ${target}`);
        }).bind(this, ["b", "c", "d", "e", "h", "l", "(hl)", "a"][(i & 0b111000) >> 3])
}