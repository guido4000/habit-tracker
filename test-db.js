import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
    console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env')
    process.exit(1)
}

console.log(`Testing connection to ${url}...`)

const supabase = createClient(url, key)

async function test() {
    try {
        // Try to fetch something simple. The profiles table exists and has RLS, 
        // but reading the count or just checking for error is a good test.
        // However, with RLS, public access might be denied unless we have a policy.
        // Instead, let's try auth.getSession() which should always work.

        const { data, error } = await supabase.auth.getSession()

        if (error) {
            throw error
        }

        console.log('✅ Auth service connection successful!')

        // Now try database
        const { count, error: dbError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })

        if (dbError) {
            // It might fail due to RLS if not logged in, but connection refused is different.
            // 42501 is permission denied (RLS), which means connection IS working.
            if (dbError.code === '42501' || dbError.code === 'PGRST301') {
                console.log('✅ Database connection successful! (RLS is active)')
            } else {
                throw dbError
            }
        } else {
            console.log('✅ Database connection successful!')
        }

    } catch (e) {
        console.error('❌ Connection failed:', e.message)
        if (e.cause) console.error('Cause:', e.cause)
        process.exit(1)
    }
}

test()
