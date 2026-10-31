export function renderTemplate(
  template: string,
  variables: Record<string, string | number>,
): { rendered: string; missing: string[] } {
  const missing: string[] = [];
  const rendered = template.replace(/\{\{(\w+)\}\}/g, (match, varName: string) => {
    if (varName in variables) {
      return String(variables[varName]);
    }
    if (!missing.includes(varName)) missing.push(varName);
    return match;
  });
  return { rendered, missing };
}