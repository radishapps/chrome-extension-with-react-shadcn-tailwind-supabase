import { supabase } from '@/lib/supabase'

function updateStatus(message: string) {
  const statusEl = document.getElementById('status')
  if (statusEl) statusEl.textContent = message
}

function showError(message: string) {
  const errorEl = document.getElementById('error')
  if (errorEl) errorEl.textContent = message
  updateStatus('Sign in failed')
}

async function checkSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

async function handleSignInCallback() {
  try {
    const session = await checkSession()
    if (session) {
      updateStatus('Successfully signed in!')
      // Notify background script of successful sign in
      chrome.runtime.sendMessage({ type: 'sign-in-success' })
      // Close the auth window after a brief delay
      setTimeout(() => window.close(), 1000)
      return true
    }
    return false
  } catch (err) {
    console.error('Session check error:', err)
    return false
  }
}

async function signInWithGoogle() {
  try {
    // Check if we're already signed in or if this is a callback
    if (await handleSignInCallback()) {
      return
    }

    updateStatus('Starting Google Sign In...')
    console.log('Starting Google OAuth flow...')

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: chrome.runtime.getURL('google-auth.html'),
        skipBrowserRedirect: true // Prevent immediate redirect
      }
    });

    console.log('OAuth response:', { data, error })

    if (error) {
      console.error('Error:', error.message)
      showError(error.message)
      return
    }

    if (data?.url) {
      updateStatus('Redirecting to Google...')
      // Small delay to show the status message
      await new Promise(resolve => setTimeout(resolve, 500))
      window.location.href = data.url
    } else {
      showError('No OAuth URL received')
    }
  } catch (err) {
    console.error('OAuth error:', err)
    showError(err instanceof Error ? err.message : 'An unexpected error occurred')
  }
}

// Start the sign-in process when the page is fully loaded
document.addEventListener('DOMContentLoaded', signInWithGoogle) 