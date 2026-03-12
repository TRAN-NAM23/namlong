// Facebook SDK utilities
export const FACEBOOK_APP_ID = '1201802201625328';
export const FACEBOOK_VERSION = 'v20.0';

/**
 * Check if Facebook SDK is loaded and available
 */
export const isFacebookSDKLoaded = () => {
    return !!(window.FB && window.FB.init);
};

/**
 * Wait for Facebook SDK to load
 */
export const waitForFacebookSDK = (timeout = 5000) => {
    return new Promise((resolve, reject) => {
        if (isFacebookSDKLoaded()) {
            resolve(window.FB);
            return;
        }

        const startTime = Date.now();
        const checkSDK = () => {
            if (isFacebookSDKLoaded()) {
                resolve(window.FB);
                return;
            }

            if (Date.now() - startTime > timeout) {
                reject(new Error('Facebook SDK failed to load within timeout'));
                return;
            }

            setTimeout(checkSDK, 100);
        };

        checkSDK();
    });
};

/**
 * Initialize Facebook SDK if not already initialized
 */
export const initializeFacebookSDK = () => {
    if (!isFacebookSDKLoaded()) {
        console.log('Initializing Facebook SDK...');

        window.fbAsyncInit = function() {
            window.FB.init({
                appId: FACEBOOK_APP_ID,
                cookie: true,
                xfbml: true,
                version: FACEBOOK_VERSION
            });

            console.log('Facebook SDK initialized successfully');
        };

        // Load SDK script if not already loaded
        if (!document.getElementById('facebook-jssdk')) {
            const script = document.createElement('script');
            script.id = 'facebook-jssdk';
            script.src = `https://connect.facebook.net/en_US/sdk.js`;
            document.body.appendChild(script);
        }
    }
};

/**
 * Generate Facebook OAuth URL for redirect flow
 */
export const generateFacebookOAuthURL = (redirectUri = window.location.origin) => {
    const params = new URLSearchParams({
        client_id: FACEBOOK_APP_ID,
        redirect_uri: redirectUri,
        scope: 'email,public_profile',
        response_type: 'token'
    });

    return `https://www.facebook.com/${FACEBOOK_VERSION}/dialog/oauth?${params.toString()}`;
};

/**
 * Parse Facebook access token from URL hash
 */
export const parseFacebookTokenFromHash = (hash) => {
    if (!hash || !hash.includes('access_token=')) {
        return null;
    }

    const params = new URLSearchParams(hash.substring(1));
    return params.get('access_token');
};

/**
 * Get Facebook user info using access token
 */
export const getFacebookUserInfo = async (accessToken) => {
    const response = await fetch(
        `https://graph.facebook.com/${FACEBOOK_VERSION}/me?fields=id,name,email,picture&access_token=${accessToken}`
    );

    if (!response.ok) {
        throw new Error('Failed to get Facebook user info');
    }

    return response.json();
};

/**
 * Login with Facebook using SDK popup
 */
export const loginWithFacebook = () => {
    return new Promise((resolve, reject) => {
        if (!isFacebookSDKLoaded()) {
            console.error('Facebook SDK is not loaded');
            reject(new Error('Facebook SDK not loaded'));
            return;
        }

        console.log('=== Calling FB.login ===');
        window.FB.login((response) => {
            console.log('=== FB.login Callback ===');
            console.log('Response status:', response.status);
            console.log('Full response:', response);
            
            if (response.authResponse) {
                console.log('✓ Facebook login success');
                resolve({
                    accessToken: response.authResponse.accessToken,
                    userID: response.authResponse.userID,
                    expiresIn: response.authResponse.expiresIn
                });
            } else {
                console.log('✗ Facebook login failed or cancelled');
                console.log('Status:', response.status);
                reject(new Error('User cancelled login or did not fully authorize.'));
            }
        }, { scope: 'email,public_profile' });
    });
};