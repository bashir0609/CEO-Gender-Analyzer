/**
 * CEO Gender Analyzer - Complete JavaScript File
 * Professional AI-powered gender analysis tool
 * @version 2.0
 */

// Global variables
let isRunning = false;
let shouldStop = false;
let results = [];

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    log('🌟 CEO Gender Analyzer loaded successfully');
    showStatus('Application ready! Click "Test JavaScript" to verify functionality.', 'success');
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize API provider handling
    handleApiProviderChange();
});

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // File input change listener
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            if (this.files.length > 0) {
                loadFromFile();
            }
        });
    }
    
    // API provider change listener
    const apiProviderSelect = document.getElementById('apiProvider');
    if (apiProviderSelect) {
        apiProviderSelect.addEventListener('change', handleApiProviderChange);
    }
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl+Enter to start analysis
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            if (!isRunning) {
                startAnalysis();
            }
        }
        
        // Escape to stop analysis
        if (e.key === 'Escape' && isRunning) {
            e.preventDefault();
            stopAnalysis();
        }
    });
    
    log('🎯 All event listeners initialized');
}

/**
 * Logging function with timestamp
 * @param {string} message - Message to log
 */
function log(message) {
    const timestamp = new Date().toLocaleTimeString();
    const debugDiv = document.getElementById('debug');
    if (debugDiv) {
        debugDiv.style.display = 'block';
        debugDiv.innerHTML += `[${timestamp}] ${message}<br>`;
        debugDiv.scrollTop = debugDiv.scrollHeight;
    }
    console.log(message);
}

/**
 * Show status message with styling
 * @param {string} message - Status message
 * @param {string} type - Status type (info, success, warning, error)
 */
function showStatus(message, type = 'info') {
    const status = document.getElementById('status');
    if (status) {
        status.className = `status status-${type}`;
        status.textContent = message;
        status.style.display = 'block';
    }
    log(`STATUS (${type}): ${message}`);
}

/**
 * Hide status message
 */
function hideStatus() {
    const status = document.getElementById('status');
    if (status) {
        status.style.display = 'none';
    }
}

/**
 * Test JavaScript functionality
 */
function testJS() {
    log('✅ JavaScript is working perfectly!');
    showStatus('JavaScript test successful! All systems operational.', 'success');
    
    // Test basic DOM manipulation
    const button = document.querySelector('.btn-secondary');
    if (button) {
        const originalBackground = button.style.background;
        button.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        setTimeout(() => {
            button.style.background = originalBackground;
            log('✅ DOM manipulation test passed!');
        }, 1000);
    }
}

/**
 * Clear debug log
 */
function clearLog() {
    const debugDiv = document.getElementById('debug');
    if (debugDiv) {
        debugDiv.innerHTML = 'Debug log cleared...<br>';
    }
    hideStatus();
    log('🧹 Log cleared');
}

/**
 * Load sample CSV data
 */
function loadSampleCSV() {
    log('📋 Loading sample CSV data');
    const sampleCSV = `Dr. Alexander Bethke-Jaenicke
Prof. Maria Rodriguez
Mr. John Smith Jr.
Ms. Sarah Johnson
Alexander Wang
Anna Bauer
Michael Chen
Lisa Anderson
Patricia Williams
Robert Johnson
Jennifer Davis
Christopher Miller
Elizabeth Wilson
Daniel Moore
Michelle Taylor
Matthew Anderson
Sarah Thomas
David Jackson
Lisa White
James Harris`;
    
    const namesTextarea = document.getElementById('names');
    if (namesTextarea) {
        namesTextarea.value = sampleCSV;
        showStatus('Sample data loaded! Ready for analysis.', 'success');
    }
}

/**
 * Load data from uploaded file
 */
async function loadFromFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    if (!file) {
        showStatus('Please select a file first', 'error');
        return;
    }

    log(`📁 Loading file: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    
    try {
        let data;
        
        if (file.name.toLowerCase().endsWith('.csv')) {
            data = await loadCSVFile(file);
        } else if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
            showStatus('Excel files require additional library. Please convert to CSV.', 'warning');
            return;
        } else {
            throw new Error('Unsupported file format. Please use CSV files.');
        }
        
        if (data.length === 0) {
            throw new Error('No data found in file');
        }
        
        // Try to find CEO name column
        const possibleColumns = [
            'CEO Name', 'Ceo Name', 'ceo_name', 'ceoname', 'CEO', 'ceo',
            'Name', 'name', 'Full Name', 'fullname', 'Executive', 'Leader'
        ];
        let nameColumn = null;
        const headers = Object.keys(data[0]);
        
        for (const col of possibleColumns) {
            if (headers.includes(col)) {
                nameColumn = col;
                break;
            }
        }
        
        if (!nameColumn) {
            log(`❓ Could not auto-detect CEO name column. Available columns: ${headers.join(', ')}`);
            showStatus(`Could not find CEO name column. Available: ${headers.join(', ')}`, 'warning');
            
            // Show the data for manual inspection
            const preview = data.slice(0, 5).map(row => Object.values(row).join(', ')).join('\n');
            const namesTextarea = document.getElementById('names');
            if (namesTextarea) {
                namesTextarea.value = `Headers: ${headers.join(', ')}\n\nFirst 5 rows:\n${preview}`;
            }
            return;
        }
        
        // Extract names from the identified column
        const names = data.map(row => row[nameColumn])
            .filter(name => name && name.trim())
            .map(name => name.trim());
        
        const namesTextarea = document.getElementById('names');
        if (namesTextarea) {
            namesTextarea.value = names.join('\n');
        }
        
        log(`✅ Loaded ${names.length} CEO names from column: ${nameColumn}`);
        showStatus(`Successfully loaded ${names.length} CEO names from ${file.name}`, 'success');
        
    } catch (error) {
        log(`❌ File loading error: ${error.message}`);
        showStatus(`Error loading file: ${error.message}`, 'error');
    }
}

/**
 * Load and parse CSV file
 * @param {File} file - CSV file to load
 * @returns {Promise<Array>} Parsed CSV data
 */
async function loadCSVFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const text = e.target.result;
                const lines = text.split('\n').filter(line => line.trim());
                
                if (lines.length < 2) {
                    reject(new Error('CSV file appears to be empty or has no data rows'));
                    return;
                }

                const headers = parseCSVLine(lines[0]);
                const data = [];
                
                for (let i = 1; i < lines.length; i++) {
                    const values = parseCSVLine(lines[i]);
                    const row = {};
                    headers.forEach((header, index) => {
                        row[header.trim()] = values[index] ? values[index].trim() : '';
                    });
                    // Only add non-empty rows
                    if (Object.values(row).some(val => val)) {
                        data.push(row);
                    }
                }

                resolve(data);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = () => reject(new Error('Failed to read CSV file'));
        reader.readAsText(file);
    });
}

/**
 * Parse a single CSV line handling quotes and commas
 * @param {string} line - CSV line to parse
 * @returns {Array<string>} Parsed fields
 */
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    
    return result.map(field => field.replace(/^"|"$/g, ''));
}

/**
 * Extract first name from full name, handling titles and prefixes
 * @param {string} fullName - Full name to parse
 * @returns {string} Extracted first name
 */
function extractFirstName(fullName) {
    // Common titles and prefixes to remove
    const titles = [
        'dr.', 'dr', 'prof.', 'prof', 'professor',
        'mr.', 'mr', 'mrs.', 'mrs', 'ms.', 'ms', 'miss',
        'sir', 'lord', 'lady', 'duke', 'duchess',
        'rev.', 'rev', 'reverend', 'father', 'fr.',
        'capt.', 'capt', 'captain', 'col.', 'col', 'colonel',
        'maj.', 'maj', 'major', 'lt.', 'lt', 'lieutenant',
        'gen.', 'gen', 'general', 'admiral', 'adm.',
        'phd', 'ph.d', 'md', 'm.d', 'dds', 'd.d.s',
        'esq.', 'esq', 'jr.', 'jr', 'sr.', 'sr',
        'i', 'ii', 'iii', 'iv', 'v', 'vi'
    ];
    
    // Clean and split the name
    const cleanName = fullName.trim();
    const parts = cleanName.split(/\s+/);
    
    if (parts.length === 0) return cleanName;
    
    // Find the first part that isn't a title
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i].toLowerCase().replace(/[.,]/g, '');
        
        // Skip if it's a title
        if (titles.includes(part)) {
            continue;
        }
        
        // Skip if it's clearly not a name (single letters, initials)
        if (part.length === 1 || part.match(/^[a-z]\.?$/)) {
            continue;
        }
        
        // This should be the first name
        return parts[i].replace(/[.,]/g, '');
    }
    
    // Fallback: return the first part if no valid name found
    return parts[0].replace(/[.,]/g, '');
}

/**
 * Start the main analysis process
 */
async function startAnalysis() {
    if (isRunning) {
        showStatus('Analysis already in progress...', 'info');
        return;
    }

    log('🚀 Starting CEO gender analysis');
    isRunning = true;
    shouldStop = false;
    
    try {
        // Update UI
        const startBtn = document.getElementById('startBtn');
        const stopBtn = document.getElementById('stopBtn');
        if (startBtn) startBtn.style.display = 'none';
        if (stopBtn) stopBtn.style.display = 'inline-flex';
        
        hideStatus();
        results = [];
        
        // Get names from textarea
        const namesTextarea = document.getElementById('names');
        const namesText = namesTextarea ? namesTextarea.value.trim() : '';
        
        if (!namesText) {
            throw new Error('Please enter CEO names or upload a file');
        }

        const nameList = namesText.split('\n')
            .map(name => name.trim())
            .filter(name => name.length > 0);

        if (nameList.length === 0) {
            throw new Error('No valid names found');
        }

        log(`📊 Found ${nameList.length} names to analyze`);
        
        // Get API settings
        const apiProvider = document.getElementById('apiProvider').value;
        const apiKey = document.getElementById('apiKey').value.trim();
        const model = document.getElementById('model').value;
        
        log(`🔧 Using API: ${apiProvider}`);
        if (apiKey) log(`🔑 API Key provided: ${'*'.repeat(Math.min(apiKey.length, 20))}`);
        
        // Validate API settings
        if ((apiProvider === 'openrouter' || apiProvider === 'perplexity') && !apiKey) {
            throw new Error(`API key required for ${apiProvider}`);
        }
        
        showStatus(`Analyzing ${nameList.length} CEO names using ${apiProvider}...`, 'info');

        // Process each name
        for (let i = 0; i < nameList.length; i++) {
            if (shouldStop) {
                log('⏹️ Analysis stopped by user');
                break;
            }

            const name = nameList[i];
            log(`🔍 Processing ${i + 1}/${nameList.length}: ${name}`);
            
            updateProgress(i, nameList.length);
            showStatus(`Processing: ${name} (${i + 1}/${nameList.length}) - Click Stop to cancel`, 'info');
            
            try {
                const result = await predictGender(name, apiProvider, apiKey, model);
                results.push({
                    name: name,
                    firstName: extractFirstName(name),
                    gender: result.gender,
                    confidence: result.confidence
                });
                
                log(`✅ ${name} → ${result.gender} (${result.confidence}%)`);
                
            } catch (error) {
                log(`❌ Error analyzing ${name}: ${error.message}`);
                results.push({
                    name: name,
                    firstName: extractFirstName(name),
                    gender: 'unknown',
                    confidence: 0,
                    error: error.message
                });
            }
            
            // Rate limiting
            if (i < nameList.length - 1 && !shouldStop) {
                await sleep(500);
            }
        }
        
        // Display results
        if (!shouldStop) {
            updateProgress(nameList.length, nameList.length);
            displayResults();
            showStatus(`Analysis complete! Successfully processed ${results.length} names.`, 'success');
        } else {
            displayResults();
            showStatus(`Analysis stopped by user. Processed ${results.length} names.`, 'info');
        }
        
    } catch (error) {
        log(`❌ Analysis error: ${error.message}`);
        showStatus(`Analysis failed: ${error.message}`, 'error');
    } finally {
        // Reset UI
        isRunning = false;
        shouldStop = false;
        const startBtn = document.getElementById('startBtn');
        const stopBtn = document.getElementById('stopBtn');
        const progressContainer = document.getElementById('progressContainer');
        
        if (stopBtn) stopBtn.style.display = 'none';
        if (startBtn) startBtn.style.display = 'inline-flex';
        if (progressContainer) progressContainer.style.display = 'none';
    }
}

/**
 * Stop the analysis process
 */
function stopAnalysis() {
    log('⏹️ Stop button clicked - Analysis will stop after current name');
    shouldStop = true;
    showStatus('Stopping analysis after current name...', 'warning');
}

/**
 * Update progress bar
 * @param {number} current - Current progress
 * @param {number} total - Total items
 */
function updateProgress(current, total) {
    const container = document.getElementById('progressContainer');
    const bar = document.getElementById('progressBar');
    
    if (total > 0 && container && bar) {
        container.style.display = 'block';
        const percentage = (current / total) * 100;
        bar.style.width = percentage + '%';
    } else if (container) {
        container.style.display = 'none';
    }
}

/**
 * Main gender prediction function
 * @param {string} fullName - Full name to analyze
 * @param {string} provider - API provider
 * @param {string} apiKey - API key
 * @param {string} model - Model to use
 * @returns {Promise<Object>} Gender prediction result
 */
async function predictGender(fullName, provider, apiKey, model) {
    const firstName = extractFirstName(fullName);
    
    switch (provider) {
        case 'simple':
            return predictGenderSimple(fullName);
        case 'genderize':
            return await predictWithGenderize(firstName);
        case 'openrouter':
            return await predictWithOpenRouter(firstName, apiKey, model);
        case 'perplexity':
            return await predictWithPerplexity(firstName, apiKey);
        default:
            throw new Error(`Unknown provider: ${provider}`);
    }
}

/**
 * Predict gender using Genderize.io API
 * @param {string} firstName - First name to analyze
 * @returns {Promise<Object>} Gender prediction result
 */
async function predictWithGenderize(firstName) {
    log(`🌐 Calling Genderize API for: ${firstName}`);
    
    try {
        const url = `https://api.genderize.io?name=${encodeURIComponent(firstName)}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Genderize API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        log(`📡 Genderize response: ${JSON.stringify(data)}`);
        
        return {
            name: firstName,
            firstName: firstName,
            gender: data.gender || 'unknown',
            confidence: Math.round((data.probability || 0) * 100)
        };
    } catch (error) {
        log(`❌ Genderize error: ${error.message}`);
        // Fallback to simple prediction
        return predictGenderSimple(firstName);
    }
}

/**
 * Predict gender using OpenRouter API
 * @param {string} firstName - First name to analyze
 * @param {string} apiKey - OpenRouter API key
 * @param {string} model - Model to use
 * @returns {Promise<Object>} Gender prediction result
 */
async function predictWithOpenRouter(firstName, apiKey, model) {
    log(`🤖 Calling OpenRouter API for: ${firstName} using ${model}`);
    
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'CEO Gender Analyzer'
            },
            body: JSON.stringify({
                model: model,
                messages: [{
                    role: 'user',
                    content: `Analyze the first name "${firstName}" and predict the most likely gender. Consider cultural context and name patterns globally. Respond with only: male, female, or unknown`
                }],
                temperature: 0,
                max_tokens: 10
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content.toLowerCase().trim();
        
        let gender = 'unknown';
        let confidence = 75;
        
        if (content.includes('male') && !content.includes('female')) {
            gender = 'male';
            confidence = 85;
        } else if (content.includes('female')) {
            gender = 'female';
            confidence = 85;
        }
        
        log(`🤖 OpenRouter response: "${content}" → ${gender} (${confidence}%)`);
        
        return {
            name: firstName,
            firstName: firstName,
            gender: gender,
            confidence: confidence
        };
    } catch (error) {
        log(`❌ OpenRouter error: ${error.message}`);
        return predictGenderSimple(firstName);
    }
}

/**
 * Predict gender using Perplexity API
 * @param {string} firstName - First name to analyze
 * @param {string} apiKey - Perplexity API key
 * @returns {Promise<Object>} Gender prediction result
 */
async function predictWithPerplexity(firstName, apiKey) {
    log(`🔍 Calling Perplexity API for: ${firstName}`);
    
    try {
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.1-sonar-large-128k-online',
                messages: [{
                    role: 'user',
                    content: `What is the most likely gender for the first name "${firstName}"? Consider etymology, cultural origins, and statistical patterns. Respond with only: male, female, or unknown`
                }],
                temperature: 0,
                max_tokens: 10
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content.toLowerCase().trim();
        
        let gender = 'unknown';
        let confidence = 80;
        
        if (content.includes('male') && !content.includes('female')) {
            gender = 'male';
        } else if (content.includes('female')) {
            gender = 'female';
        }
        
        log(`🔍 Perplexity response: "${content}" → ${gender} (${confidence}%)`);
        
        return {
            name: firstName,
            firstName: firstName,
            gender: gender,
            confidence: confidence
        };
    } catch (error) {
        log(`❌ Perplexity error: ${error.message}`);
        return predictGenderSimple(firstName);
    }
}

/**
 * Simple rule-based gender prediction (fallback)
 * @param {string} fullName - Full name to analyze
 * @returns {Object} Gender prediction result
 */
function predictGenderSimple(fullName) {
    const firstName = extractFirstName(fullName).toLowerCase();
    
    // Common male and female names for basic prediction
    const maleNames = [
        'john', 'michael', 'david', 'james', 'robert', 'william', 'richard', 'charles',
        'joseph', 'thomas', 'christopher', 'daniel', 'paul', 'mark', 'donald', 'steven',
        'andrew', 'joshua', 'kenneth', 'matthew', 'alexander', 'patrick', 'jack', 'ryan',
        'benjamin', 'jacob', 'edward', 'lucas', 'mason', 'ethan', 'noah', 'alex'
    ];
    
    const femaleNames = [
        'mary', 'patricia', 'jennifer', 'linda', 'elizabeth', 'barbara', 'susan', 'jessica',
        'sarah', 'karen', 'nancy', 'lisa', 'betty', 'helen', 'sandra', 'donna', 'carol',
        'ruth', 'sharon', 'michelle', 'laura', 'kimberly', 'deborah', 'dorothy',
        'amy', 'angela', 'ashley', 'brenda', 'emma', 'olivia', 'sophia', 'isabella', 'anna',
        'maria'
    ];
    
    let gender = 'unknown';
    let confidence = 50;
    
    if (maleNames.includes(firstName)) {
        gender = 'male';
        confidence = 85;
    } else if (femaleNames.includes(firstName)) {
        gender = 'female';
        confidence = 85;
    } else {
        // Simple heuristics based on name endings
        if (firstName.endsWith('a') || firstName.endsWith('ia') || firstName.endsWith('ine') || 
            firstName.endsWith('elle') || firstName.endsWith('ette')) {
            gender = 'female';
            confidence = 60;
        } else if (firstName.endsWith('er') || firstName.endsWith('on') || firstName.endsWith('us') ||
                   firstName.endsWith('ander') || firstName.endsWith('ovich')) {
            gender = 'male';
            confidence = 60;
        }
    }
    
    return {
        name: fullName,
        firstName: extractFirstName(fullName),
        gender: gender,
        confidence: confidence
    };
}

/**
 * Display analysis results
 */
function displayResults() {
    log('📊 Displaying analysis results');
    
    // Calculate statistics
    const total = results.length;
    const male = results.filter(r => r.gender === 'male').length;
    const female = results.filter(r => r.gender === 'female').length;
    const unknown = total - male - female;

    // Update statistics cards
    const totalCountEl = document.getElementById('totalCount');
    const maleCountEl = document.getElementById('maleCount');
    const femaleCountEl = document.getElementById('femaleCount');
    const unknownCountEl = document.getElementById('unknownCount');
    
    if (totalCountEl) totalCountEl.textContent = total;
    if (maleCountEl) maleCountEl.textContent = male;
    if (femaleCountEl) femaleCountEl.textContent = female;
    if (unknownCountEl) unknownCountEl.textContent = unknown;

    // Update results table
    const tbody = document.getElementById('resultsTable');
    if (tbody) {
        tbody.innerHTML = '';

        results.forEach(result => {
            const row = tbody.insertRow();
            
            // Add confidence and error indicators
            let confidenceIcon = '';
            let nameDisplay = result.name;
            
            if (result.error) {
                confidenceIcon = '⚠️';
                nameDisplay += ' (Error)';
            } else if (result.gender === 'unknown') {
                confidenceIcon = '❓';
            } else if (result.confidence < 70) {
                confidenceIcon = '⚠️';
            } else {
                confidenceIcon = '✅';
            }
            
            row.innerHTML = `
                <td>${nameDisplay}</td>
                <td><strong>${result.firstName}</strong></td>
                <td class="${result.gender}">
                    ${result.gender.toUpperCase()} ${confidenceIcon}
                </td>
                <td>${result.confidence}%</td>
            `;
        });
    }

    // Show results section
    const resultsSection = document.getElementById('results');
    if (resultsSection) {
        resultsSection.style.display = 'block';
    }
    
    updateReanalysisCount();
    
    log(`📈 Results: ${male} male, ${female} female, ${unknown} unknown (${total} total)`);
}

/**
 * Update re-analysis count indicators
 */
function updateReanalysisCount() {
    const unknownCount = results.filter(r => r.gender === 'unknown').length;
    const lowConfidenceCount = results.filter(r => r.gender !== 'unknown' && r.confidence < 70).length;
    const errorCount = results.filter(r => r.error).length;
    
    const countSpan = document.getElementById('reanalyzeCount');
    if (countSpan) {
        countSpan.innerHTML = `
            <div class="count-item">Unknown: <strong>${unknownCount}</strong></div>
            <div class="count-item">Low confidence: <strong>${lowConfidenceCount}</strong></div>
            <div class="count-item">Errors: <strong>${errorCount}</strong></div>
        `;
    }
}

/**
 * Start re-analysis of uncertain results
 */
async function startReanalysis() {
    if (isRunning) {
        showStatus('Analysis already in progress...', 'info');
        return;
    }
    
    log('🔄 Starting re-analysis of uncertain results');
    
    // Get re-analysis settings
    const reanalyzeUnknown = document.getElementById('reanalyzeUnknown').checked;
    const reanalyzeLowConfidence = document.getElementById('reanalyzeLowConfidence').checked;
    const reanalyzeErrors = document.getElementById('reanalyzeErrors').checked;
    const provider = document.getElementById('reanalyzeProvider').value;
    const apiKey = document.getElementById('reanalyzeApiKey').value.trim();
    
    // Validate settings
    if ((provider === 'openrouter' || provider === 'perplexity') && !apiKey) {
        showStatus(`API key required for ${provider}`, 'error');
        return;
    }
    
    // Find entries to re-analyze
    const toReanalyze = results.filter(result => {
        if (reanalyzeUnknown && result.gender === 'unknown') return true;
        if (reanalyzeLowConfidence && result.gender !== 'unknown' && result.confidence < 70) return true;
        if (reanalyzeErrors && result.error) return true;
        return false;
    });
    
    if (toReanalyze.length === 0) {
        showStatus('No entries selected for re-analysis. Check the options above.', 'warning');
        return;
    }
    
    log(`🎯 Re-analyzing ${toReanalyze.length} entries using ${provider}`);
    showStatus(`Re-analyzing ${toReanalyze.length} uncertain entries using ${provider}...`, 'info');
    
    isRunning = true;
    shouldStop = false;
    
    try {
        // Update UI
        const reanalyzeBtn = document.getElementById('reanalyzeBtn');
        if (reanalyzeBtn) {
            reanalyzeBtn.disabled = true;
            reanalyzeBtn.textContent = '🔄 Re-analyzing...';
        }
        
        for (let i = 0; i < toReanalyze.length; i++) {
            if (shouldStop) {
                log('⏹️ Re-analysis stopped by user');
                break;
            }
            
            const entry = toReanalyze[i];
            log(`🔍 Re-analyzing ${i + 1}/${toReanalyze.length}: ${entry.name}`);
            showStatus(`Re-analyzing: ${entry.name} (${i + 1}/${toReanalyze.length})`, 'info');
            
            try {
                const newResult = await predictGender(entry.name, provider, apiKey, 'anthropic/claude-3.5-sonnet');
                
                // Update the original result
                const originalIndex = results.findIndex(r => r.name === entry.name);
                if (originalIndex !== -1) {
                    results[originalIndex] = {
                        ...results[originalIndex],
                        gender: newResult.gender,
                        confidence: newResult.confidence,
                        error: undefined,
                        reanalyzed: true
                    };
                }
                
                log(`✅ Re-analyzed ${entry.name} → ${newResult.gender} (${newResult.confidence}%)`);
                
            } catch (error) {
                log(`❌ Re-analysis error for ${entry.name}: ${error.message}`);
            }
            
            // Rate limiting
            if (i < toReanalyze.length - 1 && !shouldStop) {
                await sleep(300);
            }
        }
        
        // Update display
        displayResults();
        showStatus(`Re-analysis complete! Updated ${toReanalyze.length} entries.`, 'success');
        
    } catch (error) {
        log(`❌ Re-analysis error: ${error.message}`);
        showStatus(`Re-analysis failed: ${error.message}`, 'error');
    } finally {
        // Reset UI
        isRunning = false;
        const reanalyzeBtn = document.getElementById('reanalyzeBtn');
        if (reanalyzeBtn) {
            reanalyzeBtn.disabled = false;
            reanalyzeBtn.textContent = '🔄 Re-analyze Selected';
        }
    }
}

/**
 * Download results as CSV
 */
function downloadCSV() {
    if (results.length === 0) {
        showStatus('No results to download. Please run analysis first.', 'warning');
        return;
    }
    
    log('💾 Generating CSV download');
    
    // Create CSV content
    const headers = ['Full Name', 'First Name', 'Gender', 'Confidence', 'Status'];
    const rows = results.map(result => [
        `"${result.name}"`,
        `"${result.firstName}"`,
        result.gender,
        result.confidence,
        result.error ? 'Error' : (result.reanalyzed ? 'Re-analyzed' : 'Original')
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ceo_gender_analysis_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showStatus('CSV file downloaded successfully!', 'success');
}

/**
 * Download results as Excel (simplified TSV for now)
 */
function downloadExcel() {
    if (results.length === 0) {
        showStatus('No results to download. Please run analysis first.', 'warning');
        return;
    }
    
    log('📊 Generating Excel-compatible download');
    
    // Create tab-separated values (can be opened in Excel)
    const headers = ['Full Name', 'First Name', 'Gender', 'Confidence', 'Status'];
    const rows = results.map(result => [
        result.name,
        result.firstName,
        result.gender,
        result.confidence,
        result.error ? 'Error' : (result.reanalyzed ? 'Re-analyzed' : 'Original')
    ]);
    
    const tsvContent = [headers.join('\t'), ...rows.map(row => row.join('\t'))].join('\n');
    
    // Create and download file
    const blob = new Blob([tsvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ceo_gender_analysis_${new Date().toISOString().split('T')[0]}.tsv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showStatus('Excel-compatible file downloaded successfully!', 'success');
}

/**
 * Copy results to clipboard
 */
function copyResults() {
    if (results.length === 0) {
        showStatus('No results to copy. Please run analysis first.', 'warning');
        return;
    }
    
    log('📋 Copying results to clipboard');
    
    // Create formatted text
    const headers = 'Full Name\tFirst Name\tGender\tConfidence\tStatus';
    const rows = results.map(result => 
        `${result.name}\t${result.firstName}\t${result.gender}\t${result.confidence}%\t${result.error ? 'Error' : (result.reanalyzed ? 'Re-analyzed' : 'Original')}`
    );
    
    const textContent = [headers, ...rows].join('\n');
    
    // Copy to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textContent).then(() => {
            showStatus('Results copied to clipboard! You can paste into Excel or other applications.', 'success');
        }).catch(err => {
            log(`❌ Clipboard error: ${err.message}`);
            fallbackCopyToClipboard(textContent);
        });
    } else {
        fallbackCopyToClipboard(textContent);
    }
}

/**
 * Fallback method to copy text to clipboard
 * @param {string} text - Text to copy
 */
function fallbackCopyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        showStatus('Results copied to clipboard!', 'success');
    } catch (err) {
        showStatus('Please select and copy the text manually.', 'warning');
        log(`❌ Fallback clipboard error: ${err.message}`);
    }
    
    document.body.removeChild(textarea);
}

/**
 * Handle API provider change
 */
function handleApiProviderChange() {
    const provider = document.getElementById('apiProvider').value;
    const apiKeyInput = document.getElementById('apiKey');
    const modelSelect = document.getElementById('model');
    
    if (provider === 'simple' || provider === 'genderize') {
        if (apiKeyInput) {
            apiKeyInput.disabled = true;
            apiKeyInput.placeholder = 'No API key needed';
        }
        if (modelSelect) {
            modelSelect.disabled = true;
        }
    } else {
        if (apiKeyInput) {
            apiKeyInput.disabled = false;
            apiKeyInput.placeholder = 'Enter your API key';
        }
        if (modelSelect) {
            modelSelect.disabled = provider !== 'openrouter';
        }
    }
}

/**
 * Utility function to sleep/delay execution
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after the delay
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Format confidence percentage with color coding
 * @param {number} confidence - Confidence percentage
 * @returns {string} Formatted confidence string
 */
function formatConfidence(confidence) {
    let color = '';
    if (confidence >= 80) color = 'color: #10b981;'; // Green
    else if (confidence >= 60) color = 'color: #f59e0b;'; // Yellow
    else color = 'color: #ef4444;'; // Red
    
    return `<span style="${color} font-weight: 600;">${confidence}%</span>`;
}

/**
 * Add animation to elements
 * @param {HTMLElement} element - Element to animate
 * @param {string} animation - Animation class name
 */
function addAnimation(element, animation) {
    if (element) {
        element.classList.add(animation);
        setTimeout(() => {
            element.classList.remove(animation);
        }, 600);
    }
}

// Make functions globally available
window.testJS = testJS;
window.clearLog = clearLog;
window.loadSampleCSV = loadSampleCSV;
window.loadFromFile = loadFromFile;
window.startAnalysis = startAnalysis;
window.stopAnalysis = stopAnalysis;
window.startReanalysis = startReanalysis;
window.downloadCSV = downloadCSV;
window.downloadExcel = downloadExcel;
window.copyResults = copyResults;

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        extractFirstName,
        predictGenderSimple,
        parseCSVLine,
        formatConfidence,
        testJS,
        clearLog,
        loadSampleCSV,
        startAnalysis,
        stopAnalysis
    };
}