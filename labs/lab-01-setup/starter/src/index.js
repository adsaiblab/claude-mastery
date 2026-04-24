export function greet(name) {
  return `Bonjour ${name}`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(greet(process.argv[2] ?? 'monde'));
}
