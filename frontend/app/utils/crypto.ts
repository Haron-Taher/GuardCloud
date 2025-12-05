/**
 * GuardCloud End-to-End Encryption Module
 * 
 * Implements client-side encryption using:
 * - AES-256-GCM for file encryption
 * - PBKDF2 for key derivation from password
 * - Random per-file keys wrapped with master key
 */

// Constants
const ALGORITHM = 'AES-GCM'
const KEY_LENGTH = 256
const IV_LENGTH = 12 // 96 bits for GCM
const SALT_LENGTH = 16
const PBKDF2_ITERATIONS = 100000

// Storage keys
const MASTER_KEY_STORAGE = 'gc_master_key'
const SALT_STORAGE = 'gc_key_salt'

/**
 * Convert ArrayBuffer to Base64 string
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * Convert Base64 string to ArrayBuffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

/**
 * Generate cryptographically secure random bytes
 */
export function generateRandomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length))
}

/**
 * Generate a random IV for encryption
 */
export function generateIV(): Uint8Array {
  return generateRandomBytes(IV_LENGTH)
}

/**
 * Generate a random salt for key derivation
 */
export function generateSalt(): Uint8Array {
  return generateRandomBytes(SALT_LENGTH)
}

/**
 * Derive a master key from password using PBKDF2
 */
export async function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  // Import password as key material
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  )

  // Derive the actual encryption key
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    passwordKey,
    { name: ALGORITHM, length: KEY_LENGTH },
    true, // extractable for export
    ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey']
  )
}

/**
 * Generate a random file encryption key
 */
export async function generateFileKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: ALGORITHM, length: KEY_LENGTH },
    true, // extractable for wrapping
    ['encrypt', 'decrypt']
  )
}

/**
 * Wrap (encrypt) a file key with the master key
 */
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

/**
 * Unwrap (decrypt) a file key using the master key
 */
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

/**
 * Encrypt data using AES-256-GCM
 */
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

/**
 * Decrypt data using AES-256-GCM
 */
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

/**
 * Export a CryptoKey to raw bytes
 */
export async function exportKey(key: CryptoKey): Promise<ArrayBuffer> {
  return crypto.subtle.exportKey('raw', key)
}

/**
 * Import raw bytes as a CryptoKey
 */
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

/**
 * Encrypted file structure
 */
export interface EncryptedFile {
  encryptedData: ArrayBuffer    // The encrypted file content
  iv: Uint8Array                // IV used for file encryption
  wrappedKey: ArrayBuffer       // File key wrapped with master key
  keyIv: Uint8Array             // IV used for key wrapping
}

/**
 * Metadata stored alongside encrypted file
 */
export interface EncryptionMetadata {
  iv: string          // Base64 encoded IV for file
  keyIv: string       // Base64 encoded IV for key wrap
  wrappedKey: string  // Base64 encoded wrapped key
  version: number     // Encryption version for future compatibility
}

/**
 * Encrypt a file for upload
 * Returns encrypted data and metadata to store
 */
export async function encryptFile(
  fileData: ArrayBuffer,
  masterKey: CryptoKey
): Promise<{ encryptedData: ArrayBuffer; metadata: EncryptionMetadata }> {
  // Generate random file key
  const fileKey = await generateFileKey()
  
  // Generate IVs
  const fileIv = generateIV()
  const keyIv = generateIV()
  
  // Encrypt the file data
  const encryptedData = await encryptData(fileData, fileKey, fileIv)
  
  // Wrap the file key with master key
  const wrappedKey = await wrapKey(fileKey, masterKey, keyIv)
  
  // Create metadata
  const metadata: EncryptionMetadata = {
    iv: arrayBufferToBase64(fileIv),
    keyIv: arrayBufferToBase64(keyIv),
    wrappedKey: arrayBufferToBase64(wrappedKey),
    version: 1
  }
  
  return { encryptedData, metadata }
}

/**
 * Decrypt a file after download
 */
export async function decryptFile(
  encryptedData: ArrayBuffer,
  metadata: EncryptionMetadata,
  masterKey: CryptoKey
): Promise<ArrayBuffer> {
  // Decode metadata
  const fileIv = new Uint8Array(base64ToArrayBuffer(metadata.iv))
  const keyIv = new Uint8Array(base64ToArrayBuffer(metadata.keyIv))
  const wrappedKey = base64ToArrayBuffer(metadata.wrappedKey)
  
  // Unwrap the file key
  const fileKey = await unwrapKey(wrappedKey, masterKey, keyIv)
  
  // Decrypt the file
  return decryptData(encryptedData, fileKey, fileIv)
}

/**
 * CryptoManager class for managing encryption state
 */
export class CryptoManager {
  private masterKey: CryptoKey | null = null
  private salt: Uint8Array | null = null
  private initialized = false

  /**
   * Initialize crypto manager with password
   * Creates or restores master key
   */
  async initialize(password: string): Promise<void> {
    // Check for existing salt in localStorage
    const storedSalt = localStorage.getItem(SALT_STORAGE)
    
    if (storedSalt) {
      // Use existing salt
      this.salt = new Uint8Array(base64ToArrayBuffer(storedSalt))
    } else {
      // Generate new salt for new user
      this.salt = generateSalt()
      localStorage.setItem(SALT_STORAGE, arrayBufferToBase64(this.salt))
    }
    
    // Derive master key from password
    this.masterKey = await deriveKeyFromPassword(password, this.salt)
    this.initialized = true
    
    console.log('[Crypto] Master key initialized')
  }

  /**
   * Check if crypto is initialized
   */
  isInitialized(): boolean {
    return this.initialized && this.masterKey !== null
  }

  /**
   * Get the master key (throws if not initialized)
   */
  getMasterKey(): CryptoKey {
    if (!this.masterKey) {
      throw new Error('Crypto not initialized. Call initialize() first.')
    }
    return this.masterKey
  }

  /**
   * Encrypt a file
   */
  async encryptFile(fileData: ArrayBuffer): Promise<{ encryptedData: ArrayBuffer; metadata: EncryptionMetadata }> {
    return encryptFile(fileData, this.getMasterKey())
  }

  /**
   * Decrypt a file
   */
  async decryptFile(encryptedData: ArrayBuffer, metadata: EncryptionMetadata): Promise<ArrayBuffer> {
    return decryptFile(encryptedData, metadata, this.getMasterKey())
  }

  /**
   * Clear crypto state (on logout)
   */
  clear(): void {
    this.masterKey = null
    this.initialized = false
    // Don't clear salt - it's needed if user logs back in
    console.log('[Crypto] Crypto state cleared')
  }

  /**
   * Clear all crypto data including salt (for account deletion)
   */
  clearAll(): void {
    this.clear()
    localStorage.removeItem(SALT_STORAGE)
    console.log('[Crypto] All crypto data cleared')
  }
}

// Singleton instance
export const cryptoManager = new CryptoManager()
