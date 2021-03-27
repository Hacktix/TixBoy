//-------------------------------------------------------------------------------
// JR NZ, i8  //  JR Z, i8
//-------------------------------------------------------------------------------
function _jr_z(compare, cycle) {
    switch(cycle) {
        default:
            nextfunc = _jr_z.bind(this, compare, 1);
            break;
        case 1:
            let v = e8(readByte(registers.pc++));
            if(registers.flag_z !== compare)
                nextfunc = fetchInstruction;
            else {
                tmp.push(v);
                nextfunc = _jr_z.bind(this, compare, 2);
            }
            //console.log(`  JR ${compare ? 'Z' : 'NZ'}, i8 | read`);
            break;
        case 2:
            registers.pc += tmp.pop();
            nextfunc = fetchInstruction;
            //console.log(`  JR ${compare ? 'Z' : 'NZ'}, i8 | modify PC`);
    }
}
funcmap[0x20] = _jr_z.bind(this, false);
funcmap[0x28] = _jr_z.bind(this, true);