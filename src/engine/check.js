// Validation helper shared by the build check and tests: items need 3+ options and exactly one correct.
export const validItem = it => it.options.length >= 3 && it.options.filter(o => o.ok).length === 1;
