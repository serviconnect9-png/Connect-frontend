/* ============================================
   CONNECT APP - Complete Production JavaScript
   NO FIREWALL - App visible immediately
   Login only required for protected actions
   Apple Sign-In Added
   ============================================ */

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDRlGps4_dqRBJ2SYmbeXtdDRGTIvYQ510",
    authDomain: "serviconnect-446dd.firebaseapp.com",
    projectId: "serviconnect-446dd",
    storageBucket: "serviconnect-446dd.firebasestorage.app",
    messagingSenderId: "102078290806",
    appId: "1:102078290806:web:88a6e1f9908100a3253857"
};

const CLOUDINARY_CONFIG = {
    cloudName: 'serviconnect',
    uploadPreset: 'connect',
    apiEndpoint: 'https://api.cloudinary.com/v1_1/serviconnect/image/upload'
};

const BASE_URL = 'https://connect-backend--serviconnect9.replit.app';
const FLW_PUBLIC_KEY = 'FLWPUBK-b5d5cb8f23411dc9c84afd34c839c15b-X';
const CUSTOMER_SERVICE_EMAIL = 'serviconnect9@gmail.com';

firebase.initializeApp(FIREBASE_CONFIG);
const auth = firebase.auth();
const db = firebase.firestore();

db.enablePersistence({ synchronizeTabs: true }).catch(function(err) {
    console.warn('Persistence failed:', err.code);
});

const STATE = {
    user: null,
    userData: null,
    page: 'home',
    country: 'GB',
    cart: [],
    selectedTicket: null,
    qrScanner: null,
    currentStoreId: null,
    currentServiceId: null,
    currentProductId: null,
    currentEventId: null,
    onboardingStep: 0,
    productGalleryIndex: 0,
    plansVisible: false,
    isGuest: true
};

const COUNTRIES = [
    { code: 'GB', name: 'United Kingdom', currency: 'GBP', symbol: '£', rate: 0.85, minDeposit: 5, flwCurrency: 'GBP' },
    { code: 'US', name: 'United States', currency: 'USD', symbol: '$', rate: 1.08, minDeposit: 5, flwCurrency: 'USD' },
    { code: 'NG', name: 'Nigeria', currency: 'NGN', symbol: '₦', rate: 1650, minDeposit: 500, flwCurrency: 'NGN' },
    { code: 'GH', name: 'Ghana', currency: 'GHS', symbol: 'GH₵', rate: 16.5, minDeposit: 5, flwCurrency: 'GHS' },
    { code: 'KE', name: 'Kenya', currency: 'KES', symbol: 'KSh', rate: 138, minDeposit: 5, flwCurrency: 'KES' },
    { code: 'ZA', name: 'South Africa', currency: 'ZAR', symbol: 'R', rate: 20, minDeposit: 5, flwCurrency: 'ZAR' },
    { code: 'DE', name: 'Germany', currency: 'EUR', symbol: '€', rate: 1, minDeposit: 5, flwCurrency: 'EUR' },
    { code: 'FR', name: 'France', currency: 'EUR', symbol: '€', rate: 1, minDeposit: 5, flwCurrency: 'EUR' },
    { code: 'AE', name: 'UAE', currency: 'AED', symbol: 'د.إ', rate: 3.95, minDeposit: 5, flwCurrency: 'AED' },
    { code: 'CN', name: 'China', currency: 'CNY', symbol: '¥', rate: 7.8, minDeposit: 5, flwCurrency: 'CNY' },
    { code: 'JP', name: 'Japan', currency: 'JPY', symbol: '¥', rate: 162, minDeposit: 5, flwCurrency: 'JPY' },
    { code: 'BR', name: 'Brazil', currency: 'BRL', symbol: 'R$', rate: 5.3, minDeposit: 5, flwCurrency: 'BRL' },
    { code: 'IN', name: 'India', currency: 'INR', symbol: '₹', rate: 89, minDeposit: 5, flwCurrency: 'INR' },
    { code: 'CA', name: 'Canada', currency: 'CAD', symbol: 'C$', rate: 1.46, minDeposit: 5, flwCurrency: 'CAD' },
    { code: 'AU', name: 'Australia', currency: 'AUD', symbol: 'A$', rate: 1.64, minDeposit: 5, flwCurrency: 'AUD' }
];

const SERVICE_CATEGORIES = [
    'DJ Services', 'Photography', 'Videography', 'Makeup Artistry', 'Event Planning',
    'Catering', 'Decor Design', 'Graphic Design', 'Web Development', 'Mobile App Dev',
    'Digital Marketing', 'Content Writing', 'Hair Styling', 'Nail Art', 'Fashion Design',
    'Tailoring', 'Fitness Training', 'Yoga Instruction', 'Life Coaching', 'Tutoring',
    'Security Services', 'Cleaning Services', 'Moving Services', 'Delivery', 'Auto Repair',
    'Computer Repair', 'Plumbing', 'Electrical Work', 'Carpentry', 'Painting',
    'Landscaping', 'Solar Installation', 'Phone Repair', 'Baking', 'Bartending',
    'Interior Design', 'Architecture', 'Legal Services', 'Accounting', 'Real Estate',
    'Insurance', 'Tax Preparation', 'Financial Planning', 'Other'
];

const SHOP_CATEGORIES = [
    'Electronics', 'Fashion', 'Beauty', 'Home & Garden', 'Sports', 'Books',
    'Food & Drinks', 'Digital Products', 'Toys', 'Automotive', 'Health',
    'Jewelry', 'Furniture', 'Pet Supplies', 'Office Supplies', 'Tools', 'Other'
];

// ============================================
// APP INITIALIZATION - NO FIREWALL
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('CONNECT App Starting - No Firewall Mode');
    loadCartFromStorage();
    // Show app immediately, check auth in background
    setTimeout(function() {
        document.getElementById('splashScreen').classList.add('hidden');
        // Skip onboarding if already seen
        if (!localStorage.getItem('cn_onboarded')) {
            showOnboardingScreen();
        } else {
            // Show main app immediately
            showMainApp();
            navigateTo('home');
        }
        // Check auth in background
        checkAuthState();
    }, 2200);
});

function checkAuthState() {
    auth.onAuthStateChanged(async function(user) {
        if (user) {
            STATE.user = user;
            STATE.isGuest = false;
            console.log('User authenticated:', user.uid);
            try {
                var doc = await db.collection('users').doc(user.uid).get();
                if (doc.exists) {
                    STATE.userData = doc.data();
                    STATE.userData._id = doc.id;
                    if (STATE.userData.country) {
                        var c = findCountry(STATE.userData.country);
                        if (c) STATE.country = c.code;
                    }
                    updateHeaderUI();
                    listenNotifications();
                    checkPlanExpiry();
                    checkEscrowOrders();
                    console.log('User data loaded:', STATE.userData.fullName);
                }
                // If on auth screen, move to app
                if (!document.getElementById('mainApp').classList.contains('hidden') === false) {
                    showMainApp();
                    navigateTo('home');
                }
                // Refresh current page
                if (STATE.page) navigateTo(STATE.page);
            } catch (e) {
                console.error('Error loading user data:', e);
            }
        } else {
            STATE.user = null;
            STATE.userData = null;
            STATE.isGuest = true;
            console.log('Guest mode - browsing without login');
            // If main app is visible, refresh to show guest view
            if (!document.getElementById('mainApp').classList.contains('hidden')) {
                if (STATE.page) navigateTo(STATE.page);
            }
        }
    });
}

// ============================================
// LOGIN CHECK HELPER - Use before protected actions
// ============================================
function requireLogin(action) {
    if (!STATE.user) {
        toast('Please sign in to continue', 'info');
        showAuthScreen();
        showLoginForm();
        return false;
    }
    return true;
}

// ============================================
// ESCROW AUTO-RETURN CHECK
// ============================================
async function checkEscrowOrders() {
    if (!STATE.user) return;
    try {
        var threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
        var snap = await db.collection('orders')
            .where('userId', '==', STATE.user.uid)
            .where('status', '==', 'pending')
            .where('escrow', '==', true)
            .get();
        
        snap.forEach(async function(d) {
            var o = d.data();
            var created = o.createdAt ? o.createdAt.toDate() : new Date();
            if (created < threeDaysAgo) {
                await db.collection('orders').doc(d.id).update({
                    status: 'refunded',
                    refundedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    refundReason: 'Auto-refund: 3 days without delivery confirmation'
                });
                await db.collection('users').doc(STATE.user.uid).update({
                    balance: firebase.firestore.FieldValue.increment(o.total || 0)
                });
                STATE.userData.balance = (STATE.userData.balance || 0) + (o.total || 0);
                await db.collection('transactions').add({
                    userId: STATE.user.uid, type: 'refund', amount: o.total || 0,
                    itemName: o.itemName, orderId: d.id, status: 'completed',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                await db.collection('notifications').add({
                    userId: STATE.user.uid,
                    message: '💰 Auto-refund: ' + formatBalance(o.total || 0) + ' returned for "' + o.itemName + '"',
                    read: false, createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                if (o.sellerId) {
                    await db.collection('notifications').add({
                        userId: o.sellerId,
                        message: '⚠️ Order auto-refunded: "' + o.itemName + '" - 3 days without delivery',
                        read: false, createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
            }
        });
    } catch (e) { console.error('Escrow check error:', e); }
}

// ============================================
// HELPER FUNCTIONS
// ============================================
function findCountry(code) {
    for (var i = 0; i < COUNTRIES.length; i++) {
        if (COUNTRIES[i].code === code) return COUNTRIES[i];
    }
    return COUNTRIES[0];
}

function getUserCountry() {
    if (STATE.userData && STATE.userData.country) return findCountry(STATE.userData.country);
    return COUNTRIES[0];
}

function getUserCurrency() { return getUserCountry().currency; }
function getUserSymbol() { return getUserCountry().symbol; }
function getUserRate() { return getUserCountry().rate; }
function getMinDeposit() { return getUserCountry().minDeposit; }
function getFlwCurrency() { return getUserCountry().flwCurrency; }

function formatBalance(eurAmount) {
    var c = getUserCountry();
    var converted = eurAmount * c.rate;
    if (converted >= 1000000) return c.symbol + (converted / 1000000).toFixed(1) + 'M';
    if (converted >= 1000) return c.symbol + (converted / 1000).toFixed(1) + 'K';
    return c.symbol + converted.toFixed(2);
}

function getFlagEmoji(code) {
    var flags = {
        'GB': '🇬🇧', 'US': '🇺🇸', 'NG': '🇳🇬', 'GH': '🇬🇭', 'KE': '🇰🇪',
        'ZA': '🇿🇦', 'DE': '🇩🇪', 'FR': '🇫🇷', 'AE': '🇦🇪', 'CN': '🇨🇳',
        'JP': '🇯🇵', 'BR': '🇧🇷', 'IN': '🇮🇳', 'CA': '🇨🇦', 'AU': '🇦🇺'
    };
    return flags[code] || '🌍';
}

function showMainApp() {
    document.getElementById('onboardingScreen').classList.add('hidden');
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
}

function showAuthScreen() {
    document.getElementById('onboardingScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.add('hidden');
    document.getElementById('authScreen').classList.remove('hidden');
}

function showOnboardingScreen() {
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.add('hidden');
    document.getElementById('onboardingScreen').classList.remove('hidden');
}

function updateHeaderUI() {
    var av = document.getElementById('headerAvatarImg');
    if (av && STATE.userData && STATE.userData.profileImage) {
        av.src = STATE.userData.profileImage;
    }
}

function loadCartFromStorage() {
    try {
        var c = localStorage.getItem('cn_cart');
        if (c) STATE.cart = JSON.parse(c);
    } catch (e) { STATE.cart = []; }
}

function saveCartToStorage() {
    localStorage.setItem('cn_cart', JSON.stringify(STATE.cart));
}

function updateCartBadge() {
    var badge = document.getElementById('cartBadge');
    if (badge) {
        badge.textContent = STATE.cart.length;
        badge.classList.toggle('hidden', STATE.cart.length === 0);
    }
}

function showLoginAd() {
    if (sessionStorage.getItem('cn_login_ad')) return;
    sessionStorage.setItem('cn_login_ad', '1');
    setTimeout(function() {
        var content = document.getElementById('adOverlayContent');
        if (content) {
            content.innerHTML = '<img src="https://via.placeholder.com/350x180/8b2fc9/ffffff?text=CONNECT" style="width:100%;border-radius:16px 16px 0 0;"><div class="ad-text"><h3>Welcome to CONNECT</h3><p>Discover services, events & more!</p></div>';
            document.getElementById('adOverlay').classList.remove('hidden');
        }
    }, 1500);
}

async function checkPlanExpiry() {
    if (!STATE.userData || !STATE.userData.subscription || !STATE.userData.subscriptionDate) return;
    var subDate = STATE.userData.subscriptionDate.toDate();
    var expiry = new Date(subDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    if (new Date() > expiry) {
        var deducted = await deductPlanFee();
        if (!deducted) {
            await db.collection('users').doc(STATE.user.uid).update({
                subscription: null, subscriptionDate: null
            });
            STATE.userData.subscription = null;
            await db.collection('notifications').add({
                userId: STATE.user.uid,
                message: 'Your plan has expired. Subscribe to continue using premium features.',
                read: false, createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    }
}

async function deductPlanFee() {
    var prices = { starter: 1, business: 5, elite: 15 };
    var amt = prices[STATE.userData.subscription] || 0;
    var sources = ['balance', 'storeBalance', 'affiliateBalance', 'referralBalance'];
    for (var i = 0; i < sources.length; i++) {
        var s = sources[i];
        var bal = STATE.userData[s] || 0;
        if (bal >= amt) {
            await db.collection('users').doc(STATE.user.uid).update({
                [s]: firebase.firestore.FieldValue.increment(-amt),
                subscriptionDate: firebase.firestore.FieldValue.serverTimestamp()
            });
            STATE.userData[s] -= amt;
            await db.collection('notifications').add({
                userId: STATE.user.uid,
                message: formatBalance(amt) + ' deducted from ' + s + ' for plan renewal.',
                read: false, createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return true;
        }
    }
    return false;
}

// ============================================
// ONBOARDING
// ============================================
function nextOnboarding() {
    var slides = document.querySelectorAll('.onboarding-slide');
    STATE.onboardingStep++;
    if (STATE.onboardingStep >= slides.length) {
        skipOnboarding();
        return;
    }
    slides.forEach(function(s, i) { s.classList.toggle('active', i === STATE.onboardingStep); });
    document.querySelectorAll('.onboarding-dot').forEach(function(d, i) { d.classList.toggle('active', i === STATE.onboardingStep); });
    document.getElementById('onboardingNext').textContent = STATE.onboardingStep === slides.length - 1 ? 'Get Started' : 'Next';
}

function skipOnboarding() {
    localStorage.setItem('cn_onboarded', '1');
    showMainApp();
    navigateTo('home');
}

// ============================================
// AUTH FORM SWITCHING
// ============================================
function showLoginForm() {
    document.getElementById('loginFormWrapper').classList.remove('hidden');
    document.getElementById('registerFormWrapper').classList.add('hidden');
    document.getElementById('forgotPasswordWrapper').classList.add('hidden');
}

function showRegisterForm() {
    document.getElementById('loginFormWrapper').classList.add('hidden');
    document.getElementById('registerFormWrapper').classList.remove('hidden');
    document.getElementById('forgotPasswordWrapper').classList.add('hidden');
    populateServiceCategories();
}

function showForgotPasswordForm() {
    document.getElementById('loginFormWrapper').classList.add('hidden');
    document.getElementById('registerFormWrapper').classList.add('hidden');
    document.getElementById('forgotPasswordWrapper').classList.remove('hidden');
}

function populateServiceCategories() {
    var sel = document.getElementById('regServiceCategory');
    if (!sel) return;
    sel.innerHTML = '<option value="">Select category</option>';
    for (var i = 0; i < SERVICE_CATEGORIES.length; i++) {
        sel.innerHTML += '<option value="' + SERVICE_CATEGORIES[i] + '">' + SERVICE_CATEGORIES[i] + '</option>';
    }
}

function toggleSvcCat() {
    var type = document.getElementById('regAccountType').value;
    document.getElementById('serviceCategoryWrapper').classList.toggle('hidden', type !== 'service_provider' && type !== 'freelancer');
}

// ============================================
// COUNTRY & STATE SEARCH
// ============================================
function filterCountryDropdown() {
    var input = document.getElementById('regCountrySearch');
    var dd = document.getElementById('countryDropdown');
    if (!input || !dd) return;
    var f = input.value.toLowerCase();
    var filtered = f ? COUNTRIES.filter(function(c) { return c.name.toLowerCase().indexOf(f) !== -1; }) : COUNTRIES;
    dd.innerHTML = '';
    for (var i = 0; i < Math.min(filtered.length, 30); i++) {
        var c = filtered[i];
        dd.innerHTML += '<div class="search-dropdown-item" onclick="selectCountry(\'' + c.code + '\',\'' + c.name.replace(/'/g, "\\'") + '\')">' + c.name + ' (' + c.code + ')</div>';
    }
    dd.classList.add('active');
}

function selectCountry(code, name) {
    document.getElementById('regCountrySearch').value = name;
    document.getElementById('regCountryCode').value = code;
    document.getElementById('countryDropdown').classList.remove('active');
    document.getElementById('regStateSearch').disabled = false;
    document.getElementById('regStateSearch').value = '';
}

function filterStateDropdown() {
    var dd = document.getElementById('stateDropdown');
    if (!dd) return;
    dd.innerHTML = '<div class="search-dropdown-item" onclick="selectState(\'Default Region\')">Default Region</div>';
    dd.classList.add('active');
}

function selectState(state) {
    document.getElementById('regStateSearch').value = state;
    document.getElementById('regStateValue').value = state;
    document.getElementById('stateDropdown').classList.remove('active');
}

function previewProfileImage() {
    var file = document.getElementById('regProfileImage').files[0];
    if (file) {
        var reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('profileImagePreview').src = e.target.result;
            document.getElementById('profileImagePreview').classList.remove('hidden');
            document.getElementById('profileImagePlaceholder').classList.add('hidden');
        };
        reader.readAsDataURL(file);
    }
}

// ============================================
// AUTH FUNCTIONS
// ============================================
async function login() {
    var id = document.getElementById('loginIdentifier').value.trim();
    var pw = document.getElementById('loginPassword').value;
    if (!id || !pw) return toast('Fill all fields', 'error');
    showLoading('Signing in...');
    try {
        var email = id;
        if (id.indexOf('@') === -1) {
            var snap = await db.collection('users').where('username', '==', id.toLowerCase()).limit(1).get();
            if (snap.empty) { hideLoading(); return toast('Username not found', 'error'); }
            email = snap.docs[0].data().email;
        }
        await auth.signInWithEmailAndPassword(email, pw);
        hideLoading();
        toast('Welcome back! 👋', 'success');
        showMainApp();
        navigateTo('home');
    } catch (e) {
        hideLoading();
        if (e.code === 'auth/wrong-password') toast('Wrong password', 'error');
        else if (e.code === 'auth/user-not-found') toast('Account not found', 'error');
        else toast('Login failed', 'error');
    }
}

async function loginGoogle() {
    showLoading('Connecting...');
    try {
        var provider = new firebase.auth.GoogleAuthProvider();
        var result = await auth.signInWithPopup(provider);
        var user = result.user;
        var doc = await db.collection('users').doc(user.uid).get();
        if (!doc.exists) {
            await db.collection('users').doc(user.uid).set({
                uid: user.uid, fullName: user.displayName || 'User',
                username: (user.email.split('@')[0] + Math.random().toString(36).substring(2, 5)).toLowerCase(),
                email: user.email, country: 'GB', state: '', accountType: 'customer',
                profileImage: user.photoURL || '', balance: 0, rewards: 0, rubyBalance: 0,
                referrals: 0, followers: 0, following: 0, verified: false, organizer: false,
                plan: 'free', hasStore: false, storeId: '', hasService: false, serviceId: '',
                affiliate: null, storeBalance: 0, affiliateBalance: 0, referralBalance: 0,
                referralCode: 'REF' + Math.random().toString(36).substring(2, 8).toUpperCase(),
                loyalty: { points: 50, level: 'Bronze' }, securityPin: '', socialLinks: {},
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        hideLoading();
        toast('Welcome! 👋', 'success');
        showMainApp();
        navigateTo('home');
    } catch (e) {
        hideLoading();
        if (e.code !== 'auth/popup-closed-by-user') toast('Google sign-in failed', 'error');
    }
}

async function loginApple() {
    showLoading('Connecting...');
    try {
        var provider = new firebase.auth.OAuthProvider('apple.com');
        provider.addScope('email');
        provider.addScope('name');
        var result = await auth.signInWithPopup(provider);
        var user = result.user;
        var doc = await db.collection('users').doc(user.uid).get();
        if (!doc.exists) {
            var displayName = user.displayName || 'Apple User';
            await db.collection('users').doc(user.uid).set({
                uid: user.uid, fullName: displayName,
                username: ('apple' + Math.random().toString(36).substring(2, 7)).toLowerCase(),
                email: user.email || '', country: 'GB', state: '', accountType: 'customer',
                profileImage: user.photoURL || '', balance: 0, rewards: 0, rubyBalance: 0,
                referrals: 0, followers: 0, following: 0, verified: false, organizer: false,
                plan: 'free', hasStore: false, storeId: '', hasService: false, serviceId: '',
                affiliate: null, storeBalance: 0, affiliateBalance: 0, referralBalance: 0,
                referralCode: 'REF' + Math.random().toString(36).substring(2, 8).toUpperCase(),
                loyalty: { points: 50, level: 'Bronze' }, securityPin: '', socialLinks: {},
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        hideLoading();
        toast('Welcome! 👋', 'success');
        showMainApp();
        navigateTo('home');
    } catch (e) {
        hideLoading();
        if (e.code !== 'auth/popup-closed-by-user') toast('Apple sign-in failed', 'error');
        console.error('Apple login error:', e);
    }
}

async function register() {
    var fn = document.getElementById('regFullName').value.trim();
    var un = document.getElementById('regUsername').value.trim().toLowerCase();
    var em = document.getElementById('regEmail').value.trim();
    var cc = document.getElementById('regCountryCode').value;
    var st = document.getElementById('regStateValue').value;
    var ref = document.getElementById('regReferralCode').value.trim();
    var at = document.getElementById('regAccountType').value;
    var sc = document.getElementById('regServiceCategory') ? document.getElementById('regServiceCategory').value : '';
    var pw = document.getElementById('regPassword').value;
    var cp = document.getElementById('regConfirmPassword').value;
    var ta = document.getElementById('regTermsAgreed').checked;
    var img = document.getElementById('regProfileImage').files[0];

    if (!fn || !un || !em || !pw || !at) return toast('Fill required fields', 'error');
    if (pw !== cp) return toast('Passwords mismatch', 'error');
    if (pw.length < 6) return toast('Password too short', 'error');
    if (!ta) return toast('Agree to terms', 'error');

    showLoading('Creating account...');
    try {
        var uq = await db.collection('users').where('username', '==', un).get();
        if (!uq.empty) { hideLoading(); return toast('Username taken', 'error'); }

        var uc = await auth.createUserWithEmailAndPassword(em, pw);
        var pfp = '';
        if (img) pfp = await uploadToCloud(img);

        if (ref) {
            var rq = await db.collection('users').where('referralCode', '==', ref).get();
            if (!rq.empty) {
                var refId = rq.docs[0].id;
                var refData = rq.docs[0].data();
                await db.collection('users').doc(refId).update({
                    referrals: firebase.firestore.FieldValue.increment(1),
                    'loyalty.points': firebase.firestore.FieldValue.increment(20)
                });
                var refCount = (refData.referrals || 0) + 1;
                if (refCount >= 10) {
                    var reward = 0.10;
                    var rc = findCountry(refData.country);
                    await db.collection('users').doc(refId).update({
                        referralBalance: firebase.firestore.FieldValue.increment(reward * (rc ? rc.rate : 1))
                    });
                }
            }
        }

        await db.collection('users').doc(uc.user.uid).set({
            uid: uc.user.uid, fullName: fn, username: un, email: em,
            country: cc || 'GB', state: st || '', accountType: at, serviceCategory: sc,
            profileImage: pfp, balance: 0, rewards: 0, rubyBalance: 0,
            referrals: 0, followers: 0, following: 0, verified: false, organizer: false,
            plan: 'free', hasStore: false, storeId: '', hasService: false, serviceId: '',
            affiliate: null, storeBalance: 0, affiliateBalance: 0, referralBalance: 0,
            referralCode: un, loyalty: { points: 50, level: 'Bronze' },
            securityPin: '', socialLinks: {}, createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        hideLoading();
        toast('Account created! 🎉', 'success');
        showMainApp();
        navigateTo('home');
    } catch (e) {
        hideLoading();
        if (e.code === 'auth/email-already-in-use') toast('Email taken', 'error');
        else toast('Registration failed', 'error');
    }
}

async function resetPassword() {
    var em = document.getElementById('resetPasswordEmail').value.trim();
    if (!em) return toast('Enter email', 'error');
    showLoading('Sending...');
    try {
        await auth.sendPasswordResetEmail(em);
        hideLoading();
        toast('Reset link sent!', 'success');
        showLoginForm();
    } catch (e) { hideLoading(); toast('Failed', 'error'); }
}

async function logout() {
    await auth.signOut();
    STATE.user = null;
    STATE.userData = null;
    STATE.isGuest = true;
    toast('Logged out', 'info');
    navigateTo('home');
}

async function uploadToCloud(file) {
    var fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    var res = await fetch(CLOUDINARY_CONFIG.apiEndpoint, { method: 'POST', body: fd });
    var data = await res.json();
    return data.secure_url;
}

// ============================================
// NAVIGATION
// ============================================
function navigateTo(page) {
    STATE.page = page;
    document.querySelectorAll('.bottom-nav-button').forEach(function(b) {
        b.classList.toggle('active', b.dataset.page === page);
    });
    var pages = {
        home: renderHome,
        events: renderEvents,
        services: renderServices,
        stores: renderStores,
        affiliate: renderAffiliate,
        profile: renderProfile,
        wallet: renderWallet,
        cart: renderCart,
        orders: renderOrders,
        tickets: renderMyTickets
    };
    if (pages[page]) pages[page]();
    var main = document.getElementById('appMainContent');
    if (main) main.scrollTop = 0;
}

// ============================================
// GUEST BANNER HELPER
// ============================================
function getGuestBanner() {
    return '<div class="guest-banner"><p>🔓 You\'re browsing as a guest</p><div class="btn-row"><button class="btn-primary btn-sm" onclick="showAuthScreen();showLoginForm();">Sign In</button><button class="btn-outline btn-sm" onclick="showAuthScreen();showRegisterForm();">Create Account</button></div></div>';
}

function getLockedFeature(msg) {
    return '<div class="locked-feature"><div class="lock-icon">🔒</div><h3>Sign In Required</h3><p>' + (msg || 'Create an account to access this feature') + '</p><button class="btn-primary btn-sm" onclick="showAuthScreen();showLoginForm();">Sign In</button></div>';
}

// ============================================
// HOME PAGE (Works for guests too)
// ============================================
function renderHome() {
    var d = STATE.userData;
    var bal = d ? (d.balance || 0) : 0;
    var rub = d ? (d.rubyBalance || 0) : 0;
    var fn = d && d.fullName ? d.fullName.split(' ')[0] : 'Guest';
    var hour = new Date().getHours();
    var greet = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
    var balanceDisplay = formatBalance(bal);
    var country = getUserCountry();
    var countryDisplay = getFlagEmoji(country.code) + ' ' + country.name;

    var html = '';
    
    // Guest banner
    if (STATE.isGuest) {
        html += getGuestBanner();
    }

    html += '<div class="card-greeting">';
    html += '<div><p style="opacity:0.7;font-size:0.75rem;">' + greet + '</p>';
    html += '<h2>' + fn + ' 👋</h2>';
    html += '<p style="margin-top:2px;"><span class="country-badge">' + countryDisplay + '</span></p>';
    if (!STATE.isGuest) {
        html += '<p style="margin-top:6px;"><span class="balance-amount">' + balanceDisplay + '</span></p>';
        html += '<p class="balance-sub">💎 ' + rub + ' Rubies</p></div>';
        html += '<div class="card-greeting-actions"><button onclick="openDeposit()">+ Deposit</button><button onclick="openWithdraw()">- Withdraw</button></div>';
    } else {
        html += '</div>';
    }
    html += '</div>';

    html += '<div class="section-header"><h3>🔥 Trending Events</h3><button class="section-link" onclick="navigateTo(\'events\')">See All</button></div>';
    html += '<div class="horizontal-scroll" id="trendingEvents"><p class="empty-state-message">Loading...</p></div>';

    html += '<div class="section-header"><h3>🛠️ Top Services</h3><button class="section-link" onclick="navigateTo(\'services\')">See All</button></div>';
    html += '<div class="horizontal-scroll" id="topServices"><p class="empty-state-message">Loading...</p></div>';

    html += '<div class="section-header"><h3>🏪 Featured Stores</h3><button class="section-link" onclick="navigateTo(\'stores\')">See All</button></div>';
    html += '<div class="horizontal-scroll" id="featuredStores"><p class="empty-state-message">Loading...</p></div>';

    document.getElementById('appMainContent').innerHTML = html;
    loadTrendingEvents();
    loadTopServices();
    loadFeaturedStores();
}

async function loadTrendingEvents() {
    var c = document.getElementById('trendingEvents');
    if (!c) return;
    try {
        var snap = await db.collection('events').where('status', '==', 'active').where('country', '==', STATE.country).limit(8).get();
        if (snap.empty) { c.innerHTML = '<p class="empty-state-message">No events in ' + getUserCountry().name + '</p>'; return; }
        c.innerHTML = '';
        snap.forEach(function(d) {
            var e = d.data();
            c.innerHTML += '<div class="event-card" onclick="viewEvent(\'' + d.id + '\')"><div class="event-card-image">' + (e.banner ? '<img src="' + e.banner + '">' : '🎫') + '</div><div class="event-card-info"><h4>' + (e.title || 'Event') + '</h4><p class="event-meta">📅 ' + (e.date || 'TBA') + '</p><p class="event-price">' + (e.currency || '€') + (e.price || 0) + '</p></div></div>';
        });
    } catch (e) { c.innerHTML = '<p class="empty-state-message">No events available</p>'; }
}

async function loadTopServices() {
    var c = document.getElementById('topServices');
    if (!c) return;
    try {
        var snap = await db.collection('services').where('status', '==', 'active').where('country', '==', STATE.country).limit(8).get();
        if (snap.empty) { c.innerHTML = '<p class="empty-state-message">No services in ' + getUserCountry().name + '</p>'; return; }
        c.innerHTML = '';
        snap.forEach(function(d) {
            var s = d.data();
            c.innerHTML += '<div class="service-card" style="min-width:200px;flex-shrink:0;scroll-snap-align:start;" onclick="viewService(\'' + d.id + '\')"><img class="service-card-image" src="' + (s.profileImage || 'https://via.placeholder.com/60') + '"><div class="service-card-info"><h4>' + (s.name || 'Service') + '</h4><p>' + (s.category || 'General') + '</p><div class="service-card-stats"><span>👥 ' + (s.followers || 0) + '</span><span>⭐ ' + (s.rating || 'New') + '</span></div></div></div>';
        });
    } catch (e) { c.innerHTML = '<p class="empty-state-message">No services available</p>'; }
}

async function loadFeaturedStores() {
    var c = document.getElementById('featuredStores');
    if (!c) return;
    try {
        var snap = await db.collection('stores').where('status', '==', 'active').where('visibility', 'in', ['worldwide', STATE.country]).limit(8).get();
        if (snap.empty) { c.innerHTML = '<p class="empty-state-message">No stores available</p>'; return; }
        c.innerHTML = '';
        snap.forEach(function(d) {
            var s = d.data();
            c.innerHTML += '<div class="store-card" onclick="viewStore(\'' + d.id + '\')"><div class="store-card-image">' + (s.image ? '<img src="' + s.image + '">' : '🏪') + '</div><div class="store-card-info"><h4>' + (s.name || 'Store') + '</h4><p>' + (s.category || 'General') + '</p></div></div>';
        });
    } catch (e) { c.innerHTML = '<p class="empty-state-message">No stores available</p>'; }
}

// ============================================
// EVENTS PAGE
// ============================================
function renderEvents() {
    var html = '';
    html += '<div style="display:flex;gap:8px;margin-bottom:10px;"><input id="eventSearch" class="input-field" placeholder="Search events by name..." style="flex:1;padding:10px;background:var(--white);border:1px solid var(--gray-200);border-radius:8px;" oninput="searchEvents()"></div>';
    html += '<div class="chip-row" id="eventChips"><span class="chip active" onclick="filterEvents(\'all\')">All</span><span class="chip" onclick="filterEvents(\'Music\')">Music</span><span class="chip" onclick="filterEvents(\'Party\')">Party</span><span class="chip" onclick="filterEvents(\'Conference\')">Conference</span></div>';
    html += '<div class="grid-2-col" id="eventsGrid"><p class="empty-state-message">Loading events...</p></div>';
    document.getElementById('appMainContent').innerHTML = html;
    loadEvents();
}

async function loadEvents(cat) {
    var g = document.getElementById('eventsGrid');
    if (!g) return;
    try {
        var q = db.collection('events').where('status', '==', 'active').where('country', '==', STATE.country);
        if (cat && cat !== 'all') q = q.where('category', '==', cat);
        var snap = await q.limit(20).get();
        if (snap.empty) { g.innerHTML = '<p class="empty-state-message" style="grid-column:1/-1;">No events in ' + getUserCountry().name + '</p>'; return; }
        g.innerHTML = '';
        snap.forEach(function(d) {
            var e = d.data();
            g.innerHTML += '<div class="event-card" onclick="viewEvent(\'' + d.id + '\')"><div class="event-card-image">' + (e.banner ? '<img src="' + e.banner + '">' : '🎫') + '</div><div class="event-card-info"><h4>' + (e.title || 'Event') + '</h4><p class="event-meta">📅 ' + (e.date || 'TBA') + '</p><p class="event-price">' + (e.currency || '€') + (e.price || 0) + '</p></div></div>';
        });
    } catch (e) { g.innerHTML = '<p class="empty-state-message" style="grid-column:1/-1;">Error loading</p>'; }
}

function filterEvents(cat) {
    document.querySelectorAll('#eventChips .chip').forEach(function(ch) { ch.classList.remove('active'); });
    event.target.classList.add('active');
    loadEvents(cat === 'all' ? null : cat);
}

async function searchEvents() {
    var q = document.getElementById('eventSearch') ? document.getElementById('eventSearch').value.toLowerCase() : '';
    var g = document.getElementById('eventsGrid');
    if (!g) return;
    if (!q) { loadEvents(); return; }
    try {
        var snap = await db.collection('events').where('status', '==', 'active').where('country', '==', STATE.country).get();
        var filtered = [];
        snap.forEach(function(d) {
            if ((d.data().title || '').toLowerCase().indexOf(q) !== -1) filtered.push(d);
        });
        if (filtered.length === 0) { g.innerHTML = '<p class="empty-state-message" style="grid-column:1/-1;">No events found</p>'; return; }
        g.innerHTML = '';
        filtered.forEach(function(d) {
            var e = d.data();
            g.innerHTML += '<div class="event-card" onclick="viewEvent(\'' + d.id + '\')"><div class="event-card-image">' + (e.banner ? '<img src="' + e.banner + '">' : '🎫') + '</div><div class="event-card-info"><h4>' + (e.title || 'Event') + '</h4><p class="event-meta">📅 ' + (e.date || 'TBA') + '</p><p class="event-price">' + (e.currency || '€') + (e.price || 0) + '</p></div></div>';
        });
    } catch (e) { g.innerHTML = '<p class="empty-state-message">Error</p>'; }
}

function viewEvent(id) {
    STATE.currentEventId = id;
    showLoading();
    db.collection('events').doc(id).get().then(function(d) {
        hideLoading();
        if (!d.exists) return toast('Event not found', 'error');
        var e = d.data();
        var html = '';
        html += '<div class="event-detail-hero">' + (e.banner ? '<img src="' + e.banner + '">' : '') + '<button class="event-detail-back" onclick="navigateTo(\'events\')">←</button></div>';
        html += '<div class="event-detail-body">';
        html += '<h2>' + (e.title || 'Event') + '</h2>';
        html += '<p style="color:var(--gray-500);">' + (e.description || '') + '</p>';
        html += '<div class="event-detail-meta"><span><i class="fas fa-calendar"></i> ' + (e.date || 'TBA') + '</span><span><i class="fas fa-map-marker-alt"></i> ' + (e.venue || 'TBA') + '</span></div>';
        if (e.discountCode) html += '<p style="color:var(--green);font-size:0.8rem;">🎟️ Discount Code: <strong>' + e.discountCode + '</strong> - Save ' + (e.discountAmount || 0) + '%</p>';
        html += '<div class="ticket-type-row selected"><span class="ticket-name">Standard</span><span class="ticket-price">' + (e.currency || '€') + (e.price || 0) + '</span></div>';
        if (!STATE.isGuest) {
            html += '<button class="btn-primary btn-full mt-12" onclick="buyTicket(\'' + d.id + '\')">Buy Ticket</button>';
            if (e.organizerWhatsapp) html += '<button class="btn-outline btn-full mt-8" onclick="contactWA(\'' + e.organizerWhatsapp + '\')"><i class="fab fa-whatsapp"></i> Contact</button>';
            html += '<button class="btn-outline btn-full mt-8" onclick="affiliateTicket(\'' + d.id + '\')" style="color:var(--blue);border-color:var(--blue);">🔗 Affiliate (2%)</button>';
        } else {
            html += '<button class="btn-primary btn-full mt-12" onclick="showAuthScreen();showLoginForm();">Sign In to Buy</button>';
        }
        html += '<button class="btn-outline btn-full mt-8" onclick="shareEvent(\'' + d.id + '\')">📤 Share Event</button>';
        html += '</div>';
        document.getElementById('appMainContent').innerHTML = html;
        STATE.selectedTicket = { price: e.price || 0, currency: e.currency || 'EUR' };
    });
}

async function buyTicket(eventId) {
    if (!requireLogin()) return;
    var price = STATE.selectedTicket ? STATE.selectedTicket.price : 0;
    if ((STATE.userData.balance || 0) < price) return toast('Insufficient balance', 'error');
    showLoading('Processing...');
    try {
        var ed = await db.collection('events').doc(eventId).get();
        var e = ed.data();
        await db.collection('users').doc(STATE.user.uid).update({ balance: firebase.firestore.FieldValue.increment(-price) });
        var ticketId = 'TIX-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
        await db.collection('tickets').add({
            ticketId: ticketId, userId: STATE.user.uid, eventId: eventId,
            eventTitle: e.title, venue: e.venue, date: e.date,
            price: price, status: 'active', qrData: ticketId, barcodeData: ticketId,
            userName: STATE.userData.fullName, createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        await db.collection('events').doc(eventId).update({ ticketsSold: firebase.firestore.FieldValue.increment(1) });
        STATE.userData.balance -= price;
        hideLoading();
        toast('Ticket purchased! 🎫', 'success');
        navigateTo('tickets');
    } catch (e) { hideLoading(); toast('Purchase failed', 'error'); }
}

function shareEvent(eventId) {
    db.collection('events').doc(eventId).get().then(function(d) {
        if (!d.exists) return;
        var e = d.data();
        var link = 'https://connect.app/event/' + eventId;
        var html = '<div class="modal-header-row"><h3>📤 Share Event</h3><button class="modal-close-button" onclick="closeModal()">✕</button></div>';
        html += '<p style="text-align:center;font-weight:600;">' + (e.title || 'Event') + '</p>';
        html += '<div class="share-buttons">';
        html += '<button class="share-btn share-whatsapp" onclick="shareTo(\'whatsapp\',\'' + eventId + '\',\'' + (e.title || '') + '\')"><i class="fab fa-whatsapp"></i></button>';
        html += '<button class="share-btn share-facebook" onclick="shareTo(\'facebook\',\'' + eventId + '\',\'' + (e.title || '') + '\')"><i class="fab fa-facebook"></i></button>';
        html += '<button class="share-btn share-telegram" onclick="shareTo(\'telegram\',\'' + eventId + '\',\'' + (e.title || '') + '\')"><i class="fab fa-telegram"></i></button>';
        html += '<button class="share-btn share-gmail" onclick="shareTo(\'gmail\',\'' + eventId + '\',\'' + (e.title || '') + '\')"><i class="fas fa-envelope"></i></button>';
        html += '<button class="share-btn share-twitter" onclick="shareTo(\'twitter\',\'' + eventId + '\',\'' + (e.title || '') + '\')"><i class="fab fa-twitter"></i></button>';
        html += '</div><button class="btn-primary btn-full mt-8" onclick="closeModal()">Close</button>';
        document.getElementById('modalContent').innerHTML = html;
        showModal();
    });
}

function shareTo(platform, id, title) {
    var link = 'https://connect.app/event/' + id;
    var text = 'Check out this event on CONNECT: ' + title;
    var urls = {
        whatsapp: 'https://wa.me/?text=' + encodeURIComponent(text + ' ' + link),
        facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(link),
        telegram: 'https://t.me/share/url?url=' + encodeURIComponent(link) + '&text=' + encodeURIComponent(text),
        gmail: 'mailto:?subject=' + encodeURIComponent(title) + '&body=' + encodeURIComponent(text + ' ' + link),
        twitter: 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(link)
    };
    if (urls[platform]) window.open(urls[platform], '_blank');
    else { navigator.clipboard.writeText(link).then(function() { toast('Link copied!', 'success'); }); }
}

function affiliateTicket(eventId) {
    if (!requireLogin()) return;
    if (!STATE.userData.affiliate) return toast('Set up affiliate profile first', 'error');
    db.collection('events').doc(eventId).get().then(function(e) {
        if (!e.exists) return;
        var link = 'https://connect.app/ref/' + STATE.userData.username + '/event/' + eventId;
        var html = '<div class="modal-header-row"><h3>🔗 Affiliate (2%)</h3><button class="modal-close-button" onclick="closeModal()">✕</button></div>';
        html += '<p>Promote: <strong>' + e.data().title + '</strong></p>';
        html += '<div style="background:var(--gray-100);padding:12px;border-radius:8px;word-break:break-all;font-size:0.75rem;margin:8px 0;">' + link + '</div>';
        html += renderShareButtons(link, e.data().title);
        html += '<button class="btn-primary btn-full mt-8" onclick="copyText(\'' + link + '\')">Copy Link</button>';
        document.getElementById('modalContent').innerHTML = html;
        showModal();
    });
}

function renderShareButtons(link, title) {
    return '<div class="share-buttons">' +
        '<button class="share-btn share-whatsapp" onclick="shareTextLink(\'whatsapp\',\'' + link + '\',\'' + title + '\')"><i class="fab fa-whatsapp"></i></button>' +
        '<button class="share-btn share-facebook" onclick="shareTextLink(\'facebook\',\'' + link + '\',\'' + title + '\')"><i class="fab fa-facebook"></i></button>' +
        '<button class="share-btn share-telegram" onclick="shareTextLink(\'telegram\',\'' + link + '\',\'' + title + '\')"><i class="fab fa-telegram"></i></button>' +
        '<button class="share-btn share-gmail" onclick="shareTextLink(\'gmail\',\'' + link + '\',\'' + title + '\')"><i class="fas fa-envelope"></i></button>' +
        '<button class="share-btn share-twitter" onclick="shareTextLink(\'twitter\',\'' + link + '\',\'' + title + '\')"><i class="fab fa-twitter"></i></button>' +
        '</div>';
}

function shareTextLink(platform, link, title) {
    var text = 'Check this out on CONNECT: ' + title;
    var urls = {
        whatsapp: 'https://wa.me/?text=' + encodeURIComponent(text + ' ' + link),
        facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(link),
        telegram: 'https://t.me/share/url?url=' + encodeURIComponent(link) + '&text=' + encodeURIComponent(text),
        gmail: 'mailto:?subject=' + encodeURIComponent(title) + '&body=' + encodeURIComponent(text + ' ' + link),
        twitter: 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(link)
    };
    if (urls[platform]) window.open(urls[platform], '_blank');
    else copyText(link);
}

function copyText(t) {
    navigator.clipboard.writeText(t).then(function() { toast('Copied!', 'success'); });
}

function contactWA(wa) {
    if (wa) window.open('https://wa.me/' + wa.replace(/[^0-9]/g, ''), '_blank');
}

function callNumber(phone) {
    if (phone) window.open('tel:' + phone.replace(/[^0-9+]/g, ''), '_blank');
}

// ============================================
// SERVICES PAGE
// ============================================
function renderServices() {
    var html = '';
    html += '<div style="display:flex;gap:8px;margin-bottom:10px;"><input id="serviceSearch" class="input-field" placeholder="Search services by username..." style="flex:1;padding:10px;background:var(--white);border:1px solid var(--gray-200);border-radius:8px;" oninput="searchServices()"></div>';
    html += '<div class="section-header"><h3>🛠️ Service Marketplace</h3>' + (!STATE.isGuest && STATE.userData && STATE.userData.subscription ? '<button class="btn-primary btn-sm" onclick="openCreateService()">Create Service</button>' : '') + '</div>';
    html += '<div class="chip-row" id="svcChips"><span class="chip active" onclick="filterServices(\'all\')">All</span></div>';
    html += '<div id="servicesList"><p class="empty-state-message">Loading services...</p></div>';
    document.getElementById('appMainContent').innerHTML = html;
    for (var i = 0; i < Math.min(SERVICE_CATEGORIES.length, 30); i++) {
        document.getElementById('svcChips').innerHTML += '<span class="chip" onclick="filterServices(\'' + SERVICE_CATEGORIES[i] + '\')">' + SERVICE_CATEGORIES[i] + '</span>';
    }
    loadServices();
}

async function loadServices(cat) {
    var c = document.getElementById('servicesList');
    if (!c) return;
    try {
        var q = db.collection('services').where('status', '==', 'active').where('country', '==', STATE.country);
        if (cat && cat !== 'all') q = q.where('category', '==', cat);
        var snap = await q.limit(30).get();
        if (snap.empty) { c.innerHTML = '<p class="empty-state-message">No services in ' + getUserCountry().name + '</p>'; return; }
        c.innerHTML = '';
        snap.forEach(function(d) {
            var s = d.data();
            c.innerHTML += '<div class="service-card" onclick="viewService(\'' + d.id + '\')"><img class="service-card-image" src="' + (s.profileImage || 'https://via.placeholder.com/60') + '"><div class="service-card-info"><h4>' + (s.name || 'Service') + '</h4><p>' + (s.category || 'General') + '</p><div class="service-card-stats"><span>👥 ' + (s.followers || 0) + '</span><span>⭐ ' + (s.rating || 'New') + '</span></div></div></div>';
        });
    } catch (e) { c.innerHTML = '<p class="empty-state-message">Error loading</p>'; }
}

function viewService(sid) {
    STATE.currentServiceId = sid;
    showLoading();
    db.collection('services').doc(sid).get().then(function(d) {
        hideLoading();
        if (!d.exists) return toast('Not found', 'error');
        var s = d.data();
        var html = '<button onclick="navigateTo(\'services\')" style="background:var(--gray-100);border:none;padding:8px 14px;border-radius:20px;cursor:pointer;margin-bottom:12px;">← Back</button>';
        html += '<div style="text-align:center;"><img src="' + (s.profileImage || 'https://via.placeholder.com/90') + '" style="width:80px;height:80px;border-radius:50%;border:3px solid var(--purple);">';
        html += '<h2>' + (s.name || 'Service') + '</h2><p>' + (s.category || 'General') + '</p><p>📍 ' + (s.location || 'N/A') + '</p>';
        if (s.whatsapp) html += '<button class="btn-primary btn-full mt-8" onclick="contactWA(\'' + s.whatsapp + '\')"><i class="fab fa-whatsapp"></i> Chat</button>';
        if (s.phone) html += '<button class="btn-outline btn-full mt-8" onclick="callNumber(\'' + s.phone + '\')"><i class="fas fa-phone"></i> Call</button>';
        html += '</div>';
        document.getElementById('appMainContent').innerHTML = html;
    });
}

function openCreateService() {
    if (!requireLogin()) return;
    var html = '<div class="modal-header-row"><h3>🛠️ Create Service</h3><button class="modal-close-button" onclick="closeModal()">✕</button></div>';
    html += '<div class="input-group"><input id="svcName" class="input-field" placeholder="Service Name"></div>';
    html += '<div class="input-group"><select id="svcCat" class="input-field select-field">';
    for (var i = 0; i < SERVICE_CATEGORIES.length; i++) {
        html += '<option value="' + SERVICE_CATEGORIES[i] + '">' + SERVICE_CATEGORIES[i] + '</option>';
    }
    html += '</select></div>';
    html += '<div class="input-group"><input id="svcLoc" class="input-field" placeholder="Location"></div>';
    html += '<div class="input-group"><input id="svcWA" class="input-field" placeholder="WhatsApp"></div>';
    html += '<div class="input-group"><input id="svcImg" type="file" accept="image/*"></div>';
    html += '<button class="btn-primary btn-full mt-12" onclick="createService()">Create Service</button>';
    document.getElementById('modalContent').innerHTML = html;
    showModal();
}

async function createService() {
    var n = document.getElementById('svcName').value.trim();
    var cat = document.getElementById('svcCat').value;
    var loc = document.getElementById('svcLoc').value.trim();
    var wa = document.getElementById('svcWA').value.trim();
    var imgFile = document.getElementById('svcImg').files[0];
    if (!n || !cat) return toast('Fill required', 'error');
    closeModal();
    showLoading();
    try {
        var img = '';
        if (imgFile) img = await uploadToCloud(imgFile);
        var sRef = await db.collection('services').add({
            name: n, category: cat, location: loc, whatsapp: wa, profileImage: img,
            country: STATE.country, ownerId: STATE.user.uid,
            status: 'active', followers: 0, rating: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        await db.collection('users').doc(STATE.user.uid).update({ hasService: true, serviceId: sRef.id });
        hideLoading();
        toast('Service created!', 'success');
        navigateTo('services');
    } catch (e) { hideLoading(); toast('Failed', 'error'); }
}

function filterServices(cat) {
    document.querySelectorAll('#svcChips .chip').forEach(function(ch) { ch.classList.remove('active'); });
    event.target.classList.add('active');
    loadServices(cat === 'all' ? null : cat);
}

async function searchServices() {
    var q = document.getElementById('serviceSearch') ? document.getElementById('serviceSearch').value.toLowerCase() : '';
    var c = document.getElementById('servicesList');
    if (!c) return;
    if (!q) { loadServices(); return; }
    try {
        var snap = await db.collection('services').where('status', '==', 'active').where('country', '==', STATE.country).get();
        var filtered = [];
        snap.forEach(function(d) {
            var s = d.data();
            if ((s.name || '').toLowerCase().indexOf(q) !== -1) filtered.push(d);
        });
        if (filtered.length === 0) { c.innerHTML = '<p class="empty-state-message">No services found</p>'; return; }
        c.innerHTML = '';
        filtered.forEach(function(d) {
            var s = d.data();
            c.innerHTML += '<div class="service-card" onclick="viewService(\'' + d.id + '\')"><img class="service-card-image" src="' + (s.profileImage || 'https://via.placeholder.com/60') + '"><div class="service-card-info"><h4>' + (s.name || 'Service') + '</h4><p>' + (s.category || 'General') + '</p></div></div>';
        });
    } catch (e) { c.innerHTML = '<p class="empty-state-message">Error</p>'; }
}

// ============================================
// STORES PAGE
// ============================================
function renderStores() {
    var html = '<div style="display:flex;gap:8px;margin-bottom:10px;"><input id="storeSearch" class="input-field" placeholder="Search stores by name..." style="flex:1;padding:10px;background:var(--white);border:1px solid var(--gray-200);border-radius:8px;" oninput="searchStores()"></div>';
    html += '<div class="section-header"><h3>🏪 All Stores</h3></div>';
    html += '<div class="grid-2-col" id="storesGrid"><p class="empty-state-message">Loading stores...</p></div>';
    document.getElementById('appMainContent').innerHTML = html;
    loadStores();
}

async function loadStores() {
    var g = document.getElementById('storesGrid');
    if (!g) return;
    try {
        var snap = await db.collection('stores').where('status', '==', 'active').where('visibility', 'in', ['worldwide', STATE.country]).limit(20).get();
        if (snap.empty) { g.innerHTML = '<p class="empty-state-message" style="grid-column:1/-1;">No stores available</p>'; return; }
        g.innerHTML = '';
        snap.forEach(function(d) {
            var s = d.data();
            g.innerHTML += '<div class="store-card" onclick="viewStore(\'' + d.id + '\')"><div class="store-card-image">' + (s.image ? '<img src="' + s.image + '">' : '🏪') + '</div><div class="store-card-info"><h4>' + (s.name || 'Store') + '</h4><p>' + (s.category || 'General') + '</p></div></div>';
        });
    } catch (e) { g.innerHTML = '<p class="empty-state-message">Error</p>'; }
}

async function searchStores() {
    var q = document.getElementById('storeSearch') ? document.getElementById('storeSearch').value.toLowerCase() : '';
    var g = document.getElementById('storesGrid');
    if (!g) return;
    if (!q) { loadStores(); return; }
    try {
        var snap = await db.collection('stores').where('status', '==', 'active').get();
        var filtered = [];
        snap.forEach(function(d) {
            if ((d.data().name || '').toLowerCase().indexOf(q) !== -1) filtered.push(d);
        });
        if (filtered.length === 0) { g.innerHTML = '<p class="empty-state-message">No stores found</p>'; return; }
        g.innerHTML = '';
        filtered.forEach(function(d) {
            var s = d.data();
            g.innerHTML += '<div class="store-card" onclick="viewStore(\'' + d.id + '\')"><div class="store-card-image">' + (s.image ? '<img src="' + s.image + '">' : '🏪') + '</div><div class="store-card-info"><h4>' + (s.name || 'Store') + '</h4><p>' + (s.category || 'General') + '</p></div></div>';
        });
    } catch (e) { g.innerHTML = '<p class="empty-state-message">Error</p>'; }
}

async function viewStore(sid) {
    STATE.currentStoreId = sid;
    showLoading();
    try {
        var d = await db.collection('stores').doc(sid).get();
        if (!d.exists) { hideLoading(); return toast('Not found', 'error'); }
        var s = d.data();
        var isOwner = STATE.user && s.ownerId === STATE.user.uid;
        var html = '<div class="store-hero-section"><div class="store-cover-image">' + (s.image ? '<img src="' + s.image + '">' : '') + '</div>';
        html += '<div class="store-avatar-large">' + (s.name || 'S').charAt(0) + '</div>';
        html += '<div class="store-info-section"><h2>' + (s.name || 'Store') + '</h2><p>' + (s.description || '') + '</p>';
        html += '<p>' + (s.category || 'General') + ' • ' + (s.visibility === 'worldwide' ? '🌍 Worldwide' : '📍 Local') + '</p>';
        if (isOwner) {
            html += '<button class="btn-primary btn-sm mt-8" onclick="openAddProduct()">+ Add Product</button>';
        }
        html += '</div></div>';
        html += '<div class="grid-2-col" id="storeProductsGrid"><p class="empty-state-message">Loading products...</p></div>';
        document.getElementById('appMainContent').innerHTML = html;
        loadStoreProducts(sid, isOwner);
    } catch (e) { hideLoading(); toast('Error', 'error'); }
}

async function loadStoreProducts(sid, isOwner) {
    var g = document.getElementById('storeProductsGrid');
    if (!g) return;
    try {
        var snap = await db.collection('products').where('storeId', '==', sid).where('status', '==', 'active').get();
        if (snap.empty) { g.innerHTML = '<p class="empty-state-message" style="grid-column:1/-1;">No products</p>'; return; }
        g.innerHTML = '';
        snap.forEach(function(d) {
            var p = d.data();
            var productHtml = '<div class="product-card" onclick="viewProduct(\'' + d.id + '\')"><div class="product-card-image">' + (p.images && p.images[0] ? '<img src="' + p.images[0] + '">' : '📦') + '</div>';
            productHtml += '<div class="product-card-info"><h5>' + (p.title || 'Product') + '</h5><p class="product-price">' + (p.currency || '€') + (p.price || 0) + '</p>';
            if (!STATE.isGuest) {
                productHtml += '<button class="btn-primary btn-xs mt-8" onclick="event.stopPropagation();openBuyProduct(\'' + d.id + '\')">Buy Now</button>';
            } else {
                productHtml += '<button class="btn-outline btn-xs mt-8" onclick="event.stopPropagation();showAuthScreen();showLoginForm();">Sign In to Buy</button>';
            }
            productHtml += '</div></div>';
            g.innerHTML += productHtml;
        });
    } catch (e) { g.innerHTML = '<p class="empty-state-message">Error</p>'; }
}

function openCreateStore() {
    if (!requireLogin()) return;
    var html = '<div class="modal-header-row"><h3>🏪 Create Store</h3><button class="modal-close-button" onclick="closeModal()">✕</button></div>';
    html += '<div class="input-group"><input id="sName" class="input-field" placeholder="Store Name"></div>';
    html += '<div class="input-group"><select id="sCat" class="input-field select-field">';
    for (var i = 0; i < SHOP_CATEGORIES.length; i++) {
        html += '<option value="' + SHOP_CATEGORIES[i] + '">' + SHOP_CATEGORIES[i] + '</option>';
    }
    html += '</select></div>';
    html += '<div class="input-group"><select id="sVis" class="input-field select-field"><option value="country">My Country Only</option><option value="worldwide">Worldwide</option></select></div>';
    html += '<div class="input-group"><input id="sImg" type="file" accept="image/*"></div>';
    html += '<button class="btn-primary btn-full mt-12" onclick="createStore()">Create Store</button>';
    document.getElementById('modalContent').innerHTML = html;
    showModal();
}

async function createStore() {
    var n = document.getElementById('sName').value.trim();
    var cat = document.getElementById('sCat').value;
    var vis = document.getElementById('sVis').value;
    var imgFile = document.getElementById('sImg').files[0];
    if (!n) return toast('Enter store name', 'error');
    closeModal();
    showLoading();
    try {
        var img = '';
        if (imgFile) img = await uploadToCloud(imgFile);
        var ref = await db.collection('stores').add({
            name: n, category: cat, visibility: vis === 'worldwide' ? 'worldwide' : STATE.country,
            image: img, ownerId: STATE.user.uid, status: 'active', rating: 0, productCount: 0, storeBalance: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        await db.collection('users').doc(STATE.user.uid).update({ hasStore: true, storeId: ref.id });
        STATE.userData.hasStore = true;
        STATE.userData.storeId = ref.id;
        hideLoading();
        toast('Store created!', 'success');
        navigateTo('stores');
    } catch (e) { hideLoading(); toast('Failed', 'error'); }
}

function openAddProduct() {
    if (!requireLogin()) return;
    var html = '<div class="modal-header-row"><h3>📦 Add Product</h3><button class="modal-close-button" onclick="closeModal()">✕</button></div>';
    html += '<div class="input-group"><input id="pTitle" class="input-field" placeholder="Product Title"></div>';
    html += '<div class="input-group"><input id="pDesc" class="input-field" placeholder="Description"></div>';
    html += '<div class="input-row-dual"><div class="input-group half"><input id="pPrice" type="number" class="input-field" placeholder="Price" step="0.01"></div><div class="input-group half"><input id="pStock" type="number" class="input-field" placeholder="Stock" value="1"></div></div>';
    html += '<div class="input-group"><select id="pCur" class="input-field select-field"><option value="EUR">EUR (€)</option><option value="USD">USD ($)</option><option value="GBP">GBP (£)</option><option value="NGN">NGN (₦)</option></select></div>';
    html += '<div class="input-group"><input id="pImg" type="file" accept="image/*" multiple></div>';
    html += '<button class="btn-primary btn-full mt-12" onclick="addProduct()">Add Product</button>';
    document.getElementById('modalContent').innerHTML = html;
    showModal();
}

async function addProduct() {
    var t = document.getElementById('pTitle').value.trim();
    var desc = document.getElementById('pDesc').value.trim();
    var p = parseFloat(document.getElementById('pPrice').value);
    var st = parseInt(document.getElementById('pStock').value);
    var cur = document.getElementById('pCur').value;
    var imgFiles = document.getElementById('pImg').files;
    if (!t || !p) return toast('Fill required', 'error');
    closeModal();
    showLoading();
    try {
        var imgs = [];
        for (var i = 0; i < Math.min(imgFiles.length, 6); i++) {
            imgs.push(await uploadToCloud(imgFiles[i]));
        }
        await db.collection('products').add({
            title: t, description: desc, price: p, stock: st, currency: cur, type: 'physical',
            images: imgs, storeId: STATE.currentStoreId, ownerId: STATE.user.uid, status: 'active',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        hideLoading();
        toast('Product added!', 'success');
        viewStore(STATE.currentStoreId);
    } catch (e) { hideLoading(); toast('Failed', 'error'); }
}

function viewProduct(pid) {
    STATE.currentProductId = pid;
    showLoading();
    db.collection('products').doc(pid).get().then(function(d) {
        hideLoading();
        if (!d.exists) return toast('Not found', 'error');
        var p = d.data();
        var imgs = p.images || [];
        var html = '<button onclick="navigateTo(\'stores\')" style="background:var(--gray-100);border:none;padding:8px 14px;border-radius:20px;cursor:pointer;margin-bottom:12px;">← Back</button>';
        html += '<div class="product-gallery">' + (imgs.length > 0 ? '<img src="' + imgs[0] + '">' : '<div style="height:100%;display:flex;align-items:center;justify-content:center;font-size:4rem;">📦</div>') + '</div>';
        html += '<h2>' + (p.title || 'Product') + '</h2><p style="color:var(--gray-500);">' + (p.description || '') + '</p>';
        html += '<p style="font-size:1.5rem;font-weight:700;color:var(--purple);">' + (p.currency || '€') + (p.price || 0) + '</p>';
        html += '<p style="color:var(--gray-500);">Stock: ' + (p.stock || 0) + '</p>';
        if (!STATE.isGuest) {
            html += '<button class="btn-primary btn-full mt-12" onclick="openBuyProduct(\'' + pid + '\')">Buy Now</button>';
        } else {
            html += '<button class="btn-primary btn-full mt-12" onclick="showAuthScreen();showLoginForm();">Sign In to Buy</button>';
        }
        document.getElementById('appMainContent').innerHTML = html;
    });
}

function openBuyProduct(pid) {
    if (!requireLogin()) return;
    var html = '<div class="modal-header-row"><h3>📦 Purchase</h3><button class="modal-close-button" onclick="closeModal()">✕</button></div>';
    html += '<div class="input-group"><input id="buyCountry" class="input-field" placeholder="Country"></div>';
    html += '<div class="input-group"><input id="buyState" class="input-field" placeholder="State"></div>';
    html += '<div class="input-group"><input id="buyLocation" class="input-field" placeholder="Exact Location"></div>';
    html += '<div class="input-group"><input id="buyPhone" class="input-field" placeholder="Phone"></div>';
    html += '<div class="input-group"><input id="buyWA" class="input-field" placeholder="WhatsApp"></div>';
    html += '<button class="btn-primary btn-full mt-12" onclick="confirmBuy(\'' + pid + '\')">Confirm & Pay</button>';
    document.getElementById('modalContent').innerHTML = html;
    showModal();
}

async function confirmBuy(pid) {
    var c = document.getElementById('buyCountry').value.trim();
    var st = document.getElementById('buyState').value.trim();
    var loc = document.getElementById('buyLocation').value.trim();
    var ph = document.getElementById('buyPhone').value.trim();
    var wa = document.getElementById('buyWA').value.trim();
    if (!c || !st || !loc || !ph) return toast('Fill all delivery details', 'error');
    var d = await db.collection('products').doc(pid).get();
    if (!d.exists) return toast('Not found', 'error');
    var p = d.data();
    var finalPrice = p.price || 0;
    if ((STATE.userData.balance || 0) < finalPrice) return toast('Insufficient balance', 'error');
    closeModal();
    showLoading();
    try {
        await db.collection('users').doc(STATE.user.uid).update({ balance: firebase.firestore.FieldValue.increment(-finalPrice) });
        if (p.stock) await db.collection('products').doc(pid).update({ stock: firebase.firestore.FieldValue.increment(-1) });
        var oRef = await db.collection('orders').add({
            userId: STATE.user.uid, sellerId: p.ownerId, productId: pid,
            itemName: p.title, total: finalPrice, status: 'pending', type: p.type,
            escrow: true, deliveryDetails: { country: c, state: st, location: loc, phone: ph, whatsapp: wa },
            buyerName: STATE.userData.fullName, createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        await db.collection('stores').doc(STATE.currentStoreId || p.storeId).update({ storeBalance: firebase.firestore.FieldValue.increment(finalPrice) });
        await db.collection('transactions').add({
            userId: STATE.user.uid, type: 'purchase', amount: finalPrice,
            itemName: p.title, orderId: oRef.id, status: 'completed',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        await db.collection('notifications').add({
            userId: p.ownerId,
            message: 'New order: ' + p.title + ' for ' + formatBalance(finalPrice) + '. Deliver to: ' + loc + ', ' + st,
            read: false, createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        STATE.userData.balance -= finalPrice;
        hideLoading();
        toast('Order placed!', 'success');
        navigateTo('orders');
    } catch (e) { hideLoading(); toast('Failed', 'error'); }
}

// ============================================
// ORDERS
// ============================================
function renderOrders() {
    if (!requireLogin()) return;
    var html = '<div class="tab-row"><button class="tab-button active" onclick="filterOrders(\'all\')">All</button><button class="tab-button" onclick="filterOrders(\'pending\')">Pending</button><button class="tab-button" onclick="filterOrders(\'completed\')">Completed</button><button class="tab-button" onclick="filterOrders(\'refunded\')">Refunded</button></div>';
    html += '<div id="ordersList"><p class="empty-state-message">Loading orders...</p></div>';
    document.getElementById('appMainContent').innerHTML = html;
    loadOrders('all');
}

async function loadOrders(status) {
    var c = document.getElementById('ordersList');
    if (!c || !STATE.user) return;
    try {
        var q = db.collection('orders').where('userId', '==', STATE.user.uid).orderBy('createdAt', 'desc');
        if (status && status !== 'all') q = q.where('status', '==', status);
        var snap = await q.limit(30).get();
        if (snap.empty) { c.innerHTML = '<p class="empty-state-message">No orders</p>'; return; }
        c.innerHTML = '';
        snap.forEach(function(d) {
            var o = d.data();
            var sc = o.status === 'completed' ? 'var(--green)' : o.status === 'refunded' ? 'var(--red)' : 'var(--gold)';
            var div = '<div class="card-white"><div style="display:flex;justify-content:space-between;"><span>#' + d.id.substring(0, 8) + '</span><span style="color:' + sc + ';font-weight:600;">' + o.status + '</span></div>';
            div += '<div style="display:flex;justify-content:space-between;margin-top:4px;"><span>' + o.itemName + '</span><span style="font-weight:700;color:var(--purple);">' + formatBalance(o.total || 0) + '</span></div>';
            if (o.status === 'pending') div += '<button class="btn-primary btn-sm mt-8" onclick="confirmDelivery(\'' + d.id + '\')">✅ Confirm Received</button>';
            div += '</div>';
            c.innerHTML += div;
        });
    } catch (e) { c.innerHTML = '<p class="empty-state-message">Error</p>'; }
}

function filterOrders(s) {
    document.querySelectorAll('.tab-row .tab-button').forEach(function(b) { b.classList.remove('active'); });
    event.target.classList.add('active');
    loadOrders(s);
}

async function confirmDelivery(oid) {
    var d = await db.collection('orders').doc(oid).get();
    if (!d.exists) return;
    var o = d.data();
    showLoading();
    await db.collection('orders').doc(oid).update({ status: 'completed' });
    await db.collection('users').doc(o.sellerId).update({ balance: firebase.firestore.FieldValue.increment(o.total) });
    await db.collection('notifications').add({
        userId: o.sellerId,
        message: '🎉 Buyer confirmed delivery of "' + o.itemName + '". ' + formatBalance(o.total) + ' released.',
        read: false, createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    hideLoading();
    toast('Delivery confirmed!', 'success');
    loadOrders('all');
}

// ============================================
// TICKETS
// ============================================
function renderMyTickets() {
    if (!requireLogin()) return;
    var html = '<div class="tab-row"><button class="tab-button active" onclick="filterTickets(\'active\')">Active</button><button class="tab-button" onclick="filterTickets(\'used\')">Used</button></div>';
    html += '<div id="tixList"><p class="empty-state-message">Loading tickets...</p></div>';
    document.getElementById('appMainContent').innerHTML = html;
    loadTickets('active');
}

async function loadTickets(status) {
    var c = document.getElementById('tixList');
    if (!c) return;
    try {
        var snap = await db.collection('tickets').where('userId', '==', STATE.user.uid).where('status', '==', status).orderBy('createdAt', 'desc').get();
        if (snap.empty) { c.innerHTML = '<p class="empty-state-message">No ' + status + ' tickets</p>'; return; }
        c.innerHTML = '';
        snap.forEach(function(d) {
            var t = d.data();
            c.innerHTML += '<div class="ticket-full-card"><div class="ticket-card-top-bar"><span>' + t.eventTitle + '</span><span class="ticket-status-badge status-' + t.status + '">' + t.status + '</span></div><div class="ticket-card-body"><div class="ticket-qr-box" id="qr-' + d.id + '"></div><div class="ticket-info-area"><div class="ticket-event-name">' + t.eventTitle + '</div><div class="ticket-detail">📍 ' + t.venue + '</div><div class="ticket-detail">📅 ' + t.date + '</div><div class="ticket-detail">🎫 ' + t.ticketId + '</div></div></div></div>';
        });
        setTimeout(function() {
            snap.forEach(function(d) {
                var box = document.getElementById('qr-' + d.id);
                if (box) {
                    try { new QRCode(box, { text: d.data().qrData || d.id, width: 60, height: 60 }); } catch(e) {}
                }
            });
        }, 300);
    } catch (e) { c.innerHTML = '<p class="empty-state-message">Error</p>'; }
}

function filterTickets(s) {
    document.querySelectorAll('.tab-row .tab-button').forEach(function(b) { b.classList.remove('active'); });
    event.target.classList.add('active');
    loadTickets(s);
}

// ============================================
// AFFILIATE PAGE
// ============================================
function renderAffiliate() {
    if (STATE.isGuest) {
        document.getElementById('appMainContent').innerHTML = getLockedFeature('Sign in to access the Affiliate Program and earn commissions');
        return;
    }
    if (!STATE.userData.subscription) {
        document.getElementById('appMainContent').innerHTML = '<p class="empty-state-message">Subscribe to a plan to access Affiliate Program</p>';
        return;
    }
    if (!STATE.userData.affiliate) {
        var html2 = '<div class="card-white"><h3>Become an Affiliate</h3>';
        html2 += '<div class="input-group"><input id="affName" class="input-field" placeholder="Affiliate Name"></div>';
        html2 += '<div class="input-group"><input id="affUser" class="input-field" placeholder="Username"></div>';
        html2 += '<div class="input-group"><input id="affPhone" class="input-field" placeholder="Phone"></div>';
        html2 += '<div class="input-group"><input id="affWA" class="input-field" placeholder="WhatsApp"></div>';
        html2 += '<button class="btn-primary btn-full mt-12" onclick="setupAffiliate()">Generate Affiliate ID</button></div>';
        document.getElementById('appMainContent').innerHTML = html2;
        return;
    }
    var a = STATE.userData.affiliate;
    var html3 = '<div class="affiliate-hero-card"><p>Affiliate ID</p><div class="affiliate-id-display">' + a.id + '</div>';
    html3 += '<p>Level: <span class="affiliate-level-badge level-' + (a.level || 1) + '">Level ' + (a.level || 1) + '</span></p>';
    html3 += '<div class="affiliate-stats-row"><div class="affiliate-stat-item"><div class="stat-value">' + formatBalance(a.balance || 0) + '</div><div class="stat-label">Balance</div></div><div class="affiliate-stat-item"><div class="stat-value">' + (a.completed || 0) + '</div><div class="stat-label">Completed</div></div></div>';
    html3 += '<button class="btn-primary btn-sm mt-8" onclick="affCashout()">Cash Out</button></div>';
    
    var link = 'https://connect.app/ref/' + STATE.userData.username;
    html3 += '<div class="card-white" style="text-align:center;"><p style="font-size:0.8rem;margin-bottom:8px;">Your Affiliate Link:</p>';
    html3 += '<div style="background:var(--gray-100);padding:10px;border-radius:8px;word-break:break-all;font-size:0.7rem;margin:8px 0;">' + link + '</div>';
    html3 += renderShareButtons(link, 'Join CONNECT');
    html3 += '<button class="btn-primary btn-sm mt-8" onclick="copyRef()">Copy Link</button></div>';
    
    html3 += '<div class="section-header"><h3>Products to Promote</h3></div><div class="grid-2-col" id="affProds"><p class="empty-state-message">Loading...</p></div>';
    html3 += '<div class="section-header"><h3>Events (2% Commission)</h3></div><div class="grid-2-col" id="affEvents"><p class="empty-state-message">Loading...</p></div>';
    document.getElementById('appMainContent').innerHTML = html3;
    loadAffProducts();
    loadAffEvents();
}

async function setupAffiliate() {
    var n = document.getElementById('affName').value.trim();
    var u = document.getElementById('affUser').value.trim();
    var p = document.getElementById('affPhone').value.trim();
    var w = document.getElementById('affWA').value.trim();
    if (!n || !u) return toast('Fill fields', 'error');
    var id = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    await db.collection('users').doc(STATE.user.uid).update({ 
        affiliate: { name: n, username: u, phone: p, whatsapp: w, id: id, balance: 0, completed: 0, level: 1, campaigns: [] } 
    });
    STATE.userData.affiliate = { name: n, username: u, phone: p, whatsapp: w, id: id, balance: 0, completed: 0, level: 1, campaigns: [] };
    toast('Affiliate ID generated!', 'success');
    renderAffiliate();
}

async function loadAffProducts() {
    var g = document.getElementById('affProds');
    if (!g) return;
    var snap = await db.collection('products').where('status', '==', 'active').limit(20).get();
    if (snap.empty) { g.innerHTML = '<p class="empty-state-message">No products</p>'; return; }
    g.innerHTML = '';
    snap.forEach(function(d) {
        var p = d.data();
        g.innerHTML += '<div class="product-card"><div class="product-card-image">' + (p.images && p.images[0] ? '<img src="' + p.images[0] + '">' : '📦') + '</div><div class="product-card-info"><h5>' + p.title + '</h5><p class="product-price">' + (p.currency || '€') + (p.price || 0) + '</p><button class="btn-outline btn-xs mt-8" onclick="affiliateProduct(\'' + d.id + '\')" style="color:var(--blue);border-color:var(--blue);">🔗</button></div></div>';
    });
}

async function loadAffEvents() {
    var g = document.getElementById('affEvents');
    if (!g) return;
    var snap = await db.collection('events').where('status', '==', 'active').limit(20).get();
    if (snap.empty) { g.innerHTML = '<p class="empty-state-message">No events</p>'; return; }
    g.innerHTML = '';
    snap.forEach(function(d) {
        var e = d.data();
        g.innerHTML += '<div class="event-card" onclick="affiliateTicket(\'' + d.id + '\')"><div class="event-card-image">' + (e.banner ? '<img src="' + e.banner + '">' : '🎫') + '</div><div class="event-card-info"><h4>' + e.title + '</h4><p style="font-size:0.6rem;color:var(--blue);">2% Commission</p><p class="event-price">' + (e.currency || '€') + (e.price || 0) + '</p></div></div>';
    });
}

async function affCashout() {
    var a = STATE.userData.affiliate;
    var amt = parseFloat(prompt('Amount (€):'));
    if (!amt || amt < 1 || amt > (a.balance || 0)) return toast('Invalid', 'error');
    var pin = prompt('Enter PIN:');
    if (pin !== STATE.userData.securityPin) return toast('Invalid PIN', 'error');
    await db.collection('users').doc(STATE.user.uid).update({
        'affiliate.balance': firebase.firestore.FieldValue.increment(-amt),
        balance: firebase.firestore.FieldValue.increment(amt)
    });
    STATE.userData.affiliate.balance -= amt;
    STATE.userData.balance += amt;
    toast(formatBalance(amt) + ' added to wallet!', 'success');
    renderAffiliate();
}

// ============================================
// PROFILE
// ============================================
function renderProfile() {
    if (STATE.isGuest) {
        document.getElementById('appMainContent').innerHTML = '<div class="locked-feature"><div class="lock-icon">🔒</div><h3>Sign In Required</h3><p>Create an account or sign in to view your profile</p><button class="btn-primary btn-sm" onclick="showAuthScreen();showLoginForm();">Sign In</button><button class="btn-outline btn-sm mt-8" onclick="showAuthScreen();showRegisterForm();">Create Account</button></div>';
        return;
    }
    var d = STATE.userData;
    var html = '<div class="profile-header-section"><img class="profile-avatar-large" src="' + (d.profileImage || 'https://via.placeholder.com/80') + '"><div class="profile-name-display">' + (d.fullName || 'User') + '</div><div class="profile-username-display">@' + (d.username || 'user') + '</div>';
    html += '<div class="profile-badges-row">';
    if (d.organizer) html += '<span class="badge-pill badge-organizer">🎤 Organizer</span>';
    if (d.verified) html += '<span class="badge-pill badge-verified">✓ Verified</span>';
    if (d.hasStore) html += '<span class="badge-pill badge-store">🏪 Store</span>';
    if (d.hasService) html += '<span class="badge-pill badge-store">🛠️ Service</span>';
    if (d.affiliate) html += '<span class="badge-pill badge-affiliate">🔗 Affiliate</span>';
    html += '</div></div>';
    html += '<div class="profile-stats-row"><div class="profile-stat-item"><div class="stat-value">' + (d.followers || 0) + '</div><div class="stat-label">Followers</div></div><div class="profile-stat-item"><div class="stat-value">' + (d.following || 0) + '</div><div class="stat-label">Following</div></div><div class="profile-stat-item"><div class="stat-value">' + (d.referrals || 0) + '</div><div class="stat-label">Referrals</div></div></div>';
    html += '<div class="card-white" style="text-align:center;"><p style="font-weight:700;color:var(--purple);">' + formatBalance(d.balance || 0) + '</p><button class="btn-primary btn-sm mt-8" onclick="openDeposit()">Deposit</button> <button class="btn-outline btn-sm mt-8" onclick="openWithdraw()">Withdraw</button></div>';
    
    if (!d.hasStore) html += '<div class="card-white" style="text-align:center;margin-top:8px;"><button class="btn-primary btn-sm" onclick="openCreateStore()">Create Store</button></div>';
    else html += '<div class="card-white" style="text-align:center;margin-top:8px;"><button class="btn-primary btn-sm" onclick="viewStore(\'' + d.storeId + '\')">View Store</button></div>';
    if (!d.organizer) html += '<div class="card-white" style="text-align:center;margin-top:8px;"><button class="btn-primary btn-sm" onclick="activateOrganizer()">Become Organizer (€2)</button></div>';
    else html += '<div class="card-white" style="text-align:center;margin-top:8px;"><button class="btn-primary btn-sm" onclick="openCreateEvent()">Create Event</button></div>';
    
    html += '<div class="profile-menu-list mt-12">';
    html += '<div class="profile-menu-item" onclick="navigateTo(\'wallet\')"><i class="fas fa-wallet"></i> Wallet</div>';
    html += '<div class="profile-menu-item" onclick="navigateTo(\'orders\')"><i class="fas fa-box"></i> Orders</div>';
    html += '<div class="profile-menu-item" onclick="navigateTo(\'tickets\')"><i class="fas fa-ticket-alt"></i> Tickets</div>';
    html += '<div class="profile-menu-item" onclick="navigateTo(\'affiliate\')"><i class="fas fa-link"></i> Affiliate</div>';
    html += '<div class="profile-menu-item" onclick="openSendMoney()"><i class="fas fa-paper-plane"></i> Send Money</div>';
    html += '<div class="profile-menu-item" onclick="showTransactions()"><i class="fas fa-history"></i> Transactions</div>';
    html += '<div class="profile-menu-item" onclick="openReferral()"><i class="fas fa-users"></i> Referrals</div>';
    html += '<div class="profile-menu-item" onclick="openSecurityPin()"><i class="fas fa-shield-alt"></i> PIN</div>';
    html += '<div class="profile-menu-item" onclick="openChangePassword()"><i class="fas fa-key"></i> Change Password</div>';
    html += '<div class="profile-menu-item" onclick="openChangeProfilePic()"><i class="fas fa-camera"></i> Change Profile Picture</div>';
    html += '<div class="profile-menu-item" onclick="togglePlans()"><i class="fas fa-crown"></i> 📋 Plans <span id="plansArrow">▶</span></div>';
    html += '<div id="plansDropdown" class="hidden" style="padding:8px;">' + renderPlanCards() + '</div>';
    html += '<div class="profile-menu-item danger-item" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Logout</div>';
    html += '</div>';
    document.getElementById('appMainContent').innerHTML = html;
}

function togglePlans() {
    var dd = document.getElementById('plansDropdown');
    var arrow = document.getElementById('plansArrow');
    if (dd) {
        dd.classList.toggle('hidden');
        if (arrow) arrow.textContent = dd.classList.contains('hidden') ? '▶' : '▼';
    }
}

function renderPlanCards() {
    var plans = [
        { name: 'STARTER', price: 1, features: ['5 Listings', '10 Store Products', 'Affiliate £0.30-£50'], plan: 'starter' },
        { name: 'BUSINESS', price: 5, features: ['50 Listings', '50 Store Products', 'Affiliate £0.30-£700', 'Priority Ranking'], plan: 'business', popular: true },
        { name: 'ELITE', price: 15, features: ['Unlimited Listings', 'Unlimited Store', 'All Affiliate', 'Verified Badge', 'Dropshipping'], plan: 'elite' }
    ];
    var html = '';
    for (var i = 0; i < plans.length; i++) {
        var p = plans[i];
        html += '<div class="plan-card-mini' + (p.popular ? ' popular' : '') + '" style="position:relative;">';
        if (p.popular) html += '<span class="popular-badge">POPULAR</span>';
        html += '<h4>' + p.name + '</h4><div class="plan-price">€' + p.price + '<span style="font-size:0.6rem;">/mo</span></div><ul>';
        for (var j = 0; j < p.features.length; j++) { html += '<li>✓ ' + p.features[j] + '</li>'; }
        html += '</ul><button class="btn-primary btn-sm btn-full" onclick="subscribeToPlan(\'' + p.plan + '\',' + p.price + ')">' + (STATE.userData && STATE.userData.subscription === p.plan ? 'Current Plan' : 'Subscribe') + '</button></div>';
    }
    return html;
}

async function subscribeToPlan(plan, eurPrice) {
    var c = getUserCountry();
    var localPrice = eurPrice * c.rate;
    if (!confirm('Subscribe to ' + plan.toUpperCase() + ' for ' + c.symbol + localPrice.toFixed(2) + '/month?')) return;
    if ((STATE.userData.balance || 0) < eurPrice) return toast('Insufficient balance', 'error');
    await db.collection('users').doc(STATE.user.uid).update({
        balance: firebase.firestore.FieldValue.increment(-eurPrice),
        subscription: plan, subscriptionDate: firebase.firestore.FieldValue.serverTimestamp(),
        verified: plan === 'elite' ? true : (STATE.userData.verified || false)
    });
    STATE.userData.balance -= eurPrice;
    STATE.userData.subscription = plan;
    toast('Subscribed to ' + plan.toUpperCase() + '!', 'success');
    renderProfile();
}

async function activateOrganizer() {
    if ((STATE.userData.balance || 0) < 2) return toast('Need €2', 'error');
    await db.collection('users').doc(STATE.user.uid).update({ balance: firebase.firestore.FieldValue.increment(-2), organizer: true });
    STATE.userData.balance -= 2;
    STATE.userData.organizer = true;
    toast('Organizer activated!', 'success');
    renderProfile();
}

function renderWallet() {
    if (STATE.isGuest) {
        document.getElementById('appMainContent').innerHTML = getLockedFeature('Sign in to access your wallet');
        return;
    }
    var d = STATE.userData;
    var html = '<div class="wallet-hero-card"><div class="wallet-total-label">Total Balance</div><div class="wallet-total-amount">' + formatBalance(d ? d.balance || 0 : 0) + '</div></div>';
    html += '<div class="wallet-sub-grid">';
    html += '<div class="wallet-sub-item"><div class="sub-label">💰 Balance</div><div class="sub-amount">' + formatBalance(d ? d.balance || 0 : 0) + '</div></div>';
    html += '<div class="wallet-sub-item"><div class="sub-label">💎 Rubies</div><div class="sub-amount" style="color:var(--ruby);">' + (d ? d.rubyBalance || 0 : 0) + '</div></div>';
    html += '<div class="wallet-sub-item"><div class="sub-label">🏪 Store</div><div class="sub-amount">' + formatBalance(d ? d.storeBalance || 0 : 0) + '</div></div>';
    html += '<div class="wallet-sub-item"><div class="sub-label">🔗 Affiliate</div><div class="sub-amount" style="color:var(--blue);">' + formatBalance(d ? d.affiliateBalance || 0 : 0) + '</div></div>';
    html += '<div class="wallet-sub-item"><div class="sub-label">👥 Referral</div><div class="sub-amount" style="color:var(--gold);">' + formatBalance(d ? d.referralBalance || 0 : 0) + '</div></div>';
    html += '</div>';
    html += '<div style="display:flex;gap:8px;flex-wrap:wrap;"><button class="btn-primary btn-sm" onclick="openDeposit()">Deposit</button><button class="btn-outline btn-sm" onclick="openWithdraw()">Withdraw</button><button class="btn-outline btn-sm" onclick="openSendMoney()">Send</button><button class="btn-outline btn-sm" onclick="showTransactions()">History</button></div>';
    document.getElementById('appMainContent').innerHTML = html;
}

// ============================================
// DEPOSIT / WITHDRAW / SEND
// ============================================
function openDeposit() {
    if (!requireLogin()) return;
    var c = getUserCountry();
    var sym = c.symbol;
    var min = getMinDeposit();
    var cur = getFlwCurrency();
    var amounts = cur === 'NGN' ? [500, 1000, 2000, 5000, 10000, 20000] : [5, 10, 20, 50, 100, 200];
    var html = '<div class="modal-header-row"><h3>💳 Deposit</h3><button class="modal-close-button" onclick="closeModal()">✕</button></div>';
    html += '<p style="font-size:0.8rem;color:var(--gray-500);">Min ' + sym + min + ' • ' + cur + '</p>';
    html += '<div class="amount-chips-row">';
    for (var i = 0; i < amounts.length; i++) {
        html += '<button class="amount-chip-button" onclick="setDepAmt(' + amounts[i] + ')">' + sym + amounts[i] + '</button>';
    }
    html += '</div>';
    html += '<div class="input-group"><input type="number" id="depAmt" class="input-field" value="' + amounts[0] + '" step="0.01"></div>';
    html += '<button class="btn-primary btn-full mt-12" onclick="initDeposit()">Pay with Flutterwave</button>';
    document.getElementById('modalContent').innerHTML = html;
    showModal();
}

function setDepAmt(v) { document.getElementById('depAmt').value = v; }

function initDeposit() {
    var amt = parseFloat(document.getElementById('depAmt').value);
    var min = getMinDeposit();
    if (!amt || amt < min) return toast('Minimum ' + getUserSymbol() + min, 'error');
    var cur = getFlwCurrency();
    closeModal();
    try {
        FlutterwaveCheckout({
            public_key: FLW_PUBLIC_KEY,
            tx_ref: 'DEP-' + Date.now(),
            amount: amt,
            currency: cur,
            payment_options: 'card,banktransfer',
            customer: { email: STATE.user.email, name: STATE.userData.fullName },
            callback: async function(res) {
                if (res.status === 'successful') await completeDeposit(amt);
                else toast('Payment incomplete', 'error');
            },
            onclose: function() {},
            customizations: { title: 'CONNECT Deposit', description: 'Wallet Top-up', logo: 'https://via.placeholder.com/100/8b2fc9/fff?text=C' }
        });
    } catch(e) { toast('Payment gateway loading...', 'info'); }
}

async function completeDeposit(amt) {
    showLoading();
    var rate = getUserRate();
    var eur = amt / rate;
    await db.collection('users').doc(STATE.user.uid).update({ balance: firebase.firestore.FieldValue.increment(eur) });
    await db.collection('transactions').add({
        userId: STATE.user.uid, type: 'deposit', amount: eur,
        localAmount: amt, localCurrency: getFlwCurrency(),
        status: 'completed', createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    STATE.userData.balance += eur;
    hideLoading();
    toast('Deposited ' + formatBalance(eur) + '!', 'success');
}

function openWithdraw() {
    if (!requireLogin()) return;
    var html = '<div class="modal-header-row"><h3>💸 Withdraw</h3><button class="modal-close-button" onclick="closeModal()">✕</button></div>';
    html += '<div class="input-group"><input id="wAmt" type="number" class="input-field" placeholder="Amount (' + getUserSymbol() + ')" min="5"></div>';
    html += '<div class="input-group"><input id="wBank" class="input-field" placeholder="Bank Name"></div>';
    html += '<div class="input-group"><input id="wName" class="input-field" placeholder="Account Name"></div>';
    html += '<div class="input-group"><input id="wNum" class="input-field" placeholder="Account Number"></div>';
    html += '<label class="checkbox-label mt-8"><input type="checkbox" id="wConf"><span class="checkbox-mark"></span> Confirm</label>';
    html += '<button class="btn-primary btn-full mt-12" id="wBtn" disabled onclick="processWithdraw()">Submit</button>';
    document.getElementById('modalContent').innerHTML = html;
    document.getElementById('wConf').addEventListener('change', function() { document.getElementById('wBtn').disabled = !this.checked; });
    showModal();
}

async function processWithdraw() {
    var amt = parseFloat(document.getElementById('wAmt').value);
    var bank = document.getElementById('wBank').value.trim();
    var name = document.getElementById('wName').value.trim();
    var num = document.getElementById('wNum').value.trim();
    var rate = getUserRate();
    var eur = amt / rate;
    if (!amt || amt < 5 || eur > (STATE.userData.balance || 0)) return toast('Invalid', 'error');
    if (!bank || !name || !num) return toast('Fill details', 'error');
    closeModal();
    showLoading();
    try {
        await fetch(BASE_URL + '/withdraw', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid: STATE.user.uid, amount: eur, localAmount: amt, localCurrency: getFlwCurrency(), accountNumber: num, bankCode: bank, accountName: name })
        });
        await db.collection('users').doc(STATE.user.uid).update({ balance: firebase.firestore.FieldValue.increment(-eur) });
        STATE.userData.balance -= eur;
        hideLoading();
        toast('Submitted!', 'success');
    } catch (e) { hideLoading(); toast('Queued offline', 'info'); }
}

function openSendMoney() {
    if (!requireLogin()) return;
    var html = '<div class="modal-header-row"><h3>💸 Send Money</h3><button class="modal-close-button" onclick="closeModal()">✕</button></div>';
    html += '<div class="input-group"><input id="sUser" class="input-field" placeholder="Username"></div>';
    html += '<div class="input-group"><input id="sAmt" type="number" class="input-field" placeholder="Amount (€)" min="2"></div>';
    html += '<button class="btn-primary btn-full mt-12" onclick="processSend()">Send</button>';
    document.getElementById('modalContent').innerHTML = html;
    showModal();
}

async function processSend() {
    var un = document.getElementById('sUser').value.trim().toLowerCase();
    var amt = parseFloat(document.getElementById('sAmt').value);
    if (!un || !amt || amt < 2 || amt > (STATE.userData.balance || 0)) return toast('Invalid', 'error');
    closeModal();
    showLoading();
    var sq = await db.collection('users').where('username', '==', un).limit(1).get();
    if (sq.empty || sq.docs[0].id === STATE.user.uid) { hideLoading(); return toast('User not found', 'error'); }
    var recipientId = sq.docs[0].id;
    await db.collection('users').doc(STATE.user.uid).update({ balance: firebase.firestore.FieldValue.increment(-amt) });
    await db.collection('users').doc(recipientId).update({ balance: firebase.firestore.FieldValue.increment(amt) });
    STATE.userData.balance -= amt;
    await db.collection('transactions').add({
        userId: STATE.user.uid, type: 'sent', amount: amt,
        recipientId: recipientId, recipientName: un,
        status: 'completed', createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    await db.collection('notifications').add({
        userId: recipientId,
        message: '💸 You received ' + formatBalance(amt) + ' from ' + STATE.userData.fullName,
        read: false, createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    hideLoading();
    toast('Sent ' + formatBalance(amt) + ' to @' + un + '!', 'success');
}

// ============================================
// TRANSACTIONS
// ============================================
async function showTransactions() {
    if (!requireLogin()) return;
    showLoading('Loading transactions...');
    try {
        var snap = await db.collection('transactions').where('userId', '==', STATE.user.uid).orderBy('createdAt', 'desc').get();
        hideLoading();
        var h = '<div class="modal-header-row"><h3>📊 Transactions</h3><button class="modal-close-button" onclick="closeModal()">✕</button></div>';
        h += '<div class="txn-filters"><button class="txn-filter active" onclick="filterTxnModal(\'all\')">All</button><button class="txn-filter" onclick="filterTxnModal(\'year\')">Year</button><button class="txn-filter" onclick="filterTxnModal(\'month\')">Month</button><button class="txn-filter" onclick="filterTxnModal(\'week\')">Week</button></div>';
        h += '<div id="txnList"></div>';
        document.getElementById('modalContent').innerHTML = h;
        showModal();
        window._txnData = snap.docs;
        renderTxnList('all');
    } catch(e) { hideLoading(); toast('Error loading transactions', 'error'); }
}

function filterTxnModal(f) {
    document.querySelectorAll('.txn-filter').forEach(function(b) { b.classList.remove('active'); });
    event.target.classList.add('active');
    renderTxnList(f);
}

function renderTxnList(filter) {
    var c = document.getElementById('txnList');
    if (!c || !window._txnData) return;
    var now = new Date();
    var filtered = window._txnData;
    if (filter === 'year') {
        filtered = window._txnData.filter(function(d) { var dt = d.data().createdAt ? d.data().createdAt.toDate() : null; return dt && dt.getFullYear() === now.getFullYear(); });
    } else if (filter === 'month') {
        filtered = window._txnData.filter(function(d) { var dt = d.data().createdAt ? d.data().createdAt.toDate() : null; return dt && dt.getFullYear() === now.getFullYear() && dt.getMonth() === now.getMonth(); });
    } else if (filter === 'week') {
        var weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = window._txnData.filter(function(d) { var dt = d.data().createdAt ? d.data().createdAt.toDate() : null; return dt && dt >= weekAgo; });
    }
    if (filtered.length === 0) { c.innerHTML = '<p class="empty-state-message">No transactions</p>'; return; }
    c.innerHTML = '';
    filtered.forEach(function(d) {
        var t = d.data();
        var isIn = ['deposit', 'reward', 'sale_completed', 'affiliate_cashout', 'refund'].indexOf(t.type) !== -1;
        var timeStr = t.createdAt ? t.createdAt.toDate().toLocaleString() : 'N/A';
        c.innerHTML += '<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--gray-100);"><div><strong>' + t.type + '</strong><br><small>' + timeStr + '</small></div><span style="color:' + (isIn ? 'var(--green)' : 'var(--red)') + ';font-weight:700;">' + (isIn ? '+' : '-') + formatBalance(Math.abs(t.amount || 0)) + '</span></div>';
    });
}

// ============================================
// REFERRAL
// ============================================
function openReferral() {
    if (!requireLogin()) return;
    var d = STATE.userData;
    var link = 'https://connect.app/ref/' + (d ? d.username : '');
    var html = '<div class="modal-header-row"><h3>👥 Referrals</h3><button class="modal-close-button" onclick="closeModal()">✕</button></div>';
    html += '<div style="text-align:center;padding:16px;background:var(--gray-50);border-radius:12px;">';
    html += '<div style="font-size:2rem;font-weight:800;color:var(--purple);">' + (d ? d.username : 'N/A') + '</div>';
    html += '<p>' + (d ? d.referrals || 0 : 0) + ' referrals</p>';
    html += '<p style="color:var(--gold);">Referral Balance: ' + formatBalance(d ? d.referralBalance || 0 : 0) + '</p>';
    if ((d ? d.referralBalance || 0 : 0) >= 0.30) {
        html += '<button class="btn-primary btn-sm mt-8" onclick="withdrawReferral()">Withdraw</button>';
    }
    html += '</div>';
    html += '<div style="background:var(--gray-100);padding:10px;border-radius:8px;word-break:break-all;font-size:0.7rem;margin:8px 0;">' + link + '</div>';
    html += renderShareButtons(link, 'Join CONNECT');
    html += '<button class="btn-primary btn-full mt-8" onclick="copyRef()">Copy Link</button>';
    document.getElementById('modalContent').innerHTML = html;
    showModal();
}

function copyRef() {
    navigator.clipboard.writeText('https://connect.app/ref/' + (STATE.userData ? STATE.userData.username : '')).then(function() { toast('Copied!', 'success'); });
}

async function withdrawReferral() {
    var bal = STATE.userData ? STATE.userData.referralBalance || 0 : 0;
    if (bal < 0.30) return toast('Minimum €0.30', 'error');
    await db.collection('users').doc(STATE.user.uid).update({ referralBalance: 0, balance: firebase.firestore.FieldValue.increment(bal) });
    STATE.userData.balance += bal;
    STATE.userData.referralBalance = 0;
    toast(formatBalance(bal) + ' transferred!', 'success');
    closeModal();
}

// ============================================
// SECURITY
// ============================================
function openSecurityPin() {
    var html = '<div class="modal-header-row"><h3>🔒 Security PIN</h3><button class="modal-close-button" onclick="closeModal()">✕</button></div>';
    html += '<div style="display:flex;gap:10px;justify-content:center;margin:16px 0;">';
    for (var i = 1; i <= 4; i++) {
        html += '<input type="password" class="pin-input-cell" maxlength="1" id="pin' + i + '" oninput="pinJump(this,\'pin' + (i + 1) + '\')">';
    }
    html += '</div><button class="btn-primary btn-full" onclick="savePin()">Save PIN</button>';
    document.getElementById('modalContent').innerHTML = html;
    showModal();
}

function pinJump(el, next) {
    if (el.value.length === 1) { var n = document.getElementById(next); if (n) n.focus(); }
}

async function savePin() {
    var pin = '';
    for (var i = 1; i <= 4; i++) { var el = document.getElementById('pin' + i); pin += el ? el.value : ''; }
    if (pin.length !== 4) return toast('4 digits', 'error');
    await db.collection('users').doc(STATE.user.uid).update({ securityPin: pin });
    STATE.userData.securityPin = pin;
    closeModal();
    toast('PIN saved!', 'success');
}

function openChangePassword() {
    var html = '<div class="modal-header-row"><h3>🔑 Change Password</h3><button class="modal-close-button" onclick="closeModal()">✕</button></div>';
    html += '<div class="input-group"><input id="newPw" type="password" class="input-field" placeholder="New Password"></div>';
    html += '<div class="input-group"><input id="newPw2" type="password" class="input-field" placeholder="Confirm"></div>';
    html += '<button class="btn-primary btn-full mt-12" onclick="changePassword()">Change</button>';
    document.getElementById('modalContent').innerHTML = html;
    showModal();
}

async function changePassword() {
    var pw = document.getElementById('newPw').value;
    var cp = document.getElementById('newPw2').value;
    if (!pw || pw.length < 6) return toast('Min 6 characters', 'error');
    if (pw !== cp) return toast('Mismatch', 'error');
    var user = auth.currentUser;
    if (user) await user.updatePassword(pw);
    toast('Password changed!', 'success');
    closeModal();
}

function openChangeProfilePic() {
    var html = '<div class="modal-header-row"><h3>📷 Change Profile Picture</h3><button class="modal-close-button" onclick="closeModal()">✕</button></div>';
    html += '<div class="input-group"><input id="newPfp" type="file" accept="image/*"></div>';
    html += '<button class="btn-primary btn-full mt-12" onclick="changePfp()">Upload</button>';
    document.getElementById('modalContent').innerHTML = html;
    showModal();
}

async function changePfp() {
    var f = document.getElementById('newPfp').files[0];
    if (!f) return toast('Select image', 'error');
    showLoading();
    var url = await uploadToCloud(f);
    await db.collection('users').doc(STATE.user.uid).update({ profileImage: url });
    STATE.userData.profileImage = url;
    updateHeaderUI();
    hideLoading();
    toast('Profile picture updated!', 'success');
    closeModal();
}

// ============================================
// CREATE EVENT
// ============================================
function openCreateEvent() {
    if (!requireLogin()) return;
    var html = '<div class="modal-header-row"><h3>🎉 Create Event</h3><button class="modal-close-button" onclick="closeModal()">✕</button></div>';
    html += '<div class="input-group"><input id="evTitle" class="input-field" placeholder="Event Title"></div>';
    html += '<div class="input-group"><input id="evVenue" class="input-field" placeholder="Venue"></div>';
    html += '<div class="input-group"><input id="evDate" type="date" class="input-field"></div>';
    html += '<div class="input-group"><input id="evTime" type="time" class="input-field"></div>';
    html += '<div class="input-group"><input id="evPrice" type="number" class="input-field" placeholder="Ticket Price (€)" step="0.01"></div>';
    html += '<div class="input-group"><select id="evCur" class="input-field select-field"><option value="EUR">EUR (€)</option><option value="USD">USD ($)</option><option value="GBP">GBP (£)</option><option value="NGN">NGN (₦)</option></select></div>';
    html += '<div class="input-group"><input id="evWA" class="input-field" placeholder="WhatsApp"></div>';
    html += '<div class="input-group"><input id="evBanner" type="file" accept="image/*"></div>';
    html += '<button class="btn-primary btn-full mt-12" onclick="createEvent()">Create Event</button>';
    document.getElementById('modalContent').innerHTML = html;
    showModal();
}

async function createEvent() {
    var t = document.getElementById('evTitle').value.trim();
    var v = document.getElementById('evVenue').value.trim();
    var d = document.getElementById('evDate').value;
    var tm = document.getElementById('evTime').value;
    var p = parseFloat(document.getElementById('evPrice').value);
    var cur = document.getElementById('evCur').value;
    var wa = document.getElementById('evWA').value.trim();
    var bf = document.getElementById('evBanner').files[0];
    if (!t || !d || !p) return toast('Fill required fields (Title, Date, Price)', 'error');
    closeModal();
    showLoading('Creating event...');
    try {
        var banner = '';
        if (bf) banner = await uploadToCloud(bf);
        await db.collection('events').add({
            title: t, venue: v, date: d, time: tm, price: p, currency: cur,
            organizerId: STATE.user.uid, organizerName: STATE.userData.fullName,
            organizerWhatsapp: wa, banner: banner, country: STATE.country,
            status: 'active', views: 0, ticketsSold: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        hideLoading();
        toast('Event created! 🎉', 'success');
        navigateTo('events');
    } catch (e) { hideLoading(); toast('Failed to create event', 'error'); }
}

// ============================================
// QR SCANNER
// ============================================
function openQRScanner() {
    document.getElementById('qrScannerModal').classList.remove('hidden');
    setTimeout(function() {
        if (STATE.qrScanner) STATE.qrScanner.stop();
        STATE.qrScanner = new Html5Qrcode('qrReader');
        STATE.qrScanner.start(
            { facingMode: 'environment' }, { fps: 10, qrbox: 250 },
            function(decoded) {
                STATE.qrScanner.stop();
                document.getElementById('qrScannerModal').classList.add('hidden');
                validateQR(decoded);
            },
            function() {}
        ).catch(function() { toast('Camera error', 'error'); closeQRScanner(); });
    }, 500);
}

function closeQRScanner() {
    if (STATE.qrScanner) { STATE.qrScanner.stop(); STATE.qrScanner = null; }
    document.getElementById('qrScannerModal').classList.add('hidden');
}

async function validateQR(data) {
    var snap = await db.collection('tickets').where('qrData', '==', data).where('status', '==', 'active').get();
    if (snap.empty) return toast('Invalid ticket', 'error');
    var t = snap.docs[0].data();
    await snap.docs[0].ref.update({ status: 'used' });
    var html = '<div class="scan-result"><div class="check-icon">✅</div><h2>Entry Approved!</h2>';
    html += '<p><strong>' + (t.userName || 'Attendee') + '</strong></p><p>' + t.eventTitle + '</p>';
    html += '<button class="btn-primary btn-full mt-8" onclick="closeModal()">Close</button></div>';
    document.getElementById('modalContent').innerHTML = html;
    showModal();
}

// ============================================
// MODAL / TOAST / LOADING
// ============================================
function showModal() {
    document.getElementById('modalOverlay').classList.remove('hidden');
    document.getElementById('modalContainer').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.add('hidden');
    document.getElementById('modalContainer').classList.add('hidden');
}

function toast(msg, type) {
    var el = document.createElement('div');
    el.className = 'toast-message toast-' + (type || 'info');
    el.textContent = msg;
    document.getElementById('toastContainer').appendChild(el);
    setTimeout(function() { el.remove(); }, 3000);
}

function showLoading(t) {
    document.getElementById('loadingText').textContent = t || 'Loading...';
    document.getElementById('loadingOverlay').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.add('hidden');
}

// ============================================
// NOTIFICATIONS
// ============================================
function listenNotifications() {
    if (!STATE.user) return;
    db.collection('notifications').where('userId', '==', STATE.user.uid).where('read', '==', false)
        .onSnapshot(function(snap) {
            var badge = document.getElementById('notificationBadge');
            if (badge) {
                var c = snap.size;
                badge.textContent = c > 99 ? '99+' : c;
                badge.classList.toggle('hidden', c === 0);
            }
        }, function(err) { console.error('Notification error:', err); });
}

function toggleNotifs() {
    var panel = document.getElementById('notificationPanel');
    panel.classList.toggle('hidden');
    if (!panel.classList.contains('hidden') && STATE.user) {
        db.collection('notifications').where('userId', '==', STATE.user.uid).orderBy('createdAt', 'desc').limit(20).get()
            .then(function(snap) {
                var list = document.getElementById('notificationList');
                if (snap.empty) { list.innerHTML = '<p class="empty-state-message">No notifications</p>'; return; }
                list.innerHTML = '';
                snap.forEach(function(d) {
                    var n = d.data();
                    list.innerHTML += '<div class="notification-item ' + (n.read ? '' : 'unread') + '" onclick="markNotif(\'' + d.id + '\')"><div class="notif-message">' + n.message + '</div><div class="notif-time">' + (n.createdAt ? n.createdAt.toDate().toLocaleString() : '') + '</div></div>';
                });
            });
    } else if (!STATE.user) {
        document.getElementById('notificationList').innerHTML = '<p class="empty-state-message">Sign in to see notifications</p>';
    }
}

async function markNotif(id) { 
    await db.collection('notifications').doc(id).update({ read: true }); 
}

// ============================================
// CART
// ============================================
function renderCart() {
    if (STATE.cart.length === 0) {
        document.getElementById('appMainContent').innerHTML = '<p class="empty-state-message">Cart empty</p>';
        return;
    }
    document.getElementById('appMainContent').innerHTML = '<p class="empty-state-message">Use Buy Now on each product</p>';
    updateCartBadge();
}

// ============================================
// EVENT LISTENERS
// ============================================
document.getElementById('onboardingNext').addEventListener('click', nextOnboarding);
document.getElementById('onboardingSkip').addEventListener('click', skipOnboarding);
document.getElementById('loginSubmitButton').addEventListener('click', login);
document.getElementById('googleLoginButton').addEventListener('click', loginGoogle);
document.getElementById('googleRegisterButton').addEventListener('click', loginGoogle);
document.getElementById('appleLoginButton').addEventListener('click', loginApple);
document.getElementById('appleRegisterButton').addEventListener('click', loginApple);
document.getElementById('registerSubmitButton').addEventListener('click', register);
document.getElementById('resetPasswordButton').addEventListener('click', resetPassword);
document.getElementById('forgotPasswordLink').addEventListener('click', showForgotPasswordForm);
document.getElementById('showRegisterLink').addEventListener('click', showRegisterForm);
document.getElementById('showLoginLink').addEventListener('click', showLoginForm);
document.getElementById('backToLoginLink').addEventListener('click', showLoginForm);
document.getElementById('headerNotificationBtn').addEventListener('click', toggleNotifs);
document.getElementById('headerCartBtn').addEventListener('click', function() { navigateTo('cart'); });
document.getElementById('loginPwToggle').addEventListener('click', function() { var pw = document.getElementById('loginPassword'); pw.type = pw.type === 'password' ? 'text' : 'password'; });
document.getElementById('regAccountType').addEventListener('change', toggleSvcCat);
document.getElementById('regCountrySearch').addEventListener('input', filterCountryDropdown);
document.getElementById('regStateSearch').addEventListener('input', filterStateDropdown);
document.getElementById('regProfileImage').addEventListener('change', previewProfileImage);
document.getElementById('modalOverlay').addEventListener('click', closeModal);
document.getElementById('closeNotificationPanel').addEventListener('click', toggleNotifs);

document.addEventListener('click', function(e) {
    if (!e.target.closest('.search-group')) {
        document.querySelectorAll('.search-dropdown').forEach(function(dd) { dd.classList.remove('active'); });
    }
});

console.log('✅ CONNECT App Ready - No Firewall Mode');
console.log('👤 Guest browsing enabled | 🔐 Login only for protected actions');
console.log('🍎 Apple Sign-In added');