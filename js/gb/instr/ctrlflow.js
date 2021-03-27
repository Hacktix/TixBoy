//-------------------------------------------------------------------------------
// CALL u16
//-------------------------------------------------------------------------------
function _call_u16(cycle) {
    switch(cycle) {
        default:
            nextfunc = _call_u16.bind(this, 1);
            break;
        case 1:
            tmp.push(readByte(registers.pc++));
            nextfunc = _call_u16.bind(this, 2);
            //console.log(`  CALL u16 | read u16:lower`);
            break;
        case 2:
            tmp.push(tmp.pop() | (readByte(registers.pc++) << 8));
            nextfunc = _call_u16.bind(this, 3);
            //console.log(`  CALL u16 | read u16:upper`);
            break;
        case 3:
            nextfunc = _call_u16.bind(this, 4);
            //console.log(`  CALL u16 | branch decision?`);
            break;
        case 4:
            writeByte(--registers.sp, (registers.pc & 0xff00) >> 8);
            nextfunc = _call_u16.bind(this, 5);
            //console.log(`  CALL u16 | write pc:upper->(--sp)`);
            break;
        case 5:
            writeByte(--registers.sp, registers.pc & 0xff);
            registers.pc = tmp.pop();
            nextfunc = fetchInstruction;
            //console.log(`  CALL u16 | write pc:upper->(--sp)`);
            break;
    }
}
funcmap[0xcd] = _call_u16;



//-------------------------------------------------------------------------------
// JP u16
//-------------------------------------------------------------------------------
function _jp_u16(cycle) {
    switch(cycle) {
        default:
            nextfunc = _jp_u16.bind(this, 1);
            break;
        case 1:
            tmp.push(readByte(registers.pc++));
            nextfunc = _jp_u16.bind(this, 2);
            //console.log("  JP u16 | read u16:lower");
            break;
        case 2:
            registers.pc = (readByte(registers.pc) << 8) + tmp.pop();
            nextfunc = _jp_u16.bind(this, 3);
            //console.log("  JP u16 | read u16:upper");
            break;
        case 3:
            nextfunc = fetchInstruction;
            //console.log("  JP u16 | branch decision?");
            break;
    }
}
funcmap[0xc3] = _jp_u16;



//-------------------------------------------------------------------------------
// JR e8
//-------------------------------------------------------------------------------
function _jr_e8(cycle) {
    switch(cycle) {
        default:
            nextfunc = _jr_e8.bind(this, 1);
            break;
        case 1:
            tmp.push(e8(readByte(registers.pc++)));
            nextfunc = _jr_e8.bind(this, 2);
            console.log(`  JR i8 | read i8`);
            break;
        case 2:
            registers.pc += tmp.pop();
            nextfunc = fetchInstruction;
            console.log(`  JR i8 | modify pc`);
            break;
    }
}
funcmap[0x18] = _jr_e8;



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