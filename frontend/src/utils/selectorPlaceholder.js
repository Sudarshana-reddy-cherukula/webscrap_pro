export function getSelectorPlaceholder(selectorType) {
  if (selectorType === 'xpath') return "//a[@class='title']"
  if (selectorType === 'jsonpath') return '$.items[*].title'
  if (selectorType === 'regex') return 'href="([^"]+)"'
  return '.card .title'
}
