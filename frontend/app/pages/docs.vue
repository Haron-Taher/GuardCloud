<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTheme } from '~/composables/useTheme'

const { isDark, toggleTheme, init: initTheme } = useTheme()

onMounted(() => {
  initTheme()
})

const activeCategory = ref('getting-started')
const searchQuery = ref('')

const categories = [
  { id: 'getting-started', name: 'Getting Started', icon: 'rocket' },
  { id: 'files', name: 'Files & Folders', icon: 'folder' },
  { id: 'sharing', name: 'Sharing', icon: 'share' },
  { id: 'security', name: 'Security', icon: 'shield' },
  { id: 'account', name: 'Account', icon: 'user' },
  { id: 'troubleshooting', name: 'Troubleshooting', icon: 'help' },
]
</script>

<template>
  <div class="docs-page">
    <!-- Navigation -->
    <header class="nav">
      <div class="container nav__inner">
        <NuxtLink to="/" class="brand">
          <img src="~/assets/logos/securecloud.png" alt="GuardCloud" class="brand-img" />
          <span>GuardCloud</span>
        </NuxtLink>
        <div class="nav__actions">
          <button class="theme-btn" @click="toggleTheme" :title="isDark ? 'Light mode' : 'Dark mode'">
            <svg v-if="isDark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="5"/>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          </button>
          <NuxtLink to="/login" class="btn btn-ghost">Sign in</NuxtLink>
          <NuxtLink to="/signup" class="btn btn-primary">Get started</NuxtLink>
        </div>
      </div>
    </header>

    <!-- Hero -->
    <section class="hero">
      <div class="container">
        <div class="hero__badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          Help Center
        </div>
        <h1>Documentation</h1>
        <p>Everything you need to know about using GuardCloud securely and effectively.</p>
        
        <!-- Search -->
        <div class="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Search documentation..."
            class="search-input"
          />
        </div>
      </div>
    </section>

    <!-- Quick Links -->
    <section class="quick-links">
      <div class="container">
        <div class="quick-links__grid">
          <a href="#getting-started" class="quick-link" @click.prevent="activeCategory = 'getting-started'">
            <div class="quick-link__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
                <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
                <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
                <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
              </svg>
            </div>
            <span>Quick Start</span>
          </a>
          <a href="#files" class="quick-link" @click.prevent="activeCategory = 'files'">
            <div class="quick-link__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <path d="M14 2v6h6M12 18v-6M9 15l3-3 3 3"/>
              </svg>
            </div>
            <span>Upload Files</span>
          </a>
          <a href="#sharing" class="quick-link" @click.prevent="activeCategory = 'sharing'">
            <div class="quick-link__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/>
              </svg>
            </div>
            <span>Share Files</span>
          </a>
          <a href="#security" class="quick-link" @click.prevent="activeCategory = 'security'">
            <div class="quick-link__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <span>Security</span>
          </a>
        </div>
      </div>
    </section>

    <!-- Content -->
    <section class="content">
      <div class="container">
        <div class="content__wrapper">
          <!-- Sidebar -->
          <aside class="sidebar">
            <nav>
              <button 
                v-for="cat in categories" 
                :key="cat.id"
                class="sidebar-item"
                :class="{ active: activeCategory === cat.id }"
                @click="activeCategory = cat.id"
              >
                <svg v-if="cat.icon === 'rocket'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
                  <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
                </svg>
                <svg v-else-if="cat.icon === 'folder'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                </svg>
                <svg v-else-if="cat.icon === 'share'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/>
                </svg>
                <svg v-else-if="cat.icon === 'shield'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <svg v-else-if="cat.icon === 'user'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                {{ cat.name }}
              </button>
            </nav>
          </aside>

          <!-- Main Content -->
          <main class="main-content">
            <!-- Getting Started -->
            <div v-show="activeCategory === 'getting-started'" class="doc-section">
              <h2>Getting Started with GuardCloud</h2>
              <p class="intro">Welcome to GuardCloud! This guide will help you get started with secure cloud storage in just a few minutes.</p>

              <article class="article">
                <h3>Creating Your Account</h3>
                <ol>
                  <li>Visit <NuxtLink to="/signup">guardcloud.io/signup</NuxtLink></li>
                  <li>Enter a unique username (3+ characters)</li>
                  <li>Optionally add an email for account recovery</li>
                  <li>Create a strong password (8+ characters)</li>
                  <li>Click "Create Account"</li>
                </ol>
                <div class="tip-box">
                  <strong>💡 Important:</strong> Your password is used to encrypt your files. If you forget it without email recovery, your files cannot be recovered. Store your password safely!
                </div>
              </article>

              <article class="article">
                <h3>Understanding the Dashboard</h3>
                <p>After logging in, you'll see the main dashboard with these key areas:</p>
                <ul>
                  <li><strong>Sidebar (left):</strong> Navigate between My Drive, Starred, and Trash</li>
                  <li><strong>Main area (center):</strong> View your files and folders</li>
                  <li><strong>New button:</strong> Upload files or create folders</li>
                  <li><strong>Encryption status:</strong> Green shield indicates active encryption</li>
                  <li><strong>Storage bar:</strong> Shows your usage and limits</li>
                </ul>
              </article>

              <article class="article">
                <h3>Encryption Status</h3>
                <p>Look for the encryption shield in the sidebar:</p>
                <ul>
                  <li><strong>Green shield with checkmark:</strong> Encryption is active. Your files are protected.</li>
                  <li><strong>Gray shield:</strong> Encryption is inactive. Please log in again to reinitialize.</li>
                </ul>
                <div class="info-box">
                  <strong>How it works:</strong> When you log in, your password derives your encryption key. This key stays in your browser and encrypts files before upload. We never see your password or encryption keys.
                </div>
              </article>
            </div>

            <!-- Files & Folders -->
            <div v-show="activeCategory === 'files'" class="doc-section">
              <h2>Files & Folders</h2>
              <p class="intro">Learn how to upload, organize, and manage your files in GuardCloud.</p>

              <article class="article">
                <h3>Uploading Files</h3>
                <ol>
                  <li>Click the <strong>"New"</strong> button in the sidebar</li>
                  <li>Select <strong>"Upload file"</strong></li>
                  <li>Choose a file from your device (max 100MB)</li>
                  <li>Wait for encryption and upload to complete</li>
                </ol>
                <p>You'll see a progress bar showing "Encrypting & uploading..." with the percentage complete.</p>
                <div class="tip-box">
                  <strong>💡 Tip:</strong> You can also drag and drop files directly onto the dashboard to upload them.
                </div>
              </article>

              <article class="article">
                <h3>Creating Folders</h3>
                <ol>
                  <li>Click the <strong>"New"</strong> button in the sidebar</li>
                  <li>Select <strong>"New folder"</strong></li>
                  <li>Enter a name for your folder</li>
                  <li>Click "Create"</li>
                </ol>
                <p>Folders help you organize files. Click on a folder to navigate into it. Use the breadcrumb navigation at the top to go back.</p>
              </article>

              <article class="article">
                <h3>File Actions</h3>
                <p>Click the three-dot menu (⋮) on any file to access these options:</p>
                <ul>
                  <li><strong>Preview:</strong> View images, PDFs, and text files</li>
                  <li><strong>Download:</strong> Download the decrypted file to your device</li>
                  <li><strong>Rename:</strong> Change the file name</li>
                  <li><strong>Move:</strong> Move to a different folder</li>
                  <li><strong>Share:</strong> Create a share link</li>
                  <li><strong>Move to Trash:</strong> Delete the file (can be restored)</li>
                </ul>
              </article>

              <article class="article">
                <h3>Trash & Recovery</h3>
                <p>Deleted files go to Trash and can be recovered:</p>
                <ol>
                  <li>Click <strong>"Trash"</strong> in the sidebar</li>
                  <li>Find the file you want to recover</li>
                  <li>Click <strong>"Restore"</strong> to recover it</li>
                  <li>Or click <strong>"Delete permanently"</strong> to remove forever</li>
                </ol>
                <div class="warning-box">
                  <strong>⚠️ Warning:</strong> Files deleted permanently cannot be recovered. Trash is automatically emptied after 30 days.
                </div>
              </article>
            </div>

            <!-- Sharing -->
            <div v-show="activeCategory === 'sharing'" class="doc-section">
              <h2>Sharing Files</h2>
              <p class="intro">Share your files securely with anyone, even if they don't have a GuardCloud account.</p>

              <article class="article">
                <h3>Creating a Share Link</h3>
                <ol>
                  <li>Find the file you want to share</li>
                  <li>Click the three-dot menu (⋮)</li>
                  <li>Select <strong>"Share"</strong></li>
                  <li>Configure share options (optional):</li>
                  <ul>
                    <li><strong>Password:</strong> Require a password to download</li>
                    <li><strong>Expiry:</strong> Set when the link expires</li>
                    <li><strong>Download limit:</strong> Maximum number of downloads</li>
                  </ul>
                  <li>Click <strong>"Create link"</strong></li>
                  <li>Copy the link and share it</li>
                </ol>
              </article>

              <article class="article">
                <h3>How Secure Sharing Works</h3>
                <p>When you create a share link:</p>
                <ol>
                  <li>The file is decrypted on your device</li>
                  <li>A special copy is created for sharing</li>
                  <li>Recipients can download without needing encryption keys</li>
                </ol>
                <div class="info-box">
                  <strong>Note:</strong> Shared files are stored separately from your encrypted files. The recipient downloads a decrypted version. Your original file remains fully encrypted.
                </div>
              </article>

              <article class="article">
                <h3>Managing Share Links</h3>
                <p>To view or delete existing share links:</p>
                <ol>
                  <li>Go to the file's share menu</li>
                  <li>View all active links</li>
                  <li>See download counts and expiry dates</li>
                  <li>Delete links you no longer need</li>
                </ol>
              </article>

              <article class="article">
                <h3>Best Practices for Sharing</h3>
                <ul>
                  <li>Always use password protection for sensitive files</li>
                  <li>Set expiration dates for temporary shares</li>
                  <li>Use download limits for confidential documents</li>
                  <li>Regularly review and clean up old share links</li>
                  <li>Share passwords through a different channel (text, call, etc.)</li>
                </ul>
              </article>
            </div>

            <!-- Security -->
            <div v-show="activeCategory === 'security'" class="doc-section">
              <h2>Security & Encryption</h2>
              <p class="intro">Understanding how GuardCloud protects your files with end-to-end encryption.</p>

              <article class="article">
                <h3>Zero-Knowledge Encryption</h3>
                <p>GuardCloud uses a zero-knowledge architecture, which means:</p>
                <ul>
                  <li>Your files are encrypted <strong>before</strong> leaving your device</li>
                  <li>Only you have access to your encryption keys</li>
                  <li>We cannot read your files, even if required by law</li>
                  <li>Your password never leaves your browser</li>
                </ul>
              </article>

              <article class="article">
                <h3>How Encryption Works</h3>
                <div class="steps-visual">
                  <div class="step">
                    <div class="step-num">1</div>
                    <div class="step-content">
                      <strong>Password → Master Key</strong>
                      <span>Your password is used with PBKDF2 to derive a master encryption key</span>
                    </div>
                  </div>
                  <div class="step">
                    <div class="step-num">2</div>
                    <div class="step-content">
                      <strong>File Key Generation</strong>
                      <span>Each file gets a unique random encryption key</span>
                    </div>
                  </div>
                  <div class="step">
                    <div class="step-num">3</div>
                    <div class="step-content">
                      <strong>File Encryption</strong>
                      <span>File is encrypted with AES-256-GCM using the file key</span>
                    </div>
                  </div>
                  <div class="step">
                    <div class="step-num">4</div>
                    <div class="step-content">
                      <strong>Key Wrapping</strong>
                      <span>File key is encrypted with your master key</span>
                    </div>
                  </div>
                  <div class="step">
                    <div class="step-num">5</div>
                    <div class="step-content">
                      <strong>Upload</strong>
                      <span>Encrypted file + wrapped key are uploaded to our servers</span>
                    </div>
                  </div>
                </div>
              </article>

              <article class="article">
                <h3>Keeping Your Account Secure</h3>
                <ul>
                  <li><strong>Use a strong password:</strong> At least 12 characters with mixed case, numbers, and symbols</li>
                  <li><strong>Never share your password:</strong> We will never ask for it</li>
                  <li><strong>Add recovery email:</strong> Helps recover access if you forget your password</li>
                  <li><strong>Check the encryption shield:</strong> Ensure it's green before uploading sensitive files</li>
                  <li><strong>Log out on shared devices:</strong> Always log out when using public computers</li>
                </ul>
              </article>

              <article class="article">
                <h3>Password Recovery</h3>
                <div class="warning-box">
                  <strong>⚠️ Critical:</strong> Due to zero-knowledge encryption, if you forget your password:
                  <ul>
                    <li><strong>With email:</strong> You can reset your password, but existing files cannot be decrypted</li>
                    <li><strong>Without email:</strong> Your account and files are permanently inaccessible</li>
                  </ul>
                  <strong>Store your password securely!</strong> Consider using a password manager.
                </div>
              </article>
            </div>

            <!-- Account -->
            <div v-show="activeCategory === 'account'" class="doc-section">
              <h2>Account Management</h2>
              <p class="intro">Manage your GuardCloud account settings and preferences.</p>

              <article class="article">
                <h3>Accessing Settings</h3>
                <ol>
                  <li>Click your profile icon in the top-right corner</li>
                  <li>Select <strong>"Settings"</strong> from the dropdown</li>
                </ol>
              </article>

              <article class="article">
                <h3>Profile Settings</h3>
                <ul>
                  <li><strong>Username:</strong> Your unique identifier (cannot be changed)</li>
                  <li><strong>Email:</strong> Add or update for account recovery</li>
                  <li><strong>Theme:</strong> Switch between light and dark mode</li>
                </ul>
              </article>

              <article class="article">
                <h3>Changing Your Password</h3>
                <ol>
                  <li>Go to Settings</li>
                  <li>Find "Security" section</li>
                  <li>Enter your current password</li>
                  <li>Enter and confirm new password</li>
                  <li>Click "Change password"</li>
                </ol>
                <div class="warning-box">
                  <strong>⚠️ Important:</strong> Changing your password will re-encrypt your encryption keys. You'll need to re-upload any files you want secured with the new key.
                </div>
              </article>

              <article class="article">
                <h3>Storage & Usage</h3>
                <p>View your storage usage in the sidebar or Settings:</p>
                <ul>
                  <li><strong>Free tier:</strong> 15 GB storage</li>
                  <li><strong>Pro tier:</strong> 100 GB storage</li>
                  <li><strong>Team tier:</strong> 1 TB per user</li>
                </ul>
                <p>To free up space, delete files you no longer need and empty your Trash.</p>
              </article>

              <article class="article">
                <h3>Deleting Your Account</h3>
                <p>To permanently delete your account:</p>
                <ol>
                  <li>Go to Settings</li>
                  <li>Scroll to "Danger Zone"</li>
                  <li>Click "Delete Account"</li>
                  <li>Confirm by entering your password</li>
                </ol>
                <div class="warning-box">
                  <strong>⚠️ Warning:</strong> Account deletion is permanent. All your files, folders, and share links will be permanently deleted and cannot be recovered.
                </div>
              </article>
            </div>

            <!-- Troubleshooting -->
            <div v-show="activeCategory === 'troubleshooting'" class="doc-section">
              <h2>Troubleshooting</h2>
              <p class="intro">Solutions to common issues you might encounter.</p>

              <article class="article">
                <h3>"Encryption inactive" Warning</h3>
                <p><strong>Problem:</strong> The encryption shield is gray and shows "Encryption inactive"</p>
                <p><strong>Cause:</strong> Your encryption key wasn't restored properly</p>
                <p><strong>Solution:</strong></p>
                <ol>
                  <li>Log out of your account</li>
                  <li>Close and reopen your browser</li>
                  <li>Log back in with your password</li>
                  <li>Verify the green shield appears</li>
                </ol>
              </article>

              <article class="article">
                <h3>Upload Fails or Hangs</h3>
                <p><strong>Possible causes and solutions:</strong></p>
                <ul>
                  <li><strong>File too large:</strong> Maximum file size is 100MB</li>
                  <li><strong>Storage limit reached:</strong> Delete files or upgrade your plan</li>
                  <li><strong>Network issues:</strong> Check your internet connection</li>
                  <li><strong>Browser issues:</strong> Try refreshing the page or using a different browser</li>
                </ul>
              </article>

              <article class="article">
                <h3>Can't Download or Preview Files</h3>
                <p><strong>Problem:</strong> Files won't download or show "decryption failed"</p>
                <p><strong>Solution:</strong></p>
                <ol>
                  <li>Ensure encryption is active (green shield)</li>
                  <li>Try logging out and back in</li>
                  <li>If using a new browser/device, you may need to log in again</li>
                </ol>
                <div class="info-box">
                  <strong>Note:</strong> Files encrypted with a previous password cannot be decrypted with a new password. If you changed your password, previously uploaded files may be inaccessible.
                </div>
              </article>

              <article class="article">
                <h3>Share Link Not Working</h3>
                <p><strong>Common issues:</strong></p>
                <ul>
                  <li><strong>Link expired:</strong> Create a new share link</li>
                  <li><strong>Download limit reached:</strong> Create a new link with higher limit</li>
                  <li><strong>Wrong password:</strong> Double-check the share password</li>
                  <li><strong>File deleted:</strong> The original file may have been deleted</li>
                </ul>
              </article>

              <article class="article">
                <h3>Forgot Password</h3>
                <p><strong>With recovery email:</strong></p>
                <ol>
                  <li>Click "Forgot password" on the login page</li>
                  <li>Enter your email address</li>
                  <li>Check your email for reset instructions</li>
                </ol>
                <p><strong>Without recovery email:</strong></p>
                <p>Unfortunately, due to zero-knowledge encryption, we cannot recover your account without your password. Your encrypted files are permanently inaccessible.</p>
              </article>

              <article class="article">
                <h3>Still Need Help?</h3>
                <p>If you're experiencing an issue not covered here:</p>
                <ul>
                  <li>Email us at <a href="mailto:support@guardcloud.io">support@guardcloud.io</a></li>
                  <li>Visit our <NuxtLink to="/contact">contact page</NuxtLink></li>
                  <li>Response time: Within 24 hours</li>
                </ul>
              </article>
            </div>
          </main>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container footer__inner">
        <div class="footer__brand">
          <img src="~/assets/logos/securecloud.png" alt="GuardCloud" class="footer-img" />
          <span>GuardCloud</span>
        </div>
        <nav class="footer__links">
          <NuxtLink to="/">Home</NuxtLink>
          <NuxtLink to="/docs">Documentation</NuxtLink>
          <NuxtLink to="/contact">Contact</NuxtLink>
          <NuxtLink to="/privacy">Privacy</NuxtLink>
          <NuxtLink to="/terms">Terms</NuxtLink>
        </nav>
        <p class="footer__copy">© 2025 GuardCloud. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.docs-page {
  min-height: 100vh;
  background: var(--gc-bg-secondary);
  color: var(--gc-text-primary);
}

.container {
  width: min(1200px, 92vw);
  margin-inline: auto;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.btn-primary {
  background: var(--gc-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--gc-primary-hover);
}

.btn-ghost {
  background: transparent;
  color: var(--gc-text-primary);
  border-color: var(--gc-border);
}

.btn-ghost:hover {
  background: var(--gc-bg-tertiary);
}

.theme-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--gc-border);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--gc-text-secondary);
}

.theme-btn svg {
  width: 20px;
  height: 20px;
}

.theme-btn:hover {
  background: var(--gc-bg-tertiary);
  color: var(--gc-text-primary);
}

/* Nav */
.nav {
  background: var(--gc-bg-primary);
  border-bottom: 1px solid var(--gc-border);
}

.nav__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 18px;
  color: var(--gc-text-primary);
  text-decoration: none;
}

.brand-img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.nav__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Hero */
.hero {
  padding: clamp(40px, 8vw, 80px) 0 clamp(24px, 4vw, 40px);
  text-align: center;
}

.hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(99, 102, 241, 0.1);
  color: var(--gc-primary);
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 16px;
}

.hero__badge svg {
  width: 16px;
  height: 16px;
}

.hero h1 {
  font-size: clamp(32px, 5vw, 48px);
  font-weight: 800;
  margin: 0 0 12px;
  color: var(--gc-text-primary);
}

.hero p {
  font-size: 18px;
  color: var(--gc-text-secondary);
  margin: 0 0 24px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

/* Search */
.search-box {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--gc-bg-primary);
  border: 1px solid var(--gc-border);
  border-radius: 12px;
  padding: 12px 16px;
  max-width: 500px;
  margin: 0 auto;
  transition: all 0.2s;
}

.search-box:focus-within {
  border-color: var(--gc-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.search-box svg {
  width: 20px;
  height: 20px;
  color: var(--gc-text-secondary);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-size: 15px;
  color: var(--gc-text-primary);
}

.search-input::placeholder {
  color: var(--gc-text-secondary);
}

/* Quick Links */
.quick-links {
  padding: 0 0 32px;
}

.quick-links__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  max-width: 600px;
  margin: 0 auto;
}

.quick-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px;
  background: var(--gc-bg-primary);
  border: 1px solid var(--gc-border);
  border-radius: 16px;
  text-decoration: none;
  color: var(--gc-text-primary);
  transition: all 0.2s;
}

.quick-link:hover {
  border-color: var(--gc-primary);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px -8px rgba(0, 0, 0, 0.1);
}

.quick-link__icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 12px;
  color: var(--gc-primary);
}

.quick-link__icon svg {
  width: 24px;
  height: 24px;
}

.quick-link span {
  font-size: 14px;
  font-weight: 600;
}

/* Content */
.content {
  padding-bottom: clamp(48px, 8vw, 96px);
}

.content__wrapper {
  display: grid;
  gap: 24px;
}

@media (min-width: 900px) {
  .content__wrapper {
    grid-template-columns: 220px 1fr;
    gap: 32px;
  }
}

/* Sidebar */
.sidebar {
  position: sticky;
  top: 100px;
  align-self: start;
  background: var(--gc-bg-primary);
  border: 1px solid var(--gc-border);
  border-radius: 16px;
  padding: 16px;
}

.sidebar nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 14px;
  background: transparent;
  border: none;
  border-radius: 10px;
  color: var(--gc-text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
}

.sidebar-item svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.sidebar-item:hover {
  background: var(--gc-bg-secondary);
  color: var(--gc-text-primary);
}

.sidebar-item.active {
  background: rgba(99, 102, 241, 0.1);
  color: var(--gc-primary);
}

/* Main Content */
.main-content {
  background: var(--gc-bg-primary);
  border: 1px solid var(--gc-border);
  border-radius: 20px;
  padding: clamp(24px, 4vw, 40px);
}

.doc-section h2 {
  font-size: 28px;
  font-weight: 700;
  color: var(--gc-text-primary);
  margin: 0 0 12px;
}

.doc-section .intro {
  font-size: 16px;
  color: var(--gc-text-secondary);
  margin: 0 0 32px;
  line-height: 1.6;
}

/* Article */
.article {
  margin-bottom: 40px;
  padding-bottom: 40px;
  border-bottom: 1px solid var(--gc-border);
}

.article:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.article h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--gc-text-primary);
  margin: 0 0 16px;
}

.article p {
  font-size: 15px;
  line-height: 1.7;
  color: var(--gc-text-secondary);
  margin: 0 0 16px;
}

.article ul,
.article ol {
  margin: 0 0 16px;
  padding-left: 24px;
}

.article li {
  font-size: 15px;
  line-height: 1.7;
  color: var(--gc-text-secondary);
  margin-bottom: 8px;
}

.article a {
  color: var(--gc-primary);
  text-decoration: none;
}

.article a:hover {
  text-decoration: underline;
}

/* Tip Box */
.tip-box {
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 12px;
  padding: 16px 20px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--gc-text-primary);
  margin: 16px 0;
}

.tip-box strong {
  color: #10b981;
}

/* Info Box */
.info-box {
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 12px;
  padding: 16px 20px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--gc-text-primary);
  margin: 16px 0;
}

.info-box strong {
  color: var(--gc-primary);
}

/* Warning Box */
.warning-box {
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 12px;
  padding: 16px 20px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--gc-text-primary);
  margin: 16px 0;
}

.warning-box strong {
  color: #f59e0b;
}

.warning-box ul {
  margin: 8px 0;
  padding-left: 20px;
}

.warning-box li {
  margin-bottom: 4px;
}

/* Steps Visual */
.steps-visual {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 20px 0;
}

.step {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.step-num {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gc-primary);
  color: white;
  border-radius: 50%;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.step-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 4px;
}

.step-content strong {
  color: var(--gc-text-primary);
  font-size: 15px;
}

.step-content span {
  color: var(--gc-text-secondary);
  font-size: 14px;
}

/* Footer */
.footer {
  padding: 32px 0;
  border-top: 1px solid var(--gc-border);
  background: var(--gc-bg-primary);
}

.footer__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}

@media (min-width: 768px) {
  .footer__inner {
    flex-direction: row;
    justify-content: space-between;
    text-align: left;
  }
}

.footer__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  color: var(--gc-text-primary);
}

.footer-img {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.footer__links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 24px;
}

.footer__links a {
  color: var(--gc-text-secondary);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.15s;
}

.footer__links a:hover {
  color: var(--gc-text-primary);
}

.footer__copy {
  font-size: 14px;
  color: var(--gc-text-secondary);
  margin: 0;
}
</style>
