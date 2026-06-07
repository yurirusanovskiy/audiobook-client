const fs = require('fs');

const files = [
  'src/app/page.tsx',
  'src/app/voices/page.tsx',
  'src/app/dictionary/page.tsx',
  'src/app/projects/[id]/page.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf-8');
    
    // Fix Typography fontWeight
    content = content.replace(/<Typography([^>]*?)\s+fontWeight="([^"]+)"([^>]*?)>/g, 
      (match, p1, p2, p3) => `<Typography${p1}${p3} sx={{ fontWeight: '${p2}' }}>`);

    // Fix Typography textAlign and maxWidth
    content = content.replace(/<Typography([^>]*?)\s+textAlign="([^"]+)"\s+maxWidth="([^"]+)"([^>]*?)>/g, 
      (match, p1, p2, p3, p4) => `<Typography${p1}${p4} sx={{ textAlign: '${p2}', maxWidth: '${p3}' }}>`);

    fs.writeFileSync(file, content);
  }
});
console.log("Done");
