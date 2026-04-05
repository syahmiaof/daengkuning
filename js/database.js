// Logic CRUD (Create, Read, Update, Delete)

// Initialize Supabase Client
// CDN creates a global 'supabase' variable, so we name our client 'supabaseClient'
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Function to check connection by selecting 1 row from 'ahli' table
async function checkConnection() {
    try {
        const { data, error } = await supabaseClient
            .from('ahli')
            .select('*')
            .limit(1);
            
        if (error) {
            console.error("Supabase Connection Error:", error.message);
            return;
        }
        console.log("Supabase Connection Successful! Data:", data);
    } catch (err) {
        console.error("Unexpected Error:", err);
    }
}

// Automatically check connection when this script loads
checkConnection();
