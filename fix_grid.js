const fs = require('fs');

const files = [
  'src/app/page.tsx',
  'src/app/voices/page.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf-8');
    
    // Convert <Grid item xs={12} sm={6} md={4} ...> back to <Grid size={{ xs: 12, sm: 6, md: 4 }} ...>
    content = content.replace(/<Grid\s+item\s+xs=\{12\}\s+sm=\{6\}\s+md=\{4\}\s+key=\{project\.id\}\s*>/g, 
      "<Grid size={{ xs: 12, sm: 6, md: 4 }} key={project.id}>");

    content = content.replace(/<Grid\s+item\s+xs=\{12\}\s+sm=\{6\}\s+md=\{4\}\s+lg=\{3\}\s+key=\{char\.id\}\s*>/g, 
      "<Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={char.id}>");

    fs.writeFileSync(file, content);
  }
});
console.log("Done");
