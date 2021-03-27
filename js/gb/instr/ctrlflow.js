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
            //console.log(`  JR i8 | read i8`);
            break;
        case 2:
            registers.pc += tmp.pop();
            nextfunc = fetchInstruction;
            //console.log(`  JR i8 | modify pc`);
            break;
    }
}
funcmap[0x18] = _jr_e8;



//-------------------------------------------------------------------------------
// RET
//-------------------------------------------------------------------------------
function _ret(cycle) {
    switch(cycle) {
        default:
            nextfunc = _ret.bind(this, 1);
            break;
        case 1:
            tmp.push(readByte(registers.sp++));
            nextfunc = _ret.bind(this, 2);
            //console.log(`  RET | read (sp++)->lower`);
            break;
        case 2:
            tmp.push(tmp.pop() | (readByte(registers.sp++) << 8));
            nextfunc = _ret.bind(this, 3);
            //console.log(`  RET | read (sp++)->upper`);
            break;
        case 3:
            registers.pc = tmp.pop();
            nextfunc = fetchInstruction;
            //console.log(`  RET | set pc?`);
            break;
    }
}
funcmap[0xc9] = _ret;



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



//-------------------------------------------------------------------------------
// JR NC, i8  //  JR C, i8
//-------------------------------------------------------------------------------
function _jr_c(compare, cycle) {
    switch(cycle) {
        default:
            nextfunc = _jr_c.bind(this, compare, 1);
            break;
        case 1:
            let v = e8(readByte(registers.pc++));
            if(registers.flag_c !== compare)
                nextfunc = fetchInstruction;
            else {
                tmp.push(v);
                nextfunc = _jr_c.bind(this, compare, 2);
            }
            //console.log(`  JR ${compare ? 'C' : 'NC'}, i8 | read`);
            break;
        case 2:
            registers.pc += tmp.pop();
            nextfunc = fetchInstruction;
            //console.log(`  JR ${compare ? 'C' : 'NC'}, i8 | modify PC`);
    }
}
funcmap[0x30] = _jr_c.bind(this, false);
funcmap[0x38] = _jr_c.bind(this, true);



//-------------------------------------------------------------------------------
// RET NC  //  RET C
//-------------------------------------------------------------------------------
function _ret_c(compare, cycle) {
    switch(cycle) {
        default:
            nextfunc = _ret_c.bind(this, compare, 1);
            break;
        case 1:
            if(registers.flag_c !== compare)
                nextfunc = fetchInstruction;
            else
                nextfunc = _ret.bind(this, 1);
            //console.log(`  RET ${compare ? 'C' : 'NC'} | branch decision`);
            break;
    }
}
funcmap[0xd0] = _ret_c.bind(this, false);
funcmap[0xd8] = _ret_c.bind(this, true);



//-------------------------------------------------------------------------------
// RET NZ  //  RET Z
//-------------------------------------------------------------------------------
function _ret_z(compare, cycle) {
    switch(cycle) {
        default:
            nextfunc = _ret_z.bind(this, compare, 1);
            break;
        case 1:
            if(registers.flag_z !== compare)
                nextfunc = fetchInstruction;
            else
                nextfunc = _ret.bind(this, 1);
            //console.log(`  RET ${compare ? 'Z' : 'NZ'} | branch decision`);
            break;
    }
}
funcmap[0xc0] = _ret_z.bind(this, false);
funcmap[0xc8] = _ret_z.bind(this, true);



//-------------------------------------------------------------------------------
// CALL NZ  //  CALL Z
//-------------------------------------------------------------------------------
function _call_z(compare, cycle) {
    switch(cycle) {
        default:
            nextfunc = _call_z.bind(this, compare, 1);
            break;
        case 1:
            tmp.push(readByte(registers.pc++));
            nextfunc = _call_z.bind(this, compare, 2);
            //console.log(`  CALL ${compare ? 'Z' : 'NZ'} u16 | read u16:lower`);
            break;
        case 2:
            tmp.push(tmp.pop() | (readByte(registers.pc++) << 8));
            nextfunc = registers.flag_z === compare ? _call_u16.bind(this, 3) : fetchInstruction;
            //console.log(`  CALL ${compare ? 'Z' : 'NZ'} u16 | read u16:upper`);
            break;
    }
}
funcmap[0xc4] = _call_z.bind(this, false);
funcmap[0xcc] = _call_z.bind(this, true);



//-------------------------------------------------------------------------------
// CALL NC  //  CALL C
//-------------------------------------------------------------------------------
function _call_c(compare, cycle) {
    switch(cycle) {
        default:
            nextfunc = _call_c.bind(this, compare, 1);
            break;
        case 1:
            tmp.push(readByte(registers.pc++));
            nextfunc = _call_c.bind(this, compare, 2);
            //console.log(`  CALL ${compare ? 'C' : 'NC'} u16 | read u16:lower`);
            break;
        case 2:
            tmp.push(tmp.pop() | (readByte(registers.pc++) << 8));
            nextfunc = registers.flag_c === compare ? _call_u16.bind(this, 3) : fetchInstruction;
            //console.log(`  CALL ${compare ? 'C' : 'NC'} u16 | read u16:upper`);
            break;
    }
}
funcmap[0xd4] = _call_c.bind(this, false);
funcmap[0xdc] = _call_c.bind(this, true);