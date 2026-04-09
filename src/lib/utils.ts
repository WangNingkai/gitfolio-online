export const escapeHtml = (value = ''): string => {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export const sanitizeUrl = (url: string | null | undefined): string => {
  if (!url) return ''
  return /^https?:\/\//.test(url) ? url : ''
}

export const kFormatter = (num: number): string | number => {
  const absNum = Math.abs(num)
  if (absNum > 999) {
    const value = Number((absNum / 1000).toFixed(1))
    const result = Math.sign(num) * value
    return `${result}k`
  }
  return Math.sign(num) * absNum
}

export const clampValue = (number: number, min: number, max: number): number => {
  return Math.max(min, Math.min(number, max))
}

export const parseBoolean = (value: string | boolean | undefined): boolean | string | undefined => {
  if (value === 'true') {
    return true
  } else if (value === 'false') {
    return false
  } else {
    return value
  }
}

export const CONSTANTS = {
  THIRTY_MINUTES: 1800,
  TWO_HOURS: 7200,
  ONE_DAY: 86400,
} as const
