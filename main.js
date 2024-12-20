const buttonClear = document.querySelector('#clear');
const buttonHash = document.querySelector('#hash');
const keyInput = document.querySelector('#key');
const textarea = document.querySelector('#text');

const WordSize = 32;
const Rounds = 12;

function rc5Hash(message, key) {
    let H = 0x00000000;
    const blocks = stringToBlocks(message); 
    for (let i = 0; i < blocks.length; i++) {
        const Mi = blocks[i][0]; 
        const encrypted = encryptBlock([H, 0], key); 
        H = encrypted[0] ^ Mi ^ H; 
    }

    return H.toString(16).padStart(8, '0'); 
}

function generateKey(length = 16) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';
    for (let i = 0; i < length; i++) {
        key += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return key;
}

function keySchedule(key) {
    const L = [];
    for (let i = 0; i < key.length / 4; i++) {
        L[i] = (key.charCodeAt(i * 4) << 24) |
            (key.charCodeAt(i * 4 + 1) << 16) |
            (key.charCodeAt(i * 4 + 2) << 8) |
            (key.charCodeAt(i * 4 + 3));
    }

    const P = 0xb7e15163;
    const Q = 0x9e3779b9;
    const S = new Array(2 * Rounds + 2);
    S[0] = P;
    for (let i = 1; i < S.length; i++) {
        S[i] = (S[i - 1] + Q) >>> 0;
    }

    let j = 0;
    let A = 0, B = 0;
    for (let i = 0; i < S.length; i++) {
        A = S[i] = (S[i] + A + B) >>> 0;
        B = L[j] = (L[j] + A) >>> 0;
        j = (j + 1) % L.length;
    }
    return S;
}

function encryptBlock(plainText, key) {
    const S = keySchedule(key);
    let A = plainText[0], B = plainText[1];
    A = (A + S[0]) >>> 0;
    B = (B + S[1]) >>> 0;

    for (let i = 1; i <= Rounds; i++) {
        A = (rotateLeft(A ^ B, B) + S[2 * i]) >>> 0;
        B = (rotateLeft(B ^ A, A) + S[2 * i + 1]) >>> 0;
    }
    return [A, B];
}


function stringToBlocks(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const blocks = [];
    for (let i = 0; i < data.length; i += 8) {
        const block = [];
        block[0] = (data[i] |
            (data[i + 1] << 8) |
            (data[i + 2] << 16) |
            (data[i + 3] << 24)) >>> 0;
        block[1] = (data[i + 4] |
            (data[i + 5] << 8) |
            (data[i + 6] << 16) |
            (data[i + 7] << 24)) >>> 0;
        blocks.push(block);
    }
    return blocks;
}


function rotateLeft(value, shift) {
    return ((value << (shift % 32)) | (value >>> (32 - (shift % 32)))) >>> 0;
}

buttonHash.addEventListener('click', () => {
    const text = textarea.value;
    const key = generateKey(); 
    try {
        const hashedText = rc5Hash(text, key);
        textarea.value = hashedText;
    } catch (error) {
        alert(error.message);
    }
});

buttonClear.addEventListener('click', () => {
    textarea.value = '';
});