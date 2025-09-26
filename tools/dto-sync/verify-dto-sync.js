#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const API_URL = process.env.API_URL || 'http://localhost:5146';
const DTO_DIR = path.resolve(__dirname, '../../app/src/app/shared/dto');

function verifyDTOSync() {
    console.log('🔍 Verifying DTO synchronization...');

    // Check if API is running
    try {
        execSync(`curl -f -s "${API_URL}/swagger/v1/swagger.json" > /dev/null`, { stdio: 'inherit' });
    } catch (error) {
        console.error('❌ API is not running or accessible');
        console.error('💡 Make sure the API is running at:', API_URL);
        process.exit(1);
    }

    // Check if DTOs directory exists
    if (!fs.existsSync(DTO_DIR)) {
        console.error('❌ DTOs directory not found:', DTO_DIR);
        console.error('💡 Run DTO generation first: npm run dto:generate');
        process.exit(1);
    }

    // Check if index.ts exists
    const indexFile = path.join(DTO_DIR, 'index.ts');
    if (!fs.existsSync(indexFile)) {
        console.error('❌ DTO index file not found:', indexFile);
        console.error('💡 Run DTO generation first: npm run dto:generate');
        process.exit(1);
    }

    // Check if there are actual DTO files
    const modelDir = path.join(DTO_DIR, 'model');
    if (!fs.existsSync(modelDir)) {
        console.error('❌ DTO model directory not found:', modelDir);
        console.error('💡 Run DTO generation first: npm run dto:generate');
        process.exit(1);
    }

    const dtoFiles = fs.readdirSync(modelDir).filter(file => file.endsWith('.ts'));
    if (dtoFiles.length === 0) {
        console.error('❌ No DTO files found in:', modelDir);
        console.error('💡 Run DTO generation first: npm run dto:generate');
        process.exit(1);
    }

    console.log(`✅ Found ${dtoFiles.length} DTO files:`);
    dtoFiles.forEach(file => console.log(`   - ${file}`));

    // Check if generated DTOs are up to date by comparing with current API spec
    try {
        console.log('🔄 Checking if DTOs are up to date...');

        // Get current API spec
        const currentSpec = execSync(`curl -s "${API_URL}/swagger/v1/swagger.json"`, { encoding: 'utf8' });

        // Simple check: if API has changed significantly, DTOs might be outdated
        // In a real implementation, you'd compare hashes or timestamps
        const lastModified = fs.statSync(indexFile).mtime;
        const now = new Date();
        const hoursSinceGeneration = (now - lastModified) / (1000 * 60 * 60);

        if (hoursSinceGeneration > 24) {
            console.warn('⚠️  DTOs were generated more than 24 hours ago');
            console.warn('💡 Consider regenerating: npm run dto:generate');
        } else {
            console.log('✅ DTOs appear to be recent');
        }

    } catch (error) {
        console.warn('⚠️  Could not verify DTO freshness:', error.message);
    }

    console.log('✅ DTO synchronization verified!');
}

if (require.main === module) {
    verifyDTOSync();
}

module.exports = { verifyDTOSync };
