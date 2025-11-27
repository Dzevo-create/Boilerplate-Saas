/**
 * Theme Components
 * 
 * Dark/Light mode support with system preference detection.
 * 
 * Usage:
 * ```tsx
 * // In layout.tsx
 * import { ThemeProvider } from '@/components/theme';
 * 
 * <ThemeProvider>
 *   {children}
 * </ThemeProvider>
 * 
 * // In any component
 * import { ThemeToggle, useTheme } from '@/components/theme';
 * 
 * <ThemeToggle variant="icon" />
 * ```
 */

export { ThemeProvider, useTheme } from './ThemeProvider';
export { ThemeToggle } from './ThemeToggle';

