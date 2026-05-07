import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://cmrfevxanrcoyaswfhrd.supabase.co"
const supabaseKey = "wedding_Sara/Emanuel"

export const supabase = createClient(
    supabaseUrl,
    supabaseKey
)