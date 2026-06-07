const fs = require('fs');

const files = [
  'src/app/page.tsx',
  'src/app/voices/page.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf-8');
    
    // Replace <Grid item xs={12} sm={6} md={4} lg={3}> with <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
    content = content.replace(/<Grid\s+item\s+xs={(\d+)}\s+sm={(\d+)}\s+md={(\d+)}\s+lg={(\d+)}/g, '<Grid size={{ xs: $1, sm: $2, md: $3, lg: $4 }}');
    
    // Replace PaperProps in modals
    fs.writeFileSync(file, content);
  }
});
