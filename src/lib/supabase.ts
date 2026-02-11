import { createClient } from '@supabase/supabase-js'

// TODO: Replace with actual env variables when deploying
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables. Please create a .env file.')
}

// In mock mode, use a valid dummy URL if the env var is missing or invalid
const isMock = import.meta.env.VITE_USE_MOCK === 'true'
const validUrl = supabaseUrl && supabaseUrl.startsWith('http')
    ? supabaseUrl
    : (isMock ? 'https://mock.supabase.co' : '')

if (!validUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables. Please check your .env file.')
}

// @ts-ignore: Intentionally using mock values if needed
export const supabase = createClient(validUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder-key')
