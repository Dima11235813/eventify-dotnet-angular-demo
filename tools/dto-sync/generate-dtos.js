#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const API_URL = process.env.API_URL || 'http://localhost:5146';
const OUTPUT_DIR = path.resolve(__dirname, '../../app/src/app/shared/dto');
const TEMPLATE_DIR = path.resolve(__dirname, 'templates');
const USE_DOCKER = process.env.USE_DOCKER !== 'false'; // Default to true

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// OpenAPI generator configuration
const config = {
    inputSpec: `${API_URL}/swagger/v1/swagger.json`,
    outputDir: OUTPUT_DIR,
    generatorName: 'typescript-angular',
    additionalProperties: {
        npmName: '@eventify/dtos',
        npmVersion: '1.0.0',
        snapshot: false,
        supportsES6: true,
        withInterfaces: true,
        withSeparateModelsAndApi: false,
        apiModulePrefix: '',
        configurationPrefix: '',
        serviceFileSuffix: 'Service',
        serviceSuffix: 'Service',
        modelFileSuffix: '',
        // Avoid double-suffix names like CreateEventDtoDto by leaving suffix empty.
        modelSuffix: '',
        stringEnums: true,
        enumPropertyNaming: 'UPPERCASE',
        fileNaming: 'camelCase'
    },
    globalProperty: {
        apiTests: false,
        modelTests: false,
        apiDocs: false,
        modelDocs: false
    },
    typeMappings: {
        'DateTime': 'string',
        'DateOnly': 'string',
        'Guid': 'string'
    }
};

function generateDTOs() {
    console.log('🔄 Generating TypeScript DTOs from OpenAPI spec...');
    console.log(`📡 API URL: ${config.inputSpec}`);
    console.log(`📁 Output Directory: ${OUTPUT_DIR}`);
    console.log(`🐳 Using Docker: ${USE_DOCKER ? 'Yes' : 'No'}`);

    try {
        // Check if API is running by testing the swagger endpoint
        execSync(`curl -f -s "${config.inputSpec}" > /dev/null`);
        console.log('✅ API is accessible');

        if (USE_DOCKER) {
            // Use Docker for generation (recommended)
            generateWithDocker();
        } else {
            // Use local CLI (requires Java)
            generateWithLocalCLI();
        }

        // Clean up generated files (remove unnecessary ones)
        cleanupGeneratedFiles();

        // Create index.ts for clean imports
        createIndexFile();

        console.log('✅ DTOs generated successfully!');
        console.log(`📁 Check generated files in: ${OUTPUT_DIR}`);

    } catch (error) {
        const allowOffline = process.env.ALLOW_DTO_OFFLINE !== 'false';
        if (allowOffline) {
            console.warn('⚠️  Swagger endpoint not reachable. Skipping DTO generation and using existing files.');
            return;
        }
        console.error('❌ Failed to generate DTOs:', error.message);
        console.error('💡 Make sure the API is running and accessible at:', API_URL);
        if (!USE_DOCKER) {
            console.error('💡 Try using Docker instead: USE_DOCKER=true npm run dto:generate');
        }
        process.exit(1);
    }
}

function generateWithDocker() {
    console.log('🐳 Generating with Docker...');

    const additionalProps = Object.entries(config.additionalProperties)
        .map(([k, v]) => `${k}=${v}`).join(',');
    const globalProps = Object.entries(config.globalProperty)
        .map(([k, v]) => `${k}=${v}`).join(',');
    const typeMappings = Object.entries(config.typeMappings)
        .map(([k, v]) => `${k}:${v}`).join(',');

    // Inside Docker, "localhost" points to the container, not the host. Use host.docker.internal instead.
    const inputSpecForDocker = config.inputSpec.replace('http://localhost', 'http://host.docker.internal');

    // Use a single-line docker command for cross-shell compatibility (PowerShell/CMD/Bash)
    const dockerCmd = `docker run --rm -v "${OUTPUT_DIR}:/app/output" openapitools/openapi-generator-cli:latest generate --input-spec "${inputSpecForDocker}" --generator-name "${config.generatorName}" --output "/app/output" --additional-properties "${additionalProps}" --global-property "${globalProps}" --type-mappings "${typeMappings}" --skip-validate-spec`;

    execSync(dockerCmd, { stdio: 'inherit', cwd: process.cwd() });
}

function generateWithLocalCLI() {
    console.log('💻 Generating with local CLI...');

    // Generate TypeScript interfaces
    const cmd = `npx @openapitools/openapi-generator-cli generate \\
        --input-spec "${config.inputSpec}" \\
        --generator-name "${config.generatorName}" \\
        --output "${config.outputDir}" \\
        --additional-properties "${Object.entries(config.additionalProperties).map(([k, v]) => `${k}=${v}`).join(',')}" \\
        --global-property "${Object.entries(config.globalProperty).map(([k, v]) => `${k}=${v}`).join(',')}" \\
        --type-mappings "${Object.entries(config.typeMappings).map(([k, v]) => `${k}:${v}`).join(',')}" \\
        --skip-validate-spec`;

    execSync(cmd, { stdio: 'inherit', cwd: process.cwd() });
}

function cleanupGeneratedFiles() {
    // Keep essential runtime files (configuration.ts, encoder.ts, variables.ts, param.ts, index.ts)
    // Only remove metadata and packaging files we don't ship in the app bundle.
    const filesToRemove = [
        'api.module.ts',
        '.openapi-generator',
        '.openapi-generator-ignore',
        'git_push.sh',
        '.gitignore',
        'README.md',
        'ng-package.json',
        'package.json',
        'tsconfig.json'
    ];

    filesToRemove.forEach(file => {
        const filePath = path.join(OUTPUT_DIR, file);
        if (fs.existsSync(filePath)) {
            if (fs.statSync(filePath).isDirectory()) {
                fs.rmSync(filePath, { recursive: true, force: true });
            } else {
                fs.unlinkSync(filePath);
            }
        }
    });
}

function createIndexFile() {
    // The generator already emits an index.ts; leave it intact.
    console.log('ℹ️  Using generator-provided index.ts');
}

// Check for watch mode
const watchMode = process.argv.includes('--watch');

if (watchMode) {
    console.log('👀 Watch mode enabled. Watching for API changes...');

    // In watch mode, we could poll the API for changes
    // For now, we'll just regenerate on script changes
    const chokidar = require('chokidar');
    const watcher = chokidar.watch([path.resolve(__dirname, '../../api/src')], {
        ignored: ['**/bin/**', '**/obj/**', '**/node_modules/**'],
        persistent: true
    });

    watcher.on('change', (path) => {
        console.log(`📝 API file changed: ${path}`);
        generateDTOs();
    });

    console.log('⏳ Watching for changes... Press Ctrl+C to stop');
} else {
    generateDTOs();
}
