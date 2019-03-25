export enum Ops {
    MOVE,
    LOADK,
    LOADKX,
    LOADBOOL,
    LOADNIL,
    GETUPVAL,

    GETTABUP,
    GETTABLE,

    SETTABUP,
    SETUPVAL,
    SETTABLE,

    NEWTABLE,

    SELF,

    ADD,
    SUB,
    MUL,
    MOD,
    POW,
    DIV,
    IDIV,
    BAND,
    BOR,
    BXOR,
    SHL,
    SHR,
    UNM,
    BNOT,
    NOT,
    LEN,

    CONCAT,

    JMP,
    EQ,
    LT,
    LE,

    TEST,
    TESTSET,

    CALL,
    TAILCALL,
    RETURN,

    FORLOOP,

    FORPREP,

    TFORCALL,
    TFORLOOP,

    SETLIST,

    CLOSURE,

    VARARG,

    EXTRAARG
}

/* basic instruction format */
export enum OpCodeMode {
    iABC,
    iABx,
    iAsBx,
    iAx
}

export enum OpArgMask {
    OpArgN,  /* argument is not used */
    OpArgU,  /* argument is used */
    OpArgR,  /* argument is a register or a jump offset */
    OpArgK   /* argument is a constant or register/constant */
}

export class OpMode {
    public encode(c: Array<number>): number {
        let val = 0;
        let encoded: number = c[0];
        switch (this.mode) {
            case OpCodeMode.iABC:
                // B(9)    Bx   C(9)         A(8)      OP(6)
                // A
                val = c[1];
                if (val < 0 || val > 255) {
                    throw new Error('A is exceeded');
                }

                encoded += val << (6);

                // C
                val = c[3];
                if (val < 0) {
                    val = -(val + 1);
                    val |= 1 << 8;
                }

                if (val < 0 || val > 510) {
                    throw new Error('C is exceeded');
                }

                encoded += val << (8 + 6);

                // B
                val = c[2];
                if (val < 0) {
                    val = -(val + 1);
                    val |= 1 << 8;
                }

                if (val < 0 || val > 510) {
                    throw new Error('B is exceeded');
                }

                encoded += val << (9 + 8 + 6);

                break;
            case OpCodeMode.iABx:
                val = c[1];
                if (val < 0 || val > 255) {
                    throw new Error('A is exceeded');
                }

                encoded += val << (6);

                // Bx
                val = c[2];
                if (val < 0) {
                    val = -(val + 1);
                }

                if (val < 0 || val > 262143) {
                    throw new Error('Bx is exceeded');
                }

                encoded += val << (8 + 6);

                break;
            case OpCodeMode.iAsBx:
                val = c[1];
                if (val < 0 || val > 255) {
                    throw new Error('A is exceeded');
                }

                encoded += val << (6);

                // sBx
                val = c[2] + 131071;

                if (val < 0 || val > 262143) {
                    throw new Error('sBx is exceeded');
                }

                encoded += val << (8 + 6);

                break;
            case OpCodeMode.iAx:
                val = c[1];
                if (val < 0) {
                    val = -(val + 1);
                } else {
                    throw new Error('Should be negative');
                }

                if (val < 0 || val > 67108863) {
                    throw new Error('Ax is exceeded');
                }

                encoded += val << (6);

                break;
        }

        return encoded;
    }

    public constructor(public T: number, public A: number, public B: OpArgMask, public C: OpArgMask, public mode: OpCodeMode) {
    }
}

export const OpCodes: Array<OpMode> = [
    new OpMode(0, 1, OpArgMask.OpArgR, OpArgMask.OpArgN, OpCodeMode.iABC)		/* OP_MOVE */
    , new OpMode(0, 1, OpArgMask.OpArgK, OpArgMask.OpArgN, OpCodeMode.iABx)		/* OP_LOADK */
    , new OpMode(0, 1, OpArgMask.OpArgN, OpArgMask.OpArgN, OpCodeMode.iABx)		/* OP_LOADKX */
    , new OpMode(0, 1, OpArgMask.OpArgU, OpArgMask.OpArgU, OpCodeMode.iABC)		/* OP_LOADBOOL */
    , new OpMode(0, 1, OpArgMask.OpArgU, OpArgMask.OpArgN, OpCodeMode.iABC)		/* OP_LOADNIL */
    , new OpMode(0, 1, OpArgMask.OpArgU, OpArgMask.OpArgN, OpCodeMode.iABC)		/* OP_GETUPVAL */
    , new OpMode(0, 1, OpArgMask.OpArgU, OpArgMask.OpArgK, OpCodeMode.iABC)		/* OP_GETTABUP */
    , new OpMode(0, 1, OpArgMask.OpArgR, OpArgMask.OpArgK, OpCodeMode.iABC)		/* OP_GETTABLE */
    , new OpMode(0, 0, OpArgMask.OpArgK, OpArgMask.OpArgK, OpCodeMode.iABC)		/* OP_SETTABUP */
    , new OpMode(0, 0, OpArgMask.OpArgU, OpArgMask.OpArgN, OpCodeMode.iABC)		/* OP_SETUPVAL */
    , new OpMode(0, 0, OpArgMask.OpArgK, OpArgMask.OpArgK, OpCodeMode.iABC)		/* OP_SETTABLE */
    , new OpMode(0, 1, OpArgMask.OpArgU, OpArgMask.OpArgU, OpCodeMode.iABC)		/* OP_NEWTABLE */
    , new OpMode(0, 1, OpArgMask.OpArgR, OpArgMask.OpArgK, OpCodeMode.iABC)		/* OP_SELF */
    , new OpMode(0, 1, OpArgMask.OpArgK, OpArgMask.OpArgK, OpCodeMode.iABC)		/* OP_ADD */
    , new OpMode(0, 1, OpArgMask.OpArgK, OpArgMask.OpArgK, OpCodeMode.iABC)		/* OP_SUB */
    , new OpMode(0, 1, OpArgMask.OpArgK, OpArgMask.OpArgK, OpCodeMode.iABC)		/* OP_MUL */
    , new OpMode(0, 1, OpArgMask.OpArgK, OpArgMask.OpArgK, OpCodeMode.iABC)		/* OP_MOD */
    , new OpMode(0, 1, OpArgMask.OpArgK, OpArgMask.OpArgK, OpCodeMode.iABC)		/* OP_POW */
    , new OpMode(0, 1, OpArgMask.OpArgK, OpArgMask.OpArgK, OpCodeMode.iABC)		/* OP_DIV */
    , new OpMode(0, 1, OpArgMask.OpArgK, OpArgMask.OpArgK, OpCodeMode.iABC)		/* OP_IDIV */
    , new OpMode(0, 1, OpArgMask.OpArgK, OpArgMask.OpArgK, OpCodeMode.iABC)		/* OP_BAND */
    , new OpMode(0, 1, OpArgMask.OpArgK, OpArgMask.OpArgK, OpCodeMode.iABC)		/* OP_BOR */
    , new OpMode(0, 1, OpArgMask.OpArgK, OpArgMask.OpArgK, OpCodeMode.iABC)		/* OP_BXOR */
    , new OpMode(0, 1, OpArgMask.OpArgK, OpArgMask.OpArgK, OpCodeMode.iABC)		/* OP_SHL */
    , new OpMode(0, 1, OpArgMask.OpArgK, OpArgMask.OpArgK, OpCodeMode.iABC)		/* OP_SHR */
    , new OpMode(0, 1, OpArgMask.OpArgR, OpArgMask.OpArgN, OpCodeMode.iABC)		/* OP_UNM */
    , new OpMode(0, 1, OpArgMask.OpArgR, OpArgMask.OpArgN, OpCodeMode.iABC)		/* OP_BNOT */
    , new OpMode(0, 1, OpArgMask.OpArgR, OpArgMask.OpArgN, OpCodeMode.iABC)		/* OP_NOT */
    , new OpMode(0, 1, OpArgMask.OpArgR, OpArgMask.OpArgN, OpCodeMode.iABC)		/* OP_LEN */
    , new OpMode(0, 1, OpArgMask.OpArgR, OpArgMask.OpArgR, OpCodeMode.iABC)		/* OP_CONCAT */
    , new OpMode(0, 0, OpArgMask.OpArgR, OpArgMask.OpArgN, OpCodeMode.iAsBx)	/* OP_JMP */
    , new OpMode(1, 0, OpArgMask.OpArgK, OpArgMask.OpArgK, OpCodeMode.iABC)		/* OP_EQ */
    , new OpMode(1, 0, OpArgMask.OpArgK, OpArgMask.OpArgK, OpCodeMode.iABC)		/* OP_LT */
    , new OpMode(1, 0, OpArgMask.OpArgK, OpArgMask.OpArgK, OpCodeMode.iABC)		/* OP_LE */
    , new OpMode(1, 0, OpArgMask.OpArgN, OpArgMask.OpArgU, OpCodeMode.iABC)		/* OP_TEST */
    , new OpMode(1, 1, OpArgMask.OpArgR, OpArgMask.OpArgU, OpCodeMode.iABC)		/* OP_TESTSET */
    , new OpMode(0, 1, OpArgMask.OpArgU, OpArgMask.OpArgU, OpCodeMode.iABC)		/* OP_CALL */
    , new OpMode(0, 1, OpArgMask.OpArgU, OpArgMask.OpArgU, OpCodeMode.iABC)		/* OP_TAILCALL */
    , new OpMode(0, 0, OpArgMask.OpArgU, OpArgMask.OpArgN, OpCodeMode.iABC)		/* OP_RETURN */
    , new OpMode(0, 1, OpArgMask.OpArgR, OpArgMask.OpArgN, OpCodeMode.iAsBx)	/* OP_FORLOOP */
    , new OpMode(0, 1, OpArgMask.OpArgR, OpArgMask.OpArgN, OpCodeMode.iAsBx)	/* OP_FORPREP */
    , new OpMode(0, 0, OpArgMask.OpArgN, OpArgMask.OpArgU, OpCodeMode.iABC)		/* OP_TFORCALL */
    , new OpMode(0, 1, OpArgMask.OpArgR, OpArgMask.OpArgN, OpCodeMode.iAsBx)	/* OP_TFORLOOP */
    , new OpMode(0, 0, OpArgMask.OpArgU, OpArgMask.OpArgU, OpCodeMode.iABC)		/* OP_SETLIST */
    , new OpMode(0, 1, OpArgMask.OpArgU, OpArgMask.OpArgN, OpCodeMode.iABx)		/* OP_CLOSURE */
    , new OpMode(0, 1, OpArgMask.OpArgU, OpArgMask.OpArgN, OpCodeMode.iABC)		/* OP_VARARG */
    , new OpMode(0, 0, OpArgMask.OpArgU, OpArgMask.OpArgU, OpCodeMode.iAx)		/* OP_EXTRAARG */
];

export enum LuaTypes {
    LUA_TNIL = 0,
    LUA_TBOOLEAN = 1,
    LUA_TLIGHTUSERDATA = 2,
    LUA_TNUMBER = 3,
    LUA_TSTRING = 4,
    LUA_TTABLE = 5,
    LUA_TFUNCTION = 6,
    LUA_TUSERDATA = 7,
    LUA_TTHREAD = 8,

    LUA_TNUMFLT = 3 | (0 << 4),
    LUA_TNUMINT = 3 | (1 << 4),
    LUA_TLNGSTR = 4 | (1 << 4),
}
