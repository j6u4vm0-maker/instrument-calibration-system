const fs = require('fs');
let content = fs.readFileSync('src/app/page.tsx', 'utf8');
content = content.replace(/<div className="p-3 bg-white\/10 rounded-2xl text-lg text-white">.*<\/div>/g, '<div className="p-3 bg-white\/10 rounded-2xl text-lg text-white">???</div>');
content = content.replace(/<div className="p-3 bg-white\/10 rounded-2xl text-lg text-white">[^\<]*\/div>/g, '<div className="p-3 bg-white\/10 rounded-2xl text-lg text-white">???</div>');
fs.writeFileSync('src/app/page.tsx', content);
