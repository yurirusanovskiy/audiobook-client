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
    // Replace all system props with sx equivalent. 
    // This is a naive regex but works for the specific occurrences.
    content = content.replace(/<Box\s+display="flex"\s+justifyContent="center"\s+alignItems="center"\s+height="([^"]+)"\s*>/g, 
      "<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '$1' }}>");
      
    content = content.replace(/<Box\s+display="flex"\s+flexDirection="column"\s+alignItems="center"\s+justifyContent="center"\s+height="([^"]+)"\s*gap=\{([^}]+)\}\s*>/g, 
      "<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '$1', gap: $2 }}>");
      
    content = content.replace(/<Box\s+display="flex"\s+flexDirection="column"\s+alignItems="center"\s+justifyContent="center"\s+height="([^"]+)"\s*>/g, 
      "<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '$1' }}>");
      
    content = content.replace(/<Box\s+display="flex"\s+gap=\{([^}]+)\}\s*>/g, 
      "<Box sx={{ display: 'flex', gap: $1 }}>");
      
    content = content.replace(/<Box\s+display="flex"\s+justifyContent="space-between"\s+alignItems="flex-start"\s+mb=\{([^}]+)\}\s*>/g, 
      "<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: $1 }}>");
      
    content = content.replace(/<Box\s+display="flex"\s+gap=\{([^}]+)\}\s+mb=\{([^}]+)\}\s+flexWrap="wrap"\s*>/g, 
      "<Box sx={{ display: 'flex', gap: $1, mb: $2, flexWrap: 'wrap' }}>");
      
    content = content.replace(/<Box\s+display="flex"\s+justifyContent="space-between"\s+alignItems="center"\s+mb=\{([^}]+)\}\s*>/g, 
      "<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: $1 }}>");

    content = content.replace(/<Box\s+mt=\{([^}]+)\}\s*>/g, 
      "<Box sx={{ mt: $1 }}>");

    content = content.replace(/<Box\s+p=\{([^}]+)\}\s+borderBottom=\{([^}]+)\}\s+borderColor="divider"\s+bgcolor="background.default"\s*>/g, 
      "<Box sx={{ p: $1, borderBottom: $2, borderColor: 'divider', bgcolor: 'background.default' }}>");

    content = content.replace(/<Box\s+p=\{([^}]+)\}\s+textAlign="center"\s*>/g, 
      "<Box sx={{ p: $1, textAlign: 'center' }}>");

    content = content.replace(/<Box\s+display="flex"\s+alignItems="center"\s+gap=\{([^}]+)\}\s*>/g, 
      "<Box sx={{ display: 'flex', alignItems: 'center', gap: $1 }}>");

    fs.writeFileSync(file, content);
  }
});
console.log("Done");
