// PWA Installation Handler with Debug Logging
let deferredPrompt;
const installButton = document.getElementById('install-button');

console.log('🚀 PWA Install Script Loaded');
console.log('Install Button Element:', installButton);
console.log('Manifest Link:', document.querySelector('link[rel="manifest"]'));
console.log('Service Worker Support:', 'serviceWorker' in navigator);

// Listen for the beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('✅ beforeinstallprompt event triggered!');
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event for later use
  deferredPrompt = e;
  console.log('💾 Install prompt saved');
  // Show the install button
  if (installButton) {
    installButton.style.display = 'block';
    console.log('✅ Install button is now visible!');
  } else {
    console.error('❌ Install button element not found!');
  }
});

// Handle install button click
if (installButton) {
  installButton.addEventListener('click', async () => {
    console.log('🔘 Install button clicked');
    if (!deferredPrompt) {
      console.error('❌ No deferredPrompt available!');
      return;
    }
    // Show the install prompt
    deferredPrompt.prompt();
    console.log('📱 Installation prompt displayed');
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`✅ User response to the install prompt: ${outcome}`);
    // Clear the deferredPrompt for re-use
    deferredPrompt = null;
    // Hide the install button
    if (installButton) {
      installButton.style.display = 'none';
    }
  });
} else {
  console.error('❌ Install button not found in DOM!');
}

// Handle app installed event
window.addEventListener('appinstalled', () => {
  console.log('🎉 PWA was successfully installed!');
  if (installButton) {
    installButton.style.display = 'none';
  }
});

// Register service worker with enhanced logging
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    console.log('📥 Attempting to register Service Worker...');
    navigator.serviceWorker.register('./service-worker.js')
      .then((registration) => {
        console.log('✅ ServiceWorker registration successful!');
        console.log('   Scope:', registration.scope);
        console.log('   Active:', registration.active);
        console.log('   Installing:', registration.installing);
        console.log('   Waiting:', registration.waiting);
      })
      .catch((error) => {
        console.error('❌ ServiceWorker registration failed:');
        console.error('   Error:', error.message);
        console.error('   Full Error:', error);
      });
  });
} else {
  console.warn('⚠️ Service Worker not supported in this browser');
}

// Check if app is already installed (iOS)
window.addEventListener('load', () => {
  const isInStandaloneMode = () => (window.navigator.standalone === true) || 
                                   (window.matchMedia('(display-mode: standalone)').matches);
  
  if (isInStandaloneMode()) {
    console.log('✅ App is running in standalone mode!');
    if (installButton) {
      installButton.style.display = 'none';
    }
  }
});

// Additional debugging: Check manifest
fetch('./manifest.json')
  .then(response => {
    if (response.ok) {
      console.log('✅ manifest.json is accessible');
      return response.json();
    } else {
      console.error('❌ manifest.json not found (status:', response.status, ')');
    }
  })
  .then(manifest => {
    if (manifest) {
      console.log('📋 Manifest loaded:', manifest);
    }
  })
  .catch(error => {
    console.error('❌ Error loading manifest:', error);
  });

console.log('📊 Browser Info:', {
  userAgent: navigator.userAgent,
  platform: navigator.platform,
  online: navigator.onLine,
  language: navigator.language,
});
