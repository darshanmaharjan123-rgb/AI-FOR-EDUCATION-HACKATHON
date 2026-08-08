/**
 * ClarityAI Node.js Database Interface & Helper
 * Provides SQL query templates and Supabase/SQLite compatibility routines.
 */

const fs = require('fs');
const path = require('path');

const SCHEMA_PATH = path.join(__dirname, 'schema.sql');
const SEED_PATH = path.join(__dirname, 'seed_data.json');

function getSchemaSQL() {
    return fs.readFileSync(SCHEMA_PATH, 'utf8');
}

function getSeedData() {
    return JSON.parse(fs.readFileSync(SEED_PATH, 'utf8'));
}

module.exports = {
    getSchemaSQL,
    getSeedData,
    DB_TABLES: [
        'users',
        'sessions',
        'visual_descriptions',
        'audio_logs',
        'comprehension_logs',
        'quiz_history',
        'analytics_summary'
    ]
};
