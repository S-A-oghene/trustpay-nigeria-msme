declare namespace React { type ReactNode = any }
declare namespace JSX { interface IntrinsicElements { [elemName:string]: any } }
declare module 'next/link' { const Link: any; export default Link }
declare module 'next/navigation' { export function notFound(): never; export function redirect(url:string): never }
declare module 'next/server' { export class NextRequest extends Request { nextUrl:any; cookies:any; } export const NextResponse:any }
declare module 'next/headers' { export const cookies:any }
declare module 'next' { export type Metadata = Record<string, any>; export type NextConfig = Record<string, any> }
declare module '@supabase/ssr' { export const createBrowserClient:any; export const createServerClient:any }
declare module '@supabase/supabase-js' { export const createClient:any }
declare const process:any

declare module 'react/jsx-runtime' { export const jsx:any; export const jsxs:any; export const Fragment:any }
declare const Buffer:any
declare module 'node:crypto' { export const createHash:any; export const randomUUID:any; export const timingSafeEqual:any; const crypto:any; export default crypto }
