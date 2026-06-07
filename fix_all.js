const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? 
      walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Fix Typography fontWeight
    content = content.replace(/<Typography([^>]*?)\s+fontWeight="([^"]+)"([^>]*?)>/g, 
      (match, p1, p2, p3) => `<Typography${p1}${p3} sx={{ fontWeight: '${p2}' }}>`);

    // Fix Typography textAlign and maxWidth
    content = content.replace(/<Typography([^>]*?)\s+textAlign="([^"]+)"\s+maxWidth="([^"]+)"([^>]*?)>/g, 
      (match, p1, p2, p3, p4) => `<Typography${p1}${p4} sx={{ textAlign: '${p2}', maxWidth: '${p3}' }}>`);

    fs.writeFileSync(filePath, content);
  }
});
console.log("Done");
