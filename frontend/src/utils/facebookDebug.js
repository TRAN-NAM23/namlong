/* global FB */

// Test Facebook OAuth flow
const testFacebookOAuth = () => {
    // Test OAuth URL generation
    const redirectUri = `${window.location.origin}`;
    const oauthUrl = `https://www.facebook.com/v20.0/dialog/oauth?client_id=1201802201625328&redirect_uri=${encodeURIComponent(redirectUri)}&scope=email,public_profile&response_type=token`;

    console.log('Generated OAuth URL:', oauthUrl);

    // Test if we can open it
    const testWindow = window.open(oauthUrl, '_blank', 'width=600,height=400');
    if (!testWindow) {
        console.error('Popup blocked! Please allow popups for this site.');
    }
};

// Test backend connection
const testBackendConnection = async () => {
    try {
        const response = await fetch('/api/account/facebook-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                accessToken: 'test_token',
                userID: 'test_user',
                name: 'Test User',
                email: 'test@example.com'
            })
        });

        const data = await response.json();
        console.log('Backend response:', data);
    } catch (error) {
        console.error('Backend connection error:', error);
    }
};

// Test Facebook SDK
const testFacebookSDK = () => {
    if (window.FB) {
        console.log('Facebook SDK loaded:', window.FB);
        FB.getLoginStatus((response) => {
            console.log('FB Login status:', response);
        });
    } else {
        console.error('Facebook SDK not loaded!');
    }
};

// Run all tests
window.testFacebook = {
    oauth: testFacebookOAuth,
    backend: testBackendConnection,
    sdk: testFacebookSDK
};

console.log('Facebook debug functions available:');
console.log('- testFacebook.oauth() - Test OAuth URL');
console.log('- testFacebook.backend() - Test backend connection');
console.log('- testFacebook.sdk() - Test Facebook SDK');