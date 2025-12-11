// GuardCloud Encryption Module
// Handles all client-side encryption using AES-256-GCM

/**
 * This module meets Functional Requirements #6 and #7:
 * FR-6: The user SHALL be able to encrypt the files or contents that are being shared in transit.
 * FR-7: The user SHALL be able to decrypt the files once they reach the client.
 */

// Encryption settings
const ALGORITHM = 'AES-GCM'
const KEY_LENGTH = 256
const IV_LENGTH = 12    // 96 bits for GCM mode
const SALT_LENGTH = 16
const PBKDF2_ITERATIONS = 100000  // Iterations for password-based key derivation

// LocalStorage keys
const SALT_STORAGE = 'gc_key_salt'

// Convert ArrayBuffer to Base64 string
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

// Convert Base64 string to ArrayBuffer
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

// Generate random bytes for IVs and salts
export function generateRandomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length))
}

// Generate a random IV for encryption
export function generateIV(): Uint8Array {
  return generateRandomBytes(IV_LENGTH)
}

// Generate a random salt for key derivation
export function generateSalt(): Uint8Array {
  return generateRandomBytes(SALT_LENGTH)
}

// Create a master key from the user's password using PBKDF2
export async function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  // Import password as raw key material
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  )

  // Derive the actual AES key
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    passwordKey,
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey']
  )
}

// Generate a random key for encrypting a single file
export async function generateFileKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  )
}

// Wrap (encrypt) a file key with the master key
export async function wrapKey(
  fileKey: CryptoKey,
  masterKey: CryptoKey,
  iv: Uint8Array
): Promise<ArrayBuffer> {
  return crypto.subtle.wrapKey(
    'raw',
    fileKey,
    masterKey,
    { name: ALGORITHM, iv: iv }
  )
}

// Unwrap (decrypt) a file key using the master key
export async function unwrapKey(
  wrappedKey: ArrayBuffer,
  masterKey: CryptoKey,
  iv: Uint8Array
): Promise<CryptoKey> {
  return crypto.subtle.unwrapKey(
    'raw',
    wrappedKey,
    masterKey,
    { name: ALGORITHM, iv: iv },
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  )
}

// Encrypt data using AES-256-GCM
export async function encryptData(
  data: ArrayBuffer,
  key: CryptoKey,
  iv: Uint8Array
): Promise<ArrayBuffer> {
  return crypto.subtle.encrypt(
    { name: ALGORITHM, iv: iv },
    key,
    data
  )
}

// Decrypt data using AES-256-GCM
export async function decryptData(
  encryptedData: ArrayBuffer,
  key: CryptoKey,
  iv: Uint8Array
): Promise<ArrayBuffer> {
  return crypto.subtle.decrypt(
    { name: ALGORITHM, iv: iv },
    key,
    encryptedData
  )
}

// Export a CryptoKey to raw bytes
export async function exportKey(key: CryptoKey): Promise<ArrayBuffer> {
  return crypto.subtle.exportKey('raw', key)
}

// Import raw bytes as a CryptoKey
export async function importKey(
  keyData: ArrayBuffer,
  usages: KeyUsage[] = ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey']
): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    usages
  )
}

// Metadata stored with each encrypted file
export interface EncryptionMetadata {
  iv: string          // Base64 IV for file encryption
  keyIv: string       // Base64 IV for key wrapping
  wrappedKey: string  // Base64 wrapped file key
  version: number     // Version number for future updates
}

// Encrypt a file and return encrypted data with metadata
export async function encryptFile(
  fileData: ArrayBuffer,
  masterKey: CryptoKey
): Promise<{ encryptedData: ArrayBuffer; metadata: EncryptionMetadata }> {
  // Each file gets its own random key
  const fileKey = await generateFileKey()
  
  // Generate IVs for file encryption and key wrapping
  const fileIv = generateIV()
  const keyIv = generateIV()
  
  // Encrypt the file data
  const encryptedData = await encryptData(fileData, fileKey, fileIv)
  
  // Wrap the file key with master key so it can be stored safely
  const wrappedKey = await wrapKey(fileKey, masterKey, keyIv)
  
  // Build metadata to store alongside the encrypted file
  const metadata: EncryptionMetadata = {
    iv: arrayBufferToBase64(fileIv),
    keyIv: arrayBufferToBase64(keyIv),
    wrappedKey: arrayBufferToBase64(wrappedKey),
    version: 1
  }
  
  return { encryptedData, metadata }
}

// Decrypt a file using stored metadata
export async function decryptFile(
  encryptedData: ArrayBuffer,
  metadata: EncryptionMetadata,
  masterKey: CryptoKey
): Promise<ArrayBuffer> {
  // Decode metadata from base64
  const fileIv = new Uint8Array(base64ToArrayBuffer(metadata.iv))
  const keyIv = new Uint8Array(base64ToArrayBuffer(metadata.keyIv))
  const wrappedKey = base64ToArrayBuffer(metadata.wrappedKey)
  
  // Unwrap the file key
  const fileKey = await unwrapKey(wrappedKey, masterKey, keyIv)
  
  // Decrypt the file
  return decryptData(encryptedData, fileKey, fileIv)
}

/**
 * CryptoManager - manages encryption state for the app
 * Stores the master key derived from user's password
 */
export class CryptoManager {
  private masterKey: CryptoKey | null = null
  private salt: Uint8Array | null = null
  private initialized = false

  // Set up encryption with user's password
  async initialize(password: string): Promise<void> {
    // Check for existing salt (returning user)
    const storedSalt = localStorage.getItem(SALT_STORAGE)
    
    if (storedSalt) {
      this.salt = new Uint8Array(base64ToArrayBuffer(storedSalt))
    } else {
      // New user - create salt
      this.salt = generateSalt()
      localStorage.setItem(SALT_STORAGE, arrayBufferToBase64(this.salt))
    }
    
    // Create master key from password
    this.masterKey = await deriveKeyFromPassword(password, this.salt)
    this.initialized = true
  }

  // Check if encryption is ready
  isInitialized(): boolean {
    return this.initialized && this.masterKey !== null
  }

  // Get master key (throws if not initialized)
  getMasterKey(): CryptoKey {
    if (!this.masterKey) {
      throw new Error('Crypto not initialized. Call initialize() first.')
    }
    return this.masterKey
  }

  // Encrypt a file
  async encryptFile(fileData: ArrayBuffer): Promise<{ encryptedData: ArrayBuffer; metadata: EncryptionMetadata }> {
    return encryptFile(fileData, this.getMasterKey())
  }

  // Decrypt a file
  async decryptFile(encryptedData: ArrayBuffer, metadata: EncryptionMetadata): Promise<ArrayBuffer> {
    return decryptFile(encryptedData, metadata, this.getMasterKey())
  }

  // Clear encryption state on logout
  clear(): void {
    this.masterKey = null
    this.initialized = false
  }

  // Clear everything including salt (for account deletion)
  clearAll(): void {
    this.clear()
    localStorage.removeItem(SALT_STORAGE)
  }
}

// Single instance used throughout the app
export const cryptoManager = new CryptoManager()
