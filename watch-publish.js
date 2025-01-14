const { exec } = require('child_process');

exec('nodemon --watch src --exec "yalc publish --push"'); 