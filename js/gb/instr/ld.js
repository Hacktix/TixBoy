//-------------------------------------------------------------------------------
// LD r16, u16
//-------------------------------------------------------------------------------
function _ld_r16_u16(target, cycle) {
    switch(cycle) {
        default:
            nextfunc = _ld_r16_u16.bind(this, target, 1);
            break;
        case 1:
            registers[target[1]] = readByte(registers.pc++);
            nextfunc = _ld_r16_u16.bind(this, target, 2);
            break;
        case 2:
            registers[target[0]] = readByte(registers.pc++);
            nextfunc = fetchInstruction;
            break;
    }
}
for(let i = 0x01; i <= 0x31; i+= 0x10)
    funcmap[i] = _ld_r16_u16.bind(this, ["bc", "de", "hl", "sp"][(i & 0xf0) >> 4]);



//-------------------------------------------------------------------------------
// LD r8, r8
//-------------------------------------------------------------------------------
function _ld_mem_hl_r8(source, target, cycle) {
    if(!cycle)
        nextfunc = _ld_mem_hl_r8.bind(this, source, target, 1);
    else {
        if(source === "(hl)")
            registers[target] = readByte(registers.hl);
        else
            writeByte(registers.hl, registers[source]);
        nextfunc = fetchInstruction;
    }
}
for(let i = 0x40; i < 0x80; i++) {
    if(i === 0x76) continue;              // HALT
    let src = ["b", "c", "d", "e", "h", "l", "(hl)", "a"][i & 0b111];
    let dst = ["b", "c", "d", "e", "h", "l", "(hl)", "a"][(i & 0b111000) >> 3];
    if(src === "(hl)" || dst === "(hl)")
        funcmap[i] = _ld_mem_hl_r8.bind(this, src, dst);
    else
        funcmap[i] = ((source, target)=>{
            registers[target] = registers[source];
            nextfunc = fetchInstruction;
        }).bind(this, src, dst);
}



//-------------------------------------------------------------------------------
// LD r8, u8
//-------------------------------------------------------------------------------
function _ld_r8_u8(target, cycle) {
    switch(cycle) {
        default:
            nextfunc = _ld_r8_u8.bind(this, target, 1);
            break;
        case 1:
            if(target === "(hl)") {
                tmp.push(readByte(registers.pc++));
                nextfunc = _ld_r8_u8.bind(this, target, 2);
            } else {
                registers[target] = readByte(registers.pc++);
                nextfunc = fetchInstruction;
            }
            break;
        case 2:
            writeByte(registers.hl, tmp.pop());
            nextfunc = fetchInstruction;
            break;
    }
}
for(let i = 0x06; i <= 0x3e; i+= 8)
    funcmap[i] = _ld_r8_u8.bind(this, ["b", "c", "d", "e", "h", "l", "(hl)", "a"][(i & 0b111000) >> 3]);



//-------------------------------------------------------------------------------
// LD (HL+), A  //  LD (HL-), A
//-------------------------------------------------------------------------------
function _ld_hlid_a(inc, cycle) {
    if(!cycle)
        nextfunc = _ld_hlid_a.bind(this, inc, 1);
    else {
        writeByte(registers.hl, registers.a);
        registers.hl += inc;
        nextfunc = fetchInstruction;
    }
}
funcmap[0x22] = _ld_hlid_a.bind(this, 1);
funcmap[0x32] = _ld_hlid_a.bind(this, -1);



//-------------------------------------------------------------------------------
// LD A, (HL+)  //  LD A, (HL-)
//-------------------------------------------------------------------------------
function _ld_a_hlid(inc, cycle) {
    if(!cycle)
        nextfunc = _ld_a_hlid.bind(this, inc, 1);
    else {
        registers.a = readByte(registers.hl);
        registers.hl += inc;
        nextfunc = fetchInstruction;
    }
}
funcmap[0x2a] = _ld_a_hlid.bind(this, 1);
funcmap[0x3a] = _ld_a_hlid.bind(this, -1);



//-------------------------------------------------------------------------------
// LD (r16), A
//-------------------------------------------------------------------------------
function _ld_r16_a(target, cycle) {
    if(!cycle)
        nextfunc = _ld_r16_a.bind(this, target, 1);
    else {
        writeByte(registers[target], registers.a);
        nextfunc = fetchInstruction;
    }
}
funcmap[0x02] = _ld_r16_a.bind(this, "bc");
funcmap[0x12] = _ld_r16_a.bind(this, "de");



//-------------------------------------------------------------------------------
// LD A, (r16)
//-------------------------------------------------------------------------------
function _ld_a_r16(source, cycle) {
    if(!cycle)
        nextfunc = _ld_a_r16.bind(this, source, 1);
    else {
        registers.a = readByte(registers[source]);
        nextfunc = fetchInstruction;
    }
}
funcmap[0x0a] = _ld_a_r16.bind(this, "bc");
funcmap[0x1a] = _ld_a_r16.bind(this, "de");



//-------------------------------------------------------------------------------
// LD (u16), A
//-------------------------------------------------------------------------------
function _ld_u16_a(cycle) {
    switch(cycle) {
        default:
            nextfunc = _ld_u16_a.bind(this, 1);
            break;
        case 1:
            tmp.push(readByte(registers.pc++));
            nextfunc = _ld_u16_a.bind(this, 2);
            break;
        case 2:
            tmp.push(tmp.pop() | (readByte(registers.pc++) << 8));
            nextfunc = _ld_u16_a.bind(this, 3);
            break;
        case 3:
            writeByte(tmp.pop(), registers.a);
            nextfunc = fetchInstruction;
            break;
    }
}
funcmap[0xea] = _ld_u16_a;



//-------------------------------------------------------------------------------
// LD A, (u16)
//-------------------------------------------------------------------------------
function _ld_a_u16(cycle) {
    switch(cycle) {
        default:
            nextfunc = _ld_a_u16.bind(this, 1);
            break;
        case 1:
            tmp.push(readByte(registers.pc++));
            nextfunc = _ld_a_u16.bind(this, 2);
            break;
        case 2:
            tmp.push(tmp.pop() | (readByte(registers.pc++) << 8));
            nextfunc = _ld_a_u16.bind(this, 3);
            break;
        case 3:
            registers.a = readByte(tmp.pop());
            nextfunc = fetchInstruction;
            break;
    }
}
funcmap[0xfa] = _ld_a_u16;



//-------------------------------------------------------------------------------
// LD (FF00+u8), A
//-------------------------------------------------------------------------------
function _ldh_u8_a(cycle) {
    switch(cycle) {
        default:
            nextfunc = _ldh_u8_a.bind(this, 1);
            break;
        case 1:
            tmp.push(readByte(registers.pc++));
            nextfunc = _ldh_u8_a.bind(this, 2);
            break;
        case 2:
            writeByte(0xff00+tmp.pop(), registers.a);
            nextfunc = fetchInstruction;
            break;
    }
}
funcmap[0xe0] = _ldh_u8_a;



//-------------------------------------------------------------------------------
// LD A, (FF00+u8)
//-------------------------------------------------------------------------------
function _ldh_a_u8(cycle) {
    switch(cycle) {
        default:
            nextfunc = _ldh_a_u8.bind(this, 1);
            break;
        case 1:
            tmp.push(readByte(registers.pc++));
            nextfunc = _ldh_a_u8.bind(this, 2);
            break;
        case 2:
            registers.a = readByte(0xff00+tmp.pop()); 
            nextfunc = fetchInstruction;
            break;
    }
}
funcmap[0xf0] = _ldh_a_u8;



//-------------------------------------------------------------------------------
// LD (FF00+c), A
//-------------------------------------------------------------------------------
function _ldh_c_a(cycle) {
    switch(cycle) {
        default:
            nextfunc = _ldh_c_a.bind(this, 1);
            break;
        case 1:
            writeByte(0xff00+registers.c, registers.a);
            nextfunc = fetchInstruction;
            break;
    }
}
funcmap[0xe2] = _ldh_c_a;



//-------------------------------------------------------------------------------
// LD A, (FF00+c)
//-------------------------------------------------------------------------------
function _ldh_a_c(cycle) {
    switch(cycle) {
        default:
            nextfunc = _ldh_a_c.bind(this, 1);
            break;
        case 1:
            registers.a = readByte(0xff00+registers.c);
            nextfunc = fetchInstruction;
            break;
    }
}
funcmap[0xf2] = _ldh_a_c;



//-------------------------------------------------------------------------------
// LD (u16), SP
//-------------------------------------------------------------------------------
function _ld_u16_sp(cycle) {
    switch(cycle) {
        default:
            nextfunc = _ld_u16_sp.bind(this, 1);
            break;
        case 1:
            tmp.push(readByte(registers.pc++));
            nextfunc = _ld_u16_sp.bind(this, 2);
            break;
        case 2:
            tmp.push(tmp.pop() | (readByte(registers.pc++) << 8));
            nextfunc = _ld_u16_sp.bind(this, 3);
            break;
        case 3:
            writeByte(tmp[0], registers.sp & 0xff);
            nextfunc = _ld_u16_sp.bind(this, 4);
            break;
        case 4:
            writeByte(tmp.pop() + 1, (registers.sp & 0xff00) >> 8);
            nextfunc = fetchInstruction;
            break;
    }
}
funcmap[0x08] = _ld_u16_sp;



//-------------------------------------------------------------------------------
// LD SP, HL
//-------------------------------------------------------------------------------
function _ld_sp_hl(cycle) {
    if(!cycle)
        nextfunc = _ld_sp_hl.bind(this, 1);
    else {
        registers.sp = registers.hl;
        nextfunc = fetchInstruction;
    }
}
funcmap[0xf9] = _ld_sp_hl;