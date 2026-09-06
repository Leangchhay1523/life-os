const fs = require('fs');

function fixFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/const uid = \(\) => /g, 'const uid = (): string => ');
  content = content.replace(/function Field\(([^)]+)\) \{/g, 'function Field($1): JSX.Element {');
  content = content.replace(/function BulletField\(([^)]+)\) \{/g, 'function BulletField($1): JSX.Element {');
  content = content.replace(/function EmptyState\(([^)]+)\) \{/g, 'function EmptyState($1): JSX.Element {');
  content = content.replace(/function SectionHeader\(([^)]+)\) \{/g, 'function SectionHeader($1): JSX.Element {');
  content = content.replace(/function ResumeSections\(([^)]+)\) \{/g, 'function ResumeSections($1): JSX.Element {');
  
  // Replace handleUpdate, handleAdd, handleRemove, handleKeyDown return types
  content = content.replace(/const handleUpdate = \(([^)]+)\) => \{/g, 'const handleUpdate = ($1): void => {');
  content = content.replace(/const handleAdd = \(\) => \{/g, 'const handleAdd = (): void => {');
  content = content.replace(/const handleRemove = \(([^)]+)\) => \{/g, 'const handleRemove = ($1): void => {');
  content = content.replace(/const handleKeyDown = \(([^)]+)\) => \{/g, 'const handleKeyDown = ($1): void => {');

  // And some others like getRecordLabel, etc. if needed, but let's run this first.
  fs.writeFileSync(file, content);
}

fixFile('src/renderer/src/components/life/ResumeSections.tsx');
fixFile('src/renderer/src/components/life/ResumeBuilder.tsx');
