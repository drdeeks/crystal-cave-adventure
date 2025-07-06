#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');

// Check if running in WSL or proper Unix environment
if (process.platform === 'win32') {
    console.log('❌ This script is designed for WSL (Windows Subsystem for Linux)');
    console.log('Please run this script in WSL, not Windows PowerShell');
    console.log('\nTo use WSL:');
    console.log('1. Install WSL if not already installed');
    console.log('2. Open WSL terminal');
    console.log('3. Navigate to your project directory');
    console.log('4. Run: npm run import-key');
    process.exit(1);
}

// Create keystore directory if it doesn't exist
const keystoreDir = path.join(__dirname, '..', 'keystore');
if (!fs.existsSync(keystoreDir)) {
    fs.mkdirSync(keystoreDir, { recursive: true });
}

// Function to hide input (works properly in Unix environments)
function hideInput(query) {
    return new Promise((resolve) => {
        const stdin = process.stdin;
        const stdout = process.stdout;
        
        let input = '';
        
        // Write the query prompt
        stdout.write(query);
        
        // Set raw mode for character-by-character input
        stdin.setRawMode(true);
        stdin.resume();
        stdin.setEncoding('utf8');
        
        const onData = (char) => {
            switch (char) {
                case '\n':
                case '\r':
                case '\u0004':
                    // Enter key - finish input
                    stdin.setRawMode(false);
                    stdin.pause();
                    stdin.removeListener('data', onData);
                    stdout.write('\n');
                    resolve(input);
                    break;
                    
                case '\u0003':
                    // Ctrl+C - exit
                    stdout.write('\n');
                    process.exit(1);
                    break;
                    
                case '\u007f':
                case '\b':
                    // Backspace
                    if (input.length > 0) {
                        input = input.slice(0, -1);
                        stdout.write('\b \b');
                    }
                    break;
                    
                default:
                    // Regular character
                    if (char.charCodeAt(0) >= 32) {
                        input += char;
                        stdout.write('*');
                    }
                    break;
            }
        };
        
        stdin.on('data', onData);
    });
}

// Function to validate private key format
function validatePrivateKey(privateKey) {
    if (!privateKey || privateKey.length === 0) {
        return null;
    }
    
    // Remove 0x prefix if present and any whitespace
    const cleanKey = privateKey.replace(/^0x/, '').replace(/\s/g, '');
    
    // Check if it's a valid 64-character hex string
    if (!/^[0-9a-fA-F]{64}$/.test(cleanKey)) {
        return null;
    }
    
    return cleanKey;
}

// Function to encrypt private key using modern crypto methods
function encryptPrivateKey(privateKey, password) {
    const algorithm = 'aes-256-gcm';
    const salt = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    
    // Derive key using scrypt with proper salt
    const key = crypto.scryptSync(password, salt, 32);
    
    // Create cipher using correct Node.js API
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    
    // Encrypt the private key
    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get the authentication tag
    const authTag = cipher.getAuthTag();
    
    return {
        encrypted,
        iv: iv.toString('hex'),
        salt: salt.toString('hex'),
        authTag: authTag.toString('hex'),
        algorithm
    };
}

// Function to decrypt private key (for verification)
function decryptPrivateKey(encryptedData, password) {
    try {
        const algorithm = encryptedData.algorithm;
        const salt = Buffer.from(encryptedData.salt, 'hex');
        const iv = Buffer.from(encryptedData.iv, 'hex');
        const authTag = Buffer.from(encryptedData.authTag, 'hex');
        
        // Derive the same key
        const key = crypto.scryptSync(password, salt, 32);
        
        // Create decipher using correct Node.js API
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        decipher.setAuthTag(authTag);
        
        // Decrypt
        let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        return null;
    }
}

async function main() {
    console.log('🔐 Crystal Cave NFT - Private Key Import Tool (WSL)');
    console.log('='.repeat(55));
    console.log('Securely encrypt and store your private key for contract deployment.');
    console.log('✅ Running in WSL/Unix environment - Full security features enabled.\n');
    
    try {
        // Get private key with hidden input
        const privateKeyInput = await hideInput('Enter your private key (with or without 0x): ');
        
        if (!privateKeyInput || privateKeyInput.trim().length === 0) {
            console.log('❌ No private key entered.');
            process.exit(1);
        }
        
        const privateKey = validatePrivateKey(privateKeyInput);
        
        if (!privateKey) {
            console.log('❌ Invalid private key format.');
            console.log('Please enter a valid 64-character hex string (with or without 0x prefix).');
            console.log('Example: 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
            console.log('Or:      1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
            process.exit(1);
        }
        
        console.log('✅ Valid private key format detected.\n');
        
        // Get password with hidden input
        const password = await hideInput('Enter a password to encrypt the keystore (min 8 chars): ');
        if (password.length < 8) {
            console.log('❌ Password must be at least 8 characters long.');
            process.exit(1);
        }
        
        // Confirm password with hidden input
        const confirmPassword = await hideInput('Confirm password: ');
        if (password !== confirmPassword) {
            console.log('❌ Passwords do not match.');
            process.exit(1);
        }
        
        // Get optional password hint (visible input)
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        const hint = await new Promise((resolve) => {
            rl.question('Enter a password hint (optional, press Enter to skip): ', (answer) => {
                rl.close();
                resolve(answer.trim());
            });
        });
        
        // Encrypt the private key
        console.log('\n🔒 Encrypting private key with AES-256-GCM...');
        const encryptedData = encryptPrivateKey(privateKey, password);
        
        // Add metadata
        const keystoreData = {
            ...encryptedData,
            version: 2,
            created: new Date().toISOString(),
            hint: hint || null,
            description: 'Crystal Cave NFT Private Key Keystore (WSL)',
            environment: 'wsl'
        };
        
        // Save to keystore file
        const keystoreFile = path.join(keystoreDir, 'wallet.json');
        fs.writeFileSync(keystoreFile, JSON.stringify(keystoreData, null, 2));
        
        // Verify encryption worked
        console.log('🔍 Verifying encryption...');
        const decrypted = decryptPrivateKey(encryptedData, password);
        if (decrypted !== privateKey) {
            console.log('❌ Encryption verification failed.');
            process.exit(1);
        }
        
        console.log('✅ Private key successfully encrypted and stored!');
        console.log(`📁 Keystore location: ${keystoreFile}`);
        console.log('\n🛡️  Security Features:');
        console.log('- AES-256-GCM encryption with random salt');
        console.log('- Scrypt key derivation (32-byte key)');
        console.log('- Authentication tag for integrity verification');
        console.log('- Hidden input (no terminal display)');
        console.log('- Memory cleanup performed');
        
        console.log('\n⚠️  Important Security Notes:');
        console.log('- Keep your password safe - it cannot be recovered');
        console.log('- Back up your keystore file securely');
        console.log('- Never share your keystore file or password');
        console.log('- The keystore is safe to store in cloud backup');
        
        console.log('\n🚀 Next Steps:');
        console.log('1. Deploy contract: forge script script/Deploy.s.sol --rpc-url $ETH_RPC_URL --broadcast');
        console.log('2. Verify contract: npm run verify-contract <contract_address>');
        console.log('3. Update .env with contract address');
        
        // Clear sensitive data from memory
        privateKeyInput.split('').fill('0');
        privateKey.split('').fill('0');
        password.split('').fill('0');
        confirmPassword.split('').fill('0');
        
        // Force garbage collection if available
        if (global.gc) {
            global.gc();
        }
        
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
        console.log('\nIf you encounter issues:');
        console.log('- Ensure you are running in WSL, not Windows PowerShell');
        console.log('- Check that Node.js and npm are properly installed in WSL');
        console.log('- Verify WSL has proper terminal capabilities');
        process.exit(1);
    }
}

// Handle cleanup on exit
process.on('exit', () => {
    // Clear any remaining sensitive data from memory
    if (global.gc) {
        global.gc();
    }
});

process.on('SIGINT', () => {
    console.log('\n\n👋 Import cancelled by user.');
    process.exit(0);
});

main(); 