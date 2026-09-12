const fs = require('fs');
let env = fs.readFileSync('.env', 'utf8');
env = env.replace('STRADIA_API-"', 'VITE_STRADIA_API="');
fs.writeFileSync('.env', env);
console.log('Fixed .env');
