import { join } from 'path'

export const root = (name = '.') => join(process.cwd(), name)
