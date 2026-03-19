const fs = require('fs');
let content = fs.readFileSync('src/pages/MyReservationsPage/MyReservationsPage.css', 'utf8');
content = content.replace(/^(\s+)([a-zA-Z]+):\s*(.*?);/gm, (match, spaces, p1, p2) => {
  if (!p1.match(/[A-Z]/) && !p2.includes('"')) return match; 
  const kebab = p1.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
  return `${spaces}${kebab}: ${p2.replace(/"/g, '')};`;
});
fs.writeFileSync('src/pages/MyReservationsPage/MyReservationsPage.css', content);
