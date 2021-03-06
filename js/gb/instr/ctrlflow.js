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
            break;
        case 2:
            tmp.push(tmp.pop() | (readByte(registers.pc++) << 8));
            nextfunc = _call_u16.bind(this, 3);
            break;
        case 3:
            nextfunc = _call_u16.bind(this, 4);
            break;
        case 4:
            writeByte(--registers.sp, (registers.pc & 0xff00) >> 8);
            nextfunc = _call_u16.bind(this, 5);
            break;
        case 5:
            writeByte(--registers.sp, registers.pc & 0xff);
            registers.pc = tmp.pop();
            nextfunc = fetchInstruction;
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
            break;
        case 2:
            registers.pc = (readByte(registers.pc) << 8) + tmp.pop();
            nextfunc = _jp_u16.bind(this, 3);
            break;
        case 3:
            nextfunc = fetchInstruction;
            break;
    }
}
funcmap[0xc3] = _jp_u16;



//-------------------------------------------------------------------------------
// JP NZ, u16  //  JP Z, u16
//-------------------------------------------------------------------------------
function _jp_z(compare, cycle) {
    switch(cycle) {
        default:
            nextfunc = _jp_z.bind(this, compare, 1);
            break;
        case 1:
            tmp.push(readByte(registers.pc++));
            nextfunc = _jp_z.bind(this, compare, 2);
            break;
        case 2:
            tmp.push((readByte(registers.pc++) << 8) + tmp.pop());
            if(registers.flag_z === compare)
                nextfunc = _jp_z.bind(this, compare, 3);
            else {
                tmp.pop();
                nextfunc = fetchInstruction;
            }
            break;
        case 3:
            registers.pc = tmp.pop();
            nextfunc = fetchInstruction;
            break;
    }
}
funcmap[0xc2] = _jp_z.bind(this, false);
funcmap[0xca] = _jp_z.bind(this, true);



//-------------------------------------------------------------------------------
// JP NC, u16  //  JP C, u16
//-------------------------------------------------------------------------------
function _jp_c(compare, cycle) {
    switch(cycle) {
        default:
            nextfunc = _jp_c.bind(this, compare, 1);
            break;
        case 1:
            tmp.push(readByte(registers.pc++));
            nextfunc = _jp_c.bind(this, compare, 2);
            break;
        case 2:
            tmp.push((readByte(registers.pc++) << 8) + tmp.pop());
            if(registers.flag_c === compare)
                nextfunc = _jp_c.bind(this, compare, 3);
            else {
                tmp.pop();
                nextfunc = fetchInstruction;
            }
            break;
        case 3:
            registers.pc = tmp.pop();
            nextfunc = fetchInstruction;
            break;
    }
}
funcmap[0xd2] = _jp_c.bind(this, false);
funcmap[0xda] = _jp_c.bind(this, true);



//-------------------------------------------------------------------------------
// JP HL
//-------------------------------------------------------------------------------
funcmap[0xe9] = () => { registers.pc = registers.hl; };



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
            break;
        case 2:
            registers.pc += tmp.pop();
            nextfunc = fetchInstruction;
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
            break;
        case 2:
            tmp.push(tmp.pop() | (readByte(registers.sp++) << 8));
            nextfunc = _ret.bind(this, 3);
            break;
        case 3:
            registers.pc = tmp.pop();
            nextfunc = fetchInstruction;
            break;
    }
}
funcmap[0xc9] = _ret;



//-------------------------------------------------------------------------------
// RETI
//-------------------------------------------------------------------------------
function _reti(cycle) {
    switch(cycle) {
        default:
            nextfunc = _ret.bind(this, 1);
            intr_state.ime = true;
            break;
    }
}
funcmap[0xd9] = _reti;



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
            break;
        case 2:
            registers.pc += tmp.pop();
            nextfunc = fetchInstruction;
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
            break;
        case 2:
            registers.pc += tmp.pop();
            nextfunc = fetchInstruction;
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
            break;
        case 2:
            tmp.push(tmp.pop() | (readByte(registers.pc++) << 8));
            if(registers.flag_z === compare)
                nextfunc =  _call_u16.bind(this, 3);
            else {
                tmp.pop();
                nextfunc = fetchInstruction;
            }
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
            break;
        case 2:
            tmp.push(tmp.pop() | (readByte(registers.pc++) << 8));
            if(registers.flag_c === compare)
                nextfunc =  _call_u16.bind(this, 3);
            else {
                tmp.pop();
                nextfunc = fetchInstruction;
            }
            break;
    }
}
funcmap[0xd4] = _call_c.bind(this, false);
funcmap[0xdc] = _call_c.bind(this, true);



//-------------------------------------------------------------------------------
// RST vec
//-------------------------------------------------------------------------------
function _rst(vec, cycle) {
    switch(cycle) {
        default:
            nextfunc = _rst.bind(this, vec, 1);
            break;
        case 1:
            nextfunc = _rst.bind(this, vec, 2);
            break;
        case 2:
            writeByte(--registers.sp, (registers.pc & 0xff00) >> 8);
            nextfunc = _rst.bind(this, vec, 3);
            break;
        case 3:
            writeByte(--registers.sp, registers.pc & 0xff);
            registers.pc = vec;
            nextfunc = fetchInstruction;
            break;
    }
}
for(let i = 0xc7; i <= 0xff; i += 0x08)
    funcmap[i] = _rst.bind(this, i&0b111000);