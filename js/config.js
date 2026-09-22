/**
 * Aster Lab - Supabase Configuration
 * 
 * Instructions:
 * 1. Create a project at https://supabase.com
 * 2. Run the SQL commands from supabase.sql in the Supabase SQL Editor.
 * 3. Copy your Project URL and Anon Public Key from Project Settings -> API.
 * 4. Paste them below.
 * 
 * If left as default placeholders, Aster Lab automatically runs in intelligent
 * Demo Mode with LocalStorage persistence so all UI & features can be tested immediately!
 */

const SUPABASE_CONFIG = {
    URL: "https://hnhrmglmtplndrgrwxiy.supabase.co/rest/v1/",
    ANON_KEY: "sb_publishable_LJdch0qwlRdIKSOAdkqBMw_RSyNvnqV"
};

// Export configuration globally for static script tags
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
