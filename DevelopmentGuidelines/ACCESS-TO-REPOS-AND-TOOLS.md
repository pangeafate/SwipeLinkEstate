## The project repository is  https://github.com/pangeafate/SwipeLinkEstate

(empty at the beginning of the project )


### Supabase
##### Project URL: [caddiaxjmtysnvnevcdr.supabase.co](https://caddiaxjmtysnvnevcdr.supabase.co)
##### API key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhZGRpYXhqbXR5c252bmV2Y2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MDAxMDYsImV4cCI6MjA3MTA3NjEwNn0.6AlKHd5n_UKqK__KkzNGG4JOc5tmv2ZYDkNtkX-OIIE
##### Javascript

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://caddiaxjmtysnvnevcdr.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)