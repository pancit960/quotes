const bcrypt = require('bcrypt');

async function run() {
    const plainPassword = 'password';
    const hash = await bcrypt.hash(plainPassword, 10);
    console.log('PLAINTEXT: ', plainPassword);
    console.log('HASH', hash);
}

run();