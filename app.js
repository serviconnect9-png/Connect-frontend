/* ============================================
   CONNECT APP - Complete Production JavaScript
   Jobs | Stores | Services | Affiliate | Connect Jobs
   All Features Working | Production Ready
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
const APP_BASE_URL = 'https://connectapp-woad.vercel.app/';

firebase.initializeApp(FIREBASE_CONFIG);
const auth = firebase.auth();
const db = firebase.firestore();
db.enablePersistence({ synchronizeTabs: true }).catch(function(err) {
    console.log('Offline persistence error:', err);
});

const STATE = {
    user: null,
    userData: null,
    page: 'home',
    country: 'GB',
    cart: [],
    currentStoreId: null,
    currentServiceId: null,
    currentProductId: null,
    currentJobId: null,
    onboardingStep: 0,
    productGalleryIndex: 0
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
// APP INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('CONNECT App Starting - Production Ready');
    loadCartFromStorage();
    setTimeout(checkAuthState, 1500);
});

function checkAuthState() {
    auth.onAuthStateChanged(async function(user) {
        document.getElementById('splashScreen').classList.add('hidden');
        if (user) {
            STATE.user = user;
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
                    showMainApp();
                    navigateTo('home');
                    showLoginAd();
                    checkPlanExpiry();
                    checkEscrowOrders();
                    checkConnectJobMonthly();
                } else {
                    showAuthScreen();
                    showLoginForm();
                }
            } catch(e) {
                console.error('Auth check error:', e);
                showAuthScreen();
                showLoginForm();
            }
        } else {
            STATE.user = null;
            STATE.userData = null;
            if (!localStorage.getItem('cn_onboarded')) {
                showOnboardingScreen();
            } else {
                showAuthScreen();
                showLoginForm();
            }
        }
    });
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
                    userId: STATE.user.uid,
                    type: 'refund',
                    amount: o.total || 0,
                    itemName: o.itemName,
                    orderId: d.id,
                    status: 'completed',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                await db.collection('notifications').add({
                    userId: STATE.user.uid,
                    message: '💰 Auto-refund: €' + (o.total || 0).toFixed(2) + ' returned for "' + o.itemName + '" (3 days without delivery)',
                    read: false,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                if (o.sellerId) {
                    await db.collection('notifications').add({
                        userId: o.sellerId,
                        message: '⚠️ Order auto-refunded: "' + o.itemName + '" was not delivered within 3 days.',
                        read: false,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
            }
        });
    } catch (e) {
        console.error('Escrow check error:', e);
    }
}

// ============================================
// CONNECT JOB MONTHLY CHECK
// ============================================
async function checkConnectJobMonthly() {
    if (!STATE.userData || !STATE.userData.connectJob) return;
    var cj = STATE.userData.connectJob;
    if (!cj.active) return;
    try {
        var now = new Date();
        var monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        var monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        var referralsSnap = await db.collection('users')
            .where('referredByJob', '==', STATE.userData.username)
            .where('createdAt', '>=', firebase.firestore.Timestamp.fromDate(monthStart))
            .where('createdAt', '<=', firebase.firestore.Timestamp.fromDate(monthEnd))
            .get();
        var subscribedCount = 0;
        referralsSnap.forEach(function(d) {
            if (d.data().subscription) subscribedCount++;
        });
        var currentMonthRefs = cj.monthReferrals || 0;
        if (subscribedCount > currentMonthRefs) {
            await db.collection('users').doc(STATE.user.uid).update({
                'connectJob.monthReferrals': subscribedCount
            });
            STATE.userData.connectJob.monthReferrals = subscribedCount;
            var oldLevel = cj.level || 0;
            var newLevel = oldLevel;
            var pay = 0;
            if (subscribedCount >= 1500) { newLevel = 3; pay = 200; }
            else if (subscribedCount >= 500) { newLevel = 2; pay = 50; }
            else if (subscribedCount >= 100) { newLevel = 1; pay = 20; }
            else if (subscribedCount >= 80) { newLevel = 0; pay = 15; }
            if (now.getDate() >= 15 && !cj.paidThisMonth && pay > 0 && subscribedCount >= 80) {
                var rate = getUserRate();
                await db.collection('users').doc(STATE.user.uid).update({
                    balance: firebase.firestore.FieldValue.increment(pay),
                    'connectJob.paidThisMonth': true,
                    'connectJob.level': newLevel
                });
                STATE.userData.balance = (STATE.userData.balance || 0) + pay;
                STATE.userData.connectJob.level = newLevel;
                STATE.userData.connectJob.paidThisMonth = true;
                await db.collection('notifications').add({
                    userId: STATE.user.uid,
                    message: '💼 Connect Job Pay: €' + pay.toFixed(2) + ' for ' + subscribedCount + ' referrals. Level ' + newLevel + '!',
                    read: false,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                await db.collection('transactions').add({
                    userId: STATE.user.uid,
                    type: 'connect_job_pay',
                    amount: pay,
                    status: 'completed',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
            if (newLevel > oldLevel && newLevel > 0) {
                await db.collection('notifications').add({
                    userId: STATE.user.uid,
                    message: '🎉 Promoted to Level ' + newLevel + ' Connect Job! ' + subscribedCount + ' referrals.',
                    read: false,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
        }
        if (now.getDate() === 1) {
            var prevMonthRefs = cj.monthReferrals || 0;
            if (prevMonthRefs < 80 && cj.active) {
                if (!cj.standbyMonths) cj.standbyMonths = 0;
                await db.collection('users').doc(STATE.user.uid).update({
                    'connectJob.standbyMonths': firebase.firestore.FieldValue.increment(1),
                    'connectJob.monthReferrals': 0,
                    'connectJob.paidThisMonth': false
                });
                STATE.userData.connectJob.standbyMonths = (STATE.userData.connectJob.standbyMonths || 0) + 1;
                STATE.userData.connectJob.monthReferrals = 0;
                STATE.userData.connectJob.paidThisMonth = false;
                if (STATE.userData.connectJob.standbyMonths >= 2) {
                    await db.collection('notifications').add({
                        userId: STATE.user.uid,
                        message: '⚠️ Connect Job: 2 months below target. Account on standby.',
                        read: false,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
            } else {
                var standbyMonths = cj.standbyMonths || 0;
                if (standbyMonths > 0) {
                    var totalPay = 0;
                    for (var i = 0; i < standbyMonths; i++) {
                        var sp = cj.level === 3 ? 200 : cj.level === 2 ? 50 : cj.level === 1 ? 20 : 15;
                        totalPay += sp;
                    }
                    if (totalPay > 0) {
                        await db.collection('users').doc(STATE.user.uid).update({
                            balance: firebase.firestore.FieldValue.increment(totalPay)
                        });
                        STATE.userData.balance = (STATE.userData.balance || 0) + totalPay;
                    }
                    await db.collection('users').doc(STATE.user.uid).update({
                        'connectJob.standbyMonths': 0,
                        'connectJob.monthReferrals': 0,
                        'connectJob.paidThisMonth': true
                    });
                    STATE.userData.connectJob.standbyMonths = 0;
                    STATE.userData.connectJob.monthReferrals = 0;
                    if (totalPay > 0) {
                        await db.collection('notifications').add({
                            userId: STATE.user.uid,
                            message: '💰 Backpay for ' + standbyMonths + ' standby months: €' + totalPay.toFixed(2),
                            read: false,
                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                    }
                } else {
                    await db.collection('users').doc(STATE.user.uid).update({
                        'connectJob.monthReferrals': 0,
                        'connectJob.paidThisMonth': false
                    });
                    STATE.userData.connectJob.monthReferrals = 0;
                    STATE.userData.connectJob.paidThisMonth = false;
                }
            }
        }
    } catch(e) {
        console.error('Connect job check error:', e);
    }
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
            content.innerHTML = '<img src="https://via.placeholder.com/350x180/8b2fc9/ffffff?text=CONNECT" style="width:100%;border-radius:16px 16px 0 0;"><div class="ad-text"><h3>Welcome to CONNECT</h3><p>Discover jobs, services, stores & more!</p></div>';
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
                subscription: null,
                subscriptionDate: null
            });
            STATE.userData.subscription = null;
            await db.collection('notifications').add({
                userId: STATE.user.uid,
                message: 'Your plan has expired. Subscribe to continue using premium features.',
                read: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
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
                message: '€' + amt + ' deducted from ' + s + ' for plan renewal.',
                read: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
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
    showAuthScreen();
    showLoginForm();
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
    if (!id || !pw) return toast('Please fill all fields', 'error');
    showLoading('Signing in...');
    try {
        var email = id;
        if (id.indexOf('@') === -1) {
            var snap = await db.collection('users').where('username', '==', id.toLowerCase()).limit(1).get();
            if (snap.empty) {
                hideLoading();
                return toast('Username not found', 'error');
            }
            email = snap.docs[0].data().email;
        }
        await auth.signInWithEmailAndPassword(email, pw);
        hideLoading();
        toast('Welcome back! 👋', 'success');
    } catch (e) {
        hideLoading();
        console.error('Login error:', e);
        if (e.code === 'auth/wrong-password') toast('Wrong password', 'error');
        else if (e.code === 'auth/user-not-found') toast('Account not found', 'error');
        else if (e.code === 'auth/invalid-email') toast('Invalid email', 'error');
        else if (e.code === 'auth/invalid-credential') toast('Invalid credentials', 'error');
        else toast('Login failed. Check your credentials.', 'error');
    }
}

async function loginGoogle() {
    showLoading('Connecting to Google...');
    try {
        var provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        var result = await auth.signInWithPopup(provider);
        var user = result.user;
        var doc = await db.collection('users').doc(user.uid).get();
        if (!doc.exists) {
            await db.collection('users').doc(user.uid).set({
                uid: user.uid,
                fullName: user.displayName || 'User',
                username: (user.email.split('@')[0] + Math.random().toString(36).substring(2, 5)).toLowerCase(),
                email: user.email,
                country: 'GB',
                state: '',
                accountType: 'customer',
                profileImage: user.photoURL || '',
                balance: 0,
                rewards: 0,
                rubyBalance: 0,
                referrals: 0,
                followers: 0,
                following: 0,
                verified: false,
                organizer: false,
                plan: 'free',
                hasStore: false,
                storeId: '',
                hasService: false,
                serviceId: '',
                affiliate: null,
                storeBalance: 0,
                affiliateBalance: 0,
                referralBalance: 0,
                referralCode: user.email.split('@')[0].toLowerCase(),
                loyalty: { points: 50, level: 'Bronze' },
                securityPin: '',
                socialLinks: {},
                connectJob: null,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        hideLoading();
        toast('Welcome! 👋', 'success');
    } catch (e) {
        hideLoading();
        console.error('Google login error:', e);
        if (e.code !== 'auth/popup-closed-by-user') {
            if (e.code === 'auth/popup-blocked') toast('Pop-up blocked. Please allow pop-ups.', 'error');
            else toast('Google sign-in failed. Try again.', 'error');
        }
    }
}

async function loginApple() {
    showLoading('Connecting to Apple...');
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
                uid: user.uid,
                fullName: displayName,
                username: ('apple' + Math.random().toString(36).substring(2, 6)).toLowerCase(),
                email: user.email || '',
                country: 'GB',
                state: '',
                accountType: 'customer',
                profileImage: user.photoURL || '',
                balance: 0,
                rewards: 0,
                rubyBalance: 0,
                referrals: 0,
                followers: 0,
                following: 0,
                verified: false,
                organizer: false,
                plan: 'free',
                hasStore: false,
                storeId: '',
                hasService: false,
                serviceId: '',
                affiliate: null,
                storeBalance: 0,
                affiliateBalance: 0,
                referralBalance: 0,
                referralCode: 'APPLE' + Math.random().toString(36).substring(2, 5).toUpperCase(),
                loyalty: { points: 50, level: 'Bronze' },
                securityPin: '',
                socialLinks: {},
                connectJob: null,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        hideLoading();
        toast('Welcome! 👋', 'success');
    } catch (e) {
        hideLoading();
        console.error('Apple login error:', e);
        if (e.code !== 'auth/popup-closed-by-user') {
            toast('Apple sign-in failed. Try again.', 'error');
        }
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

    if (!fn || !un || !em || !pw || !at) return toast('Please fill all required fields', 'error');
    if (pw !== cp) return toast('Passwords do not match', 'error');
    if (pw.length < 6) return toast('Password must be at least 6 characters', 'error');
    if (!ta) return toast('Please agree to the terms', 'error');

    showLoading('Creating account...');
    try {
        var uq = await db.collection('users').where('username', '==', un).get();
        if (!uq.empty) { hideLoading(); return toast('Username already taken', 'error'); }

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
                    var rc = findCountry(refData.country || 'GB');
                    var convertedReward = reward * (rc ? rc.rate : 1);
                    await db.collection('users').doc(refId).update({
                        referralBalance: firebase.firestore.FieldValue.increment(convertedReward)
                    });
                    await db.collection('notifications').add({
                        userId: refId,
                        message: 'You earned ' + (rc ? rc.symbol : '€') + convertedReward.toFixed(2) + ' for 10 referrals!',
                        read: false,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
                if (refData.connectJob && refData.connectJob.active) {
                    await db.collection('users').doc(uc.user.uid).update({
                        referredByJob: refData.username
                    });
                    await db.collection('users').doc(refId).update({
                        rubyBalance: firebase.firestore.FieldValue.increment(5)
                    });
                    STATE.userData = STATE.userData || {};
                    STATE.userData.rubyBalance = (STATE.userData.rubyBalance || 0) + 5;
                }
            }
        }

        await db.collection('users').doc(uc.user.uid).set({
            uid: uc.user.uid,
            fullName: fn,
            username: un,
            email: em,
            country: cc || 'GB',
            state: st || '',
            accountType: at,
            serviceCategory: sc,
            profileImage: pfp,
            balance: 0,
            rewards: 0,
            rubyBalance: 0,
            referrals: 0,
            followers: 0,
            following: 0,
            verified: false,
            organizer: false,
            plan: 'free',
            hasStore: false,
            storeId: '',
            hasService: false,
            serviceId: '',
            affiliate: null,
            storeBalance: 0,
            affiliateBalance: 0,
            referralBalance: 0,
            referralCode: un,
            loyalty: { points: 50, level: 'Bronze' },
            securityPin: '',
            socialLinks: {},
            connectJob: null,
            referredByJob: ref || null,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        hideLoading();
        toast('Account created! 🎉', 'success');
    } catch (e) {
        hideLoading();
        console.error('Registration error:', e);
        if (e.code === 'auth/email-already-in-use') toast('Email already registered', 'error');
        else if (e.code === 'auth/invalid-email') toast('Invalid email address', 'error');
        else if (e.code === 'auth/weak-password') toast('Password is too weak', 'error');
        else toast('Registration failed. Try again.', 'error');
    }
}

async function resetPassword() {
    var em = document.getElementById('resetPasswordEmail').value.trim();
    if (!em) return toast('Please enter your email', 'error');
    showLoading('Sending reset link...');
    try {
        await auth.sendPasswordResetEmail(em);
        hideLoading();
        toast('Reset link sent to your email!', 'success');
        showLoginForm();
    } catch (e) {
        hideLoading();
        console.error('Reset error:', e);
        toast('Failed to send reset link', 'error');
    }
}

async function logout() {
    await auth.signOut();
    STATE.user = null;
    STATE.userData = null;
    document.getElementById('mainApp').classList.add('hidden');
    showAuthScreen();
    showLoginForm();
    toast('Logged out', 'info');
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
    if (!STATE.user && page !== 'home') {
        return toast('Please login first', 'error');
    }
    STATE.page = page;
    document.querySelectorAll('.bottom-nav-button').forEach(function(b) {
        b.classList.toggle('active', b.dataset.page === page);
    });
    var pages = {
        home: renderHome,
        jobs: renderJobs,
        connectJobs: renderConnectJobs,
        services: renderServices,
        stores: renderStores,
        affiliate: renderAffiliate,
        profile: renderProfile,
        wallet: renderWallet,
        cart: renderCart,
        orders: renderOrders
    };
    if (pages[page]) {
        try {
            pages[page]();
        } catch(e) {
            console.error('Page render error:', page, e);
            document.getElementById('appMainContent').innerHTML = '<p class="empty-state-message">Error loading page. Please try again.</p>';
        }
    }
    var main = document.getElementById('appMainContent');
    if (main) main.scrollTop = 0;
}

// ============================================
// HOME PAGE
// ============================================
function renderHome() {
    var d = STATE.userData;
    var bal = d ? (d.balance || 0) : 0;
    var rub = d ? (d.rubyBalance || 0) : 0;
    var fn = d && d.fullName ? d.fullName.split(' ')[0] : 'User';
    var hour = new Date().getHours();
    var greet = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
    var balanceDisplay = formatBalance(bal);
    var countryName = getUserCountry().name;
    var countryFlag = getUserCountry().code;

    var html = '';
    html += '<div class="card-greeting">';
    html += '<div>';
    html += '<p style="opacity:0.7;font-size:0.75rem;">' + greet + '</p>';
    html += '<span class="country-badge">📍 ' + countryName + ' (' + countryFlag + ')</span>';
    html += '<h2>' + fn + ' 👋</h2>';
    html += '<p style="margin-top:6px;"><span class="balance-amount">' + balanceDisplay + '</span></p>';
    html += '<p class="balance-sub">💎 ' + rub + ' Rubies</p></div>';
    html += '<div class="card-greeting-actions"><button onclick="openDeposit()">+ Deposit</button><button onclick="openWithdraw()">- Withdraw</button></div>';
    html += '</div>';

    html += '<div class="section-header"><h3>💼 Latest Jobs</h3><button class="section-link" onclick="navigateTo(\'jobs\')">See All</button></div>';
    html += '<div class="horizontal-scroll" id="latestJobs"><p class="empty-state-message">Loading...</p></div>';

    html += '<div class="section-header"><h3>🛠️ Top Services</h3><button class="section-link" onclick="navigateTo(\'services\')">See All</button></div>';
    html += '<div class="horizontal-scroll" id="topServices"><p class="empty-state-message">Loading...</p></div>';

    html += '<div class="section-header"><h3>🏪 Featured Stores</h3><button class="section-link" onclick="navigateTo(\'stores\')">See All</button></div>';
    html += '<div class="horizontal-scroll" id="featuredStores"><p class="empty-state-message">Loading...</p></div>';

    document.getElementById('appMainContent').innerHTML = html;

    loadLatestJobs();
    loadTopServices();
    loadFeaturedStores();
}

async function loadLatestJobs() {
    var c = document.getElementById('latestJobs');
    if (!c) return;
    try {
        var twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
        var snap = await db.collection('jobs')
            .where('status', '==', 'active')
            .where('country', '==', STATE.country)
            .where('createdAt', '>=', firebase.firestore.Timestamp.fromDate(twoDaysAgo))
            .orderBy('createdAt', 'desc')
            .limit(8)
            .get();
        if (snap.empty) { c.innerHTML = '<p class="empty-state-message">No jobs in your country</p>'; return; }
        c.innerHTML = '';
        snap.forEach(function(d) {
            var j = d.data();
            var genderBadge = j.gender === 'male' ? 'gender-male' : j.gender === 'female' ? 'gender-female' : 'gender-any';
            c.innerHTML += '<div class="job-card" style="min-width:240px;flex-shrink:0;scroll-snap-align:start;" onclick="viewJob(\'' + d.id + '\')">' +
                '<div class="job-card-header"><span class="job-card-title">' + (j.title || 'Job') + '</span>' +
                '<span class="job-card-amount">' + (j.currency || '€') + (j.amount || 0) + '</span></div>' +
                '<div class="job-card-meta"><span>📍 ' + (j.location || 'N/A') + '</span><span class="' + genderBadge + ' job-gender-badge">' + (j.gender || 'Any') + '</span></div>' +
                '<div class="job-card-desc">' + (j.description || '').substring(0, 80) + '...</div>' +
                '<div class="job-card-footer"><span>👤 ' + (j.applicants || 0) + '/' + (j.maxApplicants || 1) + '</span><span>' + (j.createdAt ? timeAgo(j.createdAt.toDate()) : '') + '</span></div></div>';
        });
    } catch (e) {
        console.error('Jobs load error:', e);
        c.innerHTML = '<p class="empty-state-message">No jobs available</p>';
    }
}

async function loadTopServices() {
    var c = document.getElementById('topServices');
    if (!c) return;
    try {
        var snap = await db.collection('services').where('status', '==', 'active').where('country', '==', STATE.country).limit(8).get();
        if (snap.empty) { c.innerHTML = '<p class="empty-state-message">No services in your country</p>'; return; }
        c.innerHTML = '';
        snap.forEach(function(d) {
            var s = d.data();
            c.innerHTML += '<div class="service-card" style="min-width:200px;flex-shrink:0;scroll-snap-align:start;" onclick="viewService(\'' + d.id + '\')">' +
                '<img class="service-card-image" src="' + (s.profileImage || 'https://via.placeholder.com/60') + '">' +
                '<div class="service-card-info"><h4>' + (s.name || 'Service') + '</h4><p>' + (s.category || 'General') + '</p>' +
                '<div class="service-card-stats"><span>👥 ' + (s.followers || 0) + '</span><span>⭐ ' + (s.rating || 'New') + '</span></div></div></div>';
        });
    } catch (e) {
        console.error('Services load error:', e);
        c.innerHTML = '<p class="empty-state-message">No services available</p>';
    }
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
            c.innerHTML += '<div class="store-card" onclick="viewStore(\'' + d.id + '\')">' +
                '<div class="store-card-image">' + (s.image ? '<img src="' + s.image + '">' : '🏪') + '</div>' +
                '<div class="store-card-info"><h4>' + (s.name || 'Store') + '</h4><p>' + (s.category || 'General') + '</p></div></div>';
        });
    } catch (e) {
        console.error('Stores load error:', e);
        c.innerHTML = '<p class="empty-state-message">No stores available</p>';
    }
}

function timeAgo(date) {
    var seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'just now';
    var minutes = Math.floor(seconds / 60);
    if (minutes < 60) return minutes + 'm ago';
    var hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + 'h ago';
    var days = Math.floor(hours / 24);
    return days + 'd ago';
}

// ============================================
// JOBS PAGE
// ============================================
function renderJobs() {
    var html = '';
    html += '<div style="display:flex;gap:8px;margin-bottom:10px;"><input id="jobSearch" class="input-field" placeholder="Search jobs..." style="flex:1;padding:10px;background:var(--white);border:1px solid var(--gray-200);border-radius:8px;" oninput="searchJobs()"></div>';
    html += '<div class="section-header"><h3>💼 Jobs in ' + getUserCountry().name + '</h3>';
    html += '<button class="btn-primary btn-sm" onclick="openPostJob()">+ Post Job</button></div>';
    html += '<div id="jobsList"><p class="empty-state-message">Loading jobs...</p></div>';
    document.getElementById('appMainContent').innerHTML = html;
    loadJobs();
}

async function loadJobs() {
    var c = document.getElementById('jobsList');
    if (!c) return;
    try {
        var snap = await db.collection('jobs')
            .where('status', '==', 'active')
            .where('country', '==', STATE.country)
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();
        if (snap.empty) { c.innerHTML = '<p class="empty-state-message">No jobs posted yet in your country</p>'; return; }
        c.innerHTML = '';
        snap.forEach(function(d) {
            var j = d.data();
            var genderBadge = j.gender === 'male' ? 'gender-male' : j.gender === 'female' ? 'gender-female' : 'gender-any';
            var expired = j.expiresAt && j.expiresAt.toDate() < new Date();
            c.innerHTML += '<div class="job-card' + (expired ? ' job-expired' : '') + '" onclick="viewJob(\'' + d.id + '\')">' +
                '<div class="job-card-header"><span class="job-card-title">' + (j.title || 'Job') + '</span>' +
                '<span class="job-card-amount">' + (j.currency || '€') + (j.amount || 0) + '</span></div>' +
                '<div class="job-card-meta"><span>📍 ' + (j.location || 'N/A') + '</span><span class="' + genderBadge + ' job-gender-badge">' + (j.gender || 'Any') + '</span><span>👤 ' + (j.applicants || 0) + '/' + (j.maxApplicants || 1) + '</span></div>' +
                '<div class="job-card-desc">' + (j.description || '').substring(0, 100) + '...</div>' +
                '<div class="job-card-footer"><span>' + (j.createdAt ? timeAgo(j.createdAt.toDate()) : '') + '</span>' +
                (expired ? '<span style="color:var(--red);">Expired</span>' : '<span class="applicants-badge">Apply</span>') + '</div></div>';
        });
    } catch (e) {
        console.error('Jobs load error:', e);
        c.innerHTML = '<p class="empty-state-message">Error loading jobs</p>';
    }
}

async function searchJobs() {
    var q = document.getElementById('jobSearch') ? document.getElementById('jobSearch').value.toLowerCase() : '';
    var c = document.getElementById('jobsList');
    if (!c) return;
    if (!q) { loadJobs(); return; }
    try {
        var snap = await db.collection('jobs').where('status', '==', 'active').where('country', '==', STATE.country).get();
        var filtered = [];
        snap.forEach(function(d) {
            var j = d.data();
            if ((j.title || '').toLowerCase().indexOf(q) !== -1 ||
                (j.location || '').toLowerCase().indexOf(q) !== -1 ||
                (j.description || '').toLowerCase().indexOf(q) !== -1) filtered.push(d);
        });
        if (filtered.length === 0) { c.innerHTML = '<p class="empty-state-message">No jobs found</p>'; return; }
        c.innerHTML = '';
        filtered.forEach(function(d) {
            var j = d.data();
            var genderBadge = j.gender === 'male' ? 'gender-male' : j.gender === 'female' ? 'gender-female' : 'gender-any';
            c.innerHTML += '<div class="job-card" onclick="viewJob(\'' + d.id + '\')">' +
                '<div class="job-card-header"><span class="job-card-title">' + (j.title || 'Job') + '</span>' +
                '<span class="job-card-amount">' + (j.currency || '€') + (j.amount || 0) + '</span></div>' +
                '<div class="job-card-meta"><span>📍 ' + (j.location || 'N/A') + '</span><span class="' + genderBadge + ' job-gender-badge">' + (j.gender || 'Any') + '</span></div>' +
                '<div class="job-card-desc">' + (j.description || '').substring(0, 100) + '...</div></div>';
        });
    } catch (e) {
        console.error('Search error:', e);
        c.innerHTML = '<p class="empty-state-message">Error searching</p>';
    }
}

function openPostJob() {
    if (!STATE.userData) return toast('Please login first', 'error');
    if (!STATE.userData.subscription) {
        var cjSnap = db.collection('jobs').where('userId', '==', STATE.user.uid)
            .where('createdAt', '>=', firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))).get()
            .then(function(snap) {
                if (snap.size >= 2) return toast('Free users can only post 2 jobs per week. Subscribe for more!', 'error');
                showPostJobModal();
            });
        return;
    }
    showPostJobModal();
}

function showPostJobModal() {
    var html = '<div class="modal-header-row"><h3>💼 Post a Job</h3><button class="modal-close-button" onclick="closeModal()">✕</button></div>';
    html += '<div class="input-group"><input id="jobLocation" class="input-field" placeholder="Your Location (State, City)"></div>';
    html += '<div class="input-group"><input id="jobTitle" class="input-field" placeholder="Job Title / Problem"></div>';
    html += '<div class="input-group"><textarea id="jobDesc" class="input-field" placeholder="Describe the job or problem..." style="min-height:80px;resize:vertical;"></textarea></div>';
    html += '<div class="input-group"><select id="jobCategory" class="input-field select-field">';
    for (var i = 0; i < SERVICE_CATEGORIES.length; i++) {
        html += '<option value="' + SERVICE_CATEGORIES[i] + '">' + SERVICE_CATEGORIES[i] + '</option>';
    }
    html += '</select></div>';
    html += '<div class="input-row-dual"><div class="input-group half"><input id="jobAmount" type="number" class="input-field" placeholder="Amount to pay" step="0.01"></div>';
    html += '<div class="input-group half"><select id="jobCurrency" class="input-field select-field"><option value="EUR">EUR (€)</option><option value="USD">USD ($)</option><option value="GBP">GBP (£)</option><option value="NGN">NGN (₦)</option></select></div></div>';
    html += '<div class="input-group"><select id="jobGender" class="input-field select-field"><option value="any">Any Gender</option><option value="male">Male Only</option><option value="female">Female Only</option></select></div>';
    html += '<div class="input-group"><input id="jobWhatsapp" class="input-field" placeholder="WhatsApp Number"></div>';
    html += '<div class="input-group"><input id="jobPhone" class="input-field" placeholder="Phone Number"></div>';
    html += '<div class="input-group"><input id="jobMaxApplicants" type="number" class="input-field" placeholder="Number of Applicants Needed" value="1" min="1"></div>';
    html += '<p style="font-size:0.65rem;color:var(--gray-500);text-align:center;">Jobs auto-delete after 2 days</p>';
    html += '<button class="btn-primary btn-full mt-12" onclick="postJob()">Post Job</button>';
    document.getElementById('modalContent').innerHTML = html;
    showModal();
}

async function postJob() {
    var loc = document.getElementById('jobLocation').value.trim();
    var title = document.getElementById('jobTitle').value.trim();
    var desc = document.getElementById('jobDesc').value.trim();
    var cat = document.getElementById('jobCategory').value;
    var amt = parseFloat(document.getElementById('jobAmount').value);
    var cur = document.getElementById('jobCurrency').value;
    var gender = document.getElementById('jobGender').value;
    var wa = document.getElementById('jobWhatsapp').value.trim();
    var ph = document.getElementById('jobPhone').value.trim();
    var max = parseInt(document.getElementById('jobMaxApplicants').value) || 1;

    if (!loc || !title || !desc || !amt) return toast('Fill all required fields', 'error');
    if (!wa && !ph) return toast('Enter WhatsApp or Phone', 'error');

    closeModal();
    showLoading('Posting job...');
    try {
        var expiresAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
        await db.collection('jobs').add({
            location: loc,
            title: title,
            description: desc,
            category: cat,
            amount: amt,
            currency: cur,
            gender: gender,
            whatsapp: wa,
            phone: ph,
            maxApplicants: max,
            applicants: 0,
            country: STATE.country,
            userId: STATE.user.uid,
            userName: STATE.userData.fullName,
            status: 'active',
            expiresAt: firebase.firestore.Timestamp.fromDate(expiresAt),
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        hideLoading();
        toast('Job posted! 🎉', 'success');
        navigateTo('jobs');
    } catch (e) {
        hideLoading();
        console.error('Post job error:', e);
        toast('Failed to post job', 'error');
    }
}

function viewJob(jid) {
    STATE.currentJobId = jid;
    showLoading();
    db.collection('jobs').doc(jid).get().then(function(d) {
        hideLoading();
        if (!d.exists) return toast('Job not found', 'error');
        var j = d.data();
        var isOwner = STATE.user && j.userId === STATE.user.uid;
        var canApply = !isOwner && j.applicants < j.maxApplicants;
        var genderOk = j.gender === 'any' || (STATE.userData && STATE.userData.gender === j.gender);

        var html = '<button onclick="navigateTo(\'jobs\')" style="background:var(--gray-100);border:none;padding:8px 14px;border-radius:20px;cursor:pointer;margin-bottom:12px;">← Back</button>';
        html += '<div class="job-detail-section">';
        html += '<h2>' + (j.title || 'Job') + '</h2>';
        html += '<div class="job-detail-row"><span class="label">Location</span><span class="value">📍 ' + (j.location || 'N/A') + '</span></div>';
        html += '<div class="job-detail-row"><span class="label">Category</span><span class="value">' + (j.category || 'General') + '</span></div>';
        html += '<div class="job-detail-row"><span class="label">Amount</span><span class="value" style="color:var(--green);">' + (j.currency || '€') + (j.amount || 0) + '</span></div>';
        html += '<div class="job-detail-row"><span class="label">Gender</span><span class="value">' + (j.gender || 'Any') + '</span></div>';
        html += '<div class="job-detail-row"><span class="label">Applicants</span><span class="value">' + (j.applicants || 0) + '/' + (j.maxApplicants || 1) + '</span></div>';
        html += '<p style="margin-top:12px;color:var(--gray-600);font-size:0.85rem;">' + (j.description || '') + '</p>';

        if (j.applicants >= j.maxApplicants) {
            html += '<p style="color:var(--red);font-weight:600;margin-top:12px;">⚠️ Applicants limit reached</p>';
        }

        if (canApply && j.applicants < j.maxApplicants) {
            if (j.gender !== 'any' && STATE.userData && STATE.userData.gender !== j.gender) {
                html += '<p style="color:var(--red);font-weight:600;margin-top:12px;">⚠️ This job requires ' + j.gender + ' applicants only</p>';
            }
            html += '<button class="btn-primary btn-full mt-12" onclick="applyForJob(\'' + jid + '\')">Apply Now</button>';
        }

        if (j.whatsapp && (isOwner || (canApply && j.applicants < j.maxApplicants))) {
            html += '<div class="job-detail-contact mt-12">';
            html += '<p><strong>WhatsApp:</strong> <a href="https://wa.me/' + j.whatsapp.replace(/[^0-9]/g, '') + '" target="_blank">' + j.whatsapp + '</a></p>';
            if (j.phone) html += '<p><strong>Phone:</strong> <a href="tel:' + j.phone.replace(/[^0-9+]/g, '') + '">' + j.phone + '</a></p>';
            html += '</div>';
        }

        html += '<p style="font-size:0.6rem;color:var(--gray-400);text-align:center;margin-top:8px;">Job ID: ' + jid.substring(0, 12) + '</p>';
        html += '</div>';
        document.getElementById('appMainContent').innerHTML = html;
    }).catch(function(e) {
        hideLoading();
        console.error('View job error:', e);
        toast('Error loading job', 'error');
    });
}

async function applyForJob(jid) {
    if (!STATE.user) return toast('Login required', 'error');
    var d = await db.collection('jobs').doc(jid).get();
    if (!d.exists) return toast('Job not found', 'error');
    var j = d.data();
    if (j.applicants >= j.maxApplicants) return toast('Applicants limit reached', 'error');
    if (j.gender !== 'any' && STATE.userData.gender && STATE.userData.gender !== j.gender) {
        return toast('This job requires ' + j.gender + ' applicants', 'error');
    }
    showLoading('Applying...');
    try {
        await db.collection('jobs').doc(jid).update({
            applicants: firebase.firestore.FieldValue.increment(1)
        });
        await db.collection('job_applications').add({
            jobId: jid,
            userId: STATE.user.uid,
            userName: STATE.userData.fullName,
            jobTitle: j.title,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        if (j.userId) {
            await db.collection('notifications').add({
                userId: j.userId,
                message: STATE.userData.fullName + ' applied for your job: ' + j.title,
                read: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        hideLoading();
        toast('Applied successfully! ✅', 'success');
        viewJob(jid);
    } catch (e) {
        hideLoading();
        console.error('Apply error:', e);
        toast('Failed to apply', 'error');
    }
}

// ============================================
// CONNECT JOBS PAGE
// ============================================
function renderConnectJobs() {
    if (!STATE.userData) return;
    var cj = STATE.userData.connectJob;
    var html = '';
    html += '<div class="section-header"><h3>💼 Connect Jobs</h3></div>';

    if (!cj || !cj.active) {
        html += '<div class="connect-job-card">';
        html += '<h3>Become a Connect Employee</h3>';
        html += '<p style="font-size:0.8rem;opacity:0.8;">Recruit users to join CONNECT and earn monthly pay</p>';
        html += '<div class="connect-job-stats">';
        html += '<div class="connect-job-stat"><div class="stat-num">80+</div><div class="stat-lbl">Monthly Target</div></div>';
        html += '<div class="connect-job-stat"><div class="stat-num">€15</div><div class="stat-lbl">Level 0 Pay</div></div>';
        html += '<div class="connect-job-stat"><div class="stat-num">€200</div><div class="stat-lbl">Level 3 Max</div></div>';
        html += '<div class="connect-job-stat"><div class="stat-num">15th</div><div class="stat-lbl">Pay Day</div></div>';
        html += '</div>';
        html += '<button class="btn-primary btn-full mt-8" onclick="openApplyConnectJob()">Apply Now</button>';
        html += '</div>';
    } else {
        var level = cj.level || 0;
        var levelNames = { 0: 'Starter', 1: 'Bronze', 2: 'Silver', 3: 'Gold' };
        var pays = { 0: 15, 1: 20, 2: 50, 3: 200 };
        html += '<div class="connect-job-card">';
        html += '<span class="connect-job-level level-' + level + '">Level ' + level + ' - ' + (levelNames[level] || 'Starter') + '</span>';
        html += '<h3>Your Connect Job Dashboard</h3>';
        html += '<div class="connect-job-stats">';
        html += '<div class="connect-job-stat"><div class="stat-num">' + (cj.monthReferrals || 0) + '</div><div class="stat-lbl">This Month</div></div>';
        html += '<div class="connect-job-stat"><div class="stat-num">€' + (pays[level] || 15) + '</div><div class="stat-lbl">Monthly Pay</div></div>';
        html += '<div class="connect-job-stat"><div class="stat-num">' + (cj.totalReferrals || 0) + '</div><div class="stat-lbl">Total Referrals</div></div>';
        html += '<div class="connect-job-stat"><div class="stat-num">' + (cj.standbyMonths || 0) + '</div><div class="stat-lbl">Standby Months</div></div>';
        html += '</div>';
        html += '<p style="font-size:0.75rem;margin:8px 0;">Referral Code: <strong>' + STATE.userData.username + '</strong></p>';
        html += '<p style="font-size:0.65rem;opacity:0.7;">Target: 80 subscribed referrals/month. Pay on 15th.</p>';
        html += '<button class="btn-primary btn-full mt-8" onclick="shareConnectJob()">📤 Share Your Link</button>';
        html += '<button class="btn-outline btn-full mt-8" onclick="withdrawConnectJob()">💸 Withdraw to Wallet</button>';
        html += '</div>';

        html += '<div class="section-header"><h3>📊 Levels</h3></div>';
        html += '<div class="card-white">';
        html += '<p style="font-size:0.75rem;">Level 0: 80 refs → €15/mo</p>';
        html += '<p style="font-size:0.75rem;">Level 1: 100 refs → €20/mo</p>';
        html += '<p style="font-size:0.75rem;">Level 2: 500 refs → €50/mo</p>';
        html += '<p style="font-size:0.75rem;">Level 3: 1500 refs → €200/mo</p>';
        html += '</div>';
    }

    document.getElementById('appMainContent').innerHTML = html;
}

function openApplyConnectJob() {
    var html = '<div class="modal-header-row"><h3>Apply for Connect Job</h3><button class="modal-close-button" onclick="closeModal()">✕</button></div>';
    html += '<p style="font-size:0.75rem;color:var(--gray-500);margin-bottom:12px;">Fill all details to apply</p>';
    html += '<div class="input-group"><input id="cjFullName" class="input-field" placeholder="Full Name (as on document)"></div>';
    html += '<div class="input-group"><input id="cjDOB" type="date" class="input-field" placeholder="Date of Birth (16-60)"></div>';
    html += '<div class="input-group"><input id="cjReason" class="input-field" placeholder="Reason for application"></div>';
    html += '<div class="input-group"><input id="cjUsername" class="input-field" placeholder="Job Username (referral code)"></div>';
    html += '<div class="input-group"><input id="cjPhone" class="input-field" placeholder="Phone Number"></div>';
    html += '<div class="input-group"><input id="cjSocial" class="input-field" placeholder="TikTok or Instagram Username"></div>';
    html += '<p style="font-size:0.65rem;color:var(--gray-500);">Your job: Recruit users to join CONNECT using your referral link/code. Target: 80+ subscribed referrals/month. Pay: €15-200/month.</p>';
    html += '<button class="btn-primary btn-full mt-12" onclick="submitConnectJobApp()">Proceed</button>';
    document.getElementById('modalContent').innerHTML = html;
    showModal();
}

async function submitConnectJobApp() {
    var fn = document.getElementById('cjFullName').value.trim();
    var dob = document.getElementById('cjDOB').value;
    var reason = document.getElementById('cjReason').value.trim();
    var un = document.getElementById('cjUsername').value.trim().toLowerCase();
    var ph = document.getElementById('cjPhone').value.trim();
    var social = document.getElementById('cjSocial').value.trim();

    if (!fn || !dob || !reason || !un || !ph || !social) return toast('Fill all fields', 'error');

    var age = new Date().getFullYear() - new Date(dob).getFullYear();
    if (age < 16 || age > 60) return toast('Age must be 16-60', 'error');

    var uq = await db.collection('users').where('username', '==', un).get();
    if (!uq.empty && uq.docs[0].id !== STATE.user.uid) return toast('Username already taken', 'error');

    closeModal();
    showLoading('Applying...');
    try {
        await db.collection('users').doc(STATE.user.uid).update({
            fullName: fn,
            username: un,
            referralCode: un,
            'connectJob': {
                active: true,
                level: 0,
                monthReferrals: 0,
                totalReferrals: 0,
                standbyMonths: 0,
                paidThisMonth: false,
                phone: ph,
                social: social,
                appliedAt: firebase.firestore.FieldValue.serverTimestamp()
            },
            'socialLinks.tiktok': social,
            'socialLinks.phone': ph
        });
        STATE.userData.fullName = fn;
        STATE.userData.username = un;
        STATE.userData.referralCode = un;
        STATE.userData.connectJob = {
            active: true,
            level: 0,
            monthReferrals: 0,
            totalReferrals: 0,
            standbyMonths: 0,
            paidThisMonth: false,
            phone: ph,
            social: social
        };
        hideLoading();
        toast('Connect Job activated! 🎉', 'success');
        navigateTo('connectJobs');
    } catch (e) {
        hideLoading();
        console.error('Apply error:', e);
        toast('Failed to apply', 'error');
    }
}

function shareConnectJob() {
    var link = APP_BASE_URL + '?ref=' + (STATE.userData ? STATE.userData.username : '');
    var html = '<div class="modal-header-row"><h3>📤 Share Connect Job</h3><button class="modal-close-button" onclick="closeModal()">✕</button></div>';
    html += '<p style="font-size:0.8rem;">Your referral link:</p>';
    html += '<div class="promote-link-box">' + link + '</div>';
    html += '<div class="share-buttons">';
    html += '<button class="share-btn share-whatsapp" onclick="shareToPlatform(\'whatsapp\',\'' + encodeURIComponent(link) + '\')"><i class="fab fa-whatsapp"></i></button>';
    html += '<button class="share-btn share-facebook" onclick="shareToPlatform(\'facebook\',\'' + encodeURIComponent(link) + '\')"><i class="fab fa-facebook"></i></button>';
    html += '<button class="share-btn share-telegram" onclick="shareToPlatform(\'telegram\',\'' + encodeURIComponent(link) + '\')"><i class="fab fa-telegram"></i></button>';
    html += '<button class="share-btn share-twitter" onclick="shareToPlatform(\'twitter\',\'' + encodeURIComponent(link) + '\')"><i class="fab fa-twitter"></i></button>';
    html += '<button class="share-btn share-instagram" onclick="shareToPlatform(\'instagram\',\'' + encodeURIComponent(link) + '\')"><i class="fab fa-instagram"></i></button>';
    html += '<button class="share-btn share-tiktok" onclick="shareToPlatform(\'tiktok\',\'' + encodeURIComponent(link) + '\')"><i class="fab fa-tiktok"></i></button>';
    html += '</div>';
    html += '<button class="btn-primary btn-full mt-8" onclick="copyText(\'' + link + '\')">Copy Link</button>';
    document.getElementById('modalContent').innerHTML = html;
    showModal();
}

function shareToPlatform(platform, link) {
    var urls = {
        whatsapp: 'https://wa.me/?text=' + decodeURIComponent(link),
        facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + link,
        telegram: 'https://t.me/share/url?url=' + link,
        twitter: 'https://twitter.com/intent/tweet?url=' + link,
        instagram: link,
        tiktok: link
    };
    if (urls[platform] && platform !== 'instagram' && platform !== 'tiktok') {
        window.open(urls[platform], '_blank');
    } else {
        navigator.clipboard.writeText(decodeURIComponent(link)).then(function() {
            toast('Link copied! Share on ' + platform, 'success');
        });
    }
}

async function withdrawConnectJob() {
    var cj = STATE.userData.connectJob;
    if (!cj || !cj.active) return toast('No active connect job', 'error');
    var pin = prompt('Enter your security PIN:');
    if (pin !== STATE.userData.securityPin) return toast('Invalid PIN', 'error');
    var c = getUserCountry();
    var amt = parseFloat(prompt('Amount to withdraw (€):'));
    if (!amt || amt <= 0) return toast('Invalid amount', 'error');
    showLoading('Processing...');
    try {
        await db.collection('users').doc(STATE.user.uid).update({
            balance: firebase.firestore.FieldValue.increment(amt)
        });
        STATE.userData.balance = (STATE.userData.balance || 0) + amt;
        await db.collection('transactions').add({
            userId: STATE.user.uid,
            type: 'connect_job_withdraw',
            amount: amt,
            localCurrency: c.currency,
            localAmount: amt * c.rate,
            status: 'completed',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        hideLoading();
        toast(c.symbol + (amt * c.rate).toFixed(2) + ' withdrawn to wallet!', 'success');
        navigateTo('connectJobs');
    } catch(e) {
        hideLoading();
        console.error('Withdraw error:', e);
        toast('Failed', 'error');
    }
}

// ============================================
// SERVICES PAGE
// ============================================
function renderServices() {
    var html = '';
    html += '<div style="display:flex;gap:8px;margin-bottom:10px;"><input id="serviceSearch" class="input-field" placeholder="Search services..." style="flex:1;padding:10px;background:var(--white);border:1px solid var(--gray-200);border-radius:8px;" oninput="searchServices()"></div>';
    html += '<div class="section-header"><h3>🛠️ Service Marketplace</h3>';
    html += (STATE.userData && STATE.userData.subscription ? '<button class="btn-primary btn-sm" onclick="openCreateService()">Create Service</button>' : '') + '</div>';
    html += '<div class="chip-row" id="svcChips"><span class="chip active" onclick="filterServices(\'all\')">All</span></div>';
    html += '<div id="servicesList"><p class="empty-state-message">Loading services...</p></div>';
    document.getElementById('appMainContent').innerHTML = html;
    for (var i = 0; i < Math.min(SERVICE_CATEGORIES.length, 20); i++) {
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
        if (snap.empty) { c.innerHTML = '<p class="empty-state-message">No services in your country</p>'; return; }
        c.innerHTML = '';
        snap.forEach(function(d) {
            var s = d.data();
            c.innerHTML += '<div class="service-card" onclick="viewService(\'' + d.id + '\')">' +
                '<img class="service-card-image" src="' + (s.profileImage || 'https://via.placeholder.com/60') + '">' +
                '<div class="service-card-info"><h4>' + (s.name || 'Service') + '</h4><p>' + (s.category || 'General') + '</p>' +
                '<div class="service-card-stats"><span>👥 ' + (s.followers || 0) + '</span><span>⭐ ' + (s.rating || 'New') + '</span></div>' +
                '<div class="service-card-actions">' +
                (s.whatsapp ? '<button onclick="event.stopPropagation();contactWA(\'' + s.whatsapp + '\')" style="background:#25D366;color:white;">💬</button>' : '') +
                (s.phone ? '<button onclick="event.stopPropagation();callNumber(\'' + s.phone + '\')" style="background:var(--blue);color:white;">📞</button>' : '') +
                '<button onclick="event.stopPropagation();openComment(\'' + d.id + '\')" style="background:var(--gray-100);color:var(--gray-600);">💬</button>' +
                '<button onclick="event.stopPropagation();rateService(\'' + d.id + '\')" style="background:var(--gray-100);color:var(--gray-600);">⭐</button>' +
                '</div></div></div>';
        });
    } catch (e) {
        console.error('Services error:', e);
        c.innerHTML = '<p class="empty-state-message">Error loading services</p>';
    }
}

function viewService(sid) {
    STATE.currentServiceId = sid;
    showLoading();
    db.collection('services').doc(sid).get().then(function(d) {
        hideLoading();
        if (!d.exists) return toast('Service not found', 'error');
        var s = d.data();
        var html = '<button onclick="navigateTo(\'services\')" style="background:var(--gray-100);border:none;padding:8px 14px;border-radius:20px;cursor:pointer;margin-bottom:12px;">← Back</button>';
        html += '<div style="text-align:center;"><img src="' + (s.profileImage || 'https://via.placeholder.com/90') + '" style="width:80px;height:80px;border-radius:50%;border:3px solid var(--purple);">';
        html += '<h2>' + (s.name || 'Service') + '</h2><p>' + (s.category || 'General') + '</p><p>📍 ' + (s.location || 'N/A') + '</p>';
        html += '<div style="display:flex;gap:16px;justify-content:center;margin:12px 0;"><div><strong>' + (s.followers || 0) + '</strong><br><small>Followers</small></div><div><strong>⭐ ' + (s.rating || 'New') + '</strong><br><small>Rating</small></div></div>';
        if (s.whatsapp) html += '<button class="btn-primary btn-full mt-8" onclick="contactWA(\'' + s.whatsapp + '\')"><i class="fab fa-whatsapp"></i> Chat</button>';
        if (s.phone) html += '<button class="btn-outline btn-full mt-8" onclick="callNumber(\'' + s.phone + '\')"><i class="fas fa-phone"></i> Call</button>';
        html += '<button class="btn-outline btn-full mt-8" onclick="followService(\'' + sid + '\')">Follow</button>';
        if (s.storeId) html += '<button class="btn-outline btn-full mt-8" onclick="viewStore(\'' + s.storeId + '\')">🏪 View Store</button>';
        html += '</div>';
        document.getElementById('appMainContent').innerHTML = html;
    }).catch(function(e) {
        hideLoading();
        console.error('View service error:', e);
        toast('Error loading service', 'error');
    });
}

function openCreateService() {
    var html = '<div class="modal-header-row"><h3>🛠️ Create Service</h3><button class="modal-close-button" onclick="closeModal()">✕</button></div>';
    html += '<div class="input-group"><input id="svcName" class="input-field" placeholder="Service Name"></div>';
    html += '<div class="input-group"><input id="svcUsername" class="input-field" placeholder="Service Username"></div>';
    html += '<div class="input-group"><select id="svcCat" class="input-field select-field">';
    for (var i = 0; i < SERVICE_CATEGORIES.length; i++) {
        html += '<option value="' + SERVICE_CATEGORIES[i] + '">' + SERVICE_CATEGORIES[i] + '</option>';
    }
    html += '</select></div>';
    html += '<div class="input-group"><input id="svcLoc" class="input-field" placeholder="Location"></div>';
    html += '<div class="input-group"><input id="svcDesc" class="input-field" placeholder="Description"></div>';
    html += '<div class="input-group"><input id="svcWA" class="input-field" placeholder="WhatsApp"></div>';
    html += '<div class="input-group"><input id="svcPhone" class="input-field" placeholder="Phone"></div>';
    html += '<div class="input-group"><input id="svcImg" type="file" accept="image/*"></div>';
    html += '<button class="btn-primary btn-full mt-12" onclick="createService()">Create Service</button>';
    document.getElementById('modalContent').innerHTML = html;
    showModal();
}

async function createService() {
    var n = document.getElementById('svcName').value.trim();
    var u = document.getElementById('svcUsername').value.trim();
    var cat = document.getElementById('svcCat').value;
    var loc = document.getElementById('svcLoc').value.trim();
    var desc = document.getElementById('svcDesc').value.trim();
    var wa = document.getElementById('svcWA').value.trim();
    var ph = document.getElementById('svcPhone').value.trim();
    var imgFile = document.getElementById('svcImg').files[0];
    if (!n || !cat) return toast('Fill required fields', 'error');
    closeModal();
    showLoading('Creating service...');
    try {
        var img = '';
        if (imgFile) img = await uploadToCloud(imgFile);
        var sRef = await db.collection('services').add({
            name: n, username: u, category: cat, location: loc, description: desc,
            whatsapp: wa, phone: ph, profileImage: img,
            country: STATE.country, ownerId: STATE.user.uid,
            status: 'active', followers: 0, rating: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        await db.collection('users').doc(STATE.user.uid).update({ hasService: true, serviceId: sRef.id });
        STATE.userData.hasService = true;
        STATE.userData.serviceId = sRef.id;
        hideLoading();
        toast('Service created!', 'success');
        navigateTo('services');
    } catch (e) {
        hideLoading();
        console.error('Create service error:', e);
        toast('Failed to create service', 'error');
    }
}

function openComment(sid) {
    var html = '<div class="modal-header-row"><h3>💬 Comments</h3><button class="modal-close-button" onclick="closeModal()">✕</button></div>';
    html += '<div class="input-group"><input id="commentText" class="input-field" placeholder="Write a comment..."></div>';
    html += '<button class="btn-primary btn-full" onclick="addComment(\'' + sid + '\')">Post</button>';
    html += '<div class="comments-section mt-8" id="commentsList"></div>';
    document.getElementById('modalContent').innerHTML = html;
    showModal();
    loadComments(sid);
}

async function loadComments(sid) {
    try {
        var snap = await db.collection('comments').where('serviceId', '==', sid).orderBy('createdAt', 'desc').limit(50).get();
        var c = document.getElementById('commentsList');
        if (!c) return;
        if (snap.empty) { c.innerHTML = '<p class="empty-state-message">No comments yet</p>'; return; }
        c.innerHTML = '';
        snap.forEach(function(d) {
            var data = d.data();
            c.innerHTML += '<div class="comment-item"><div class="comment-avatar"></div><div class="comment-body"><strong>' + (data.userName || 'User') + '</strong><p>' + (data.text || '') + '</p><span class="comment-time">' + (data.createdAt ? data.createdAt.toDate().toLocaleString() : '') + '</span></div></div>';
        });
    } catch(e) {
        console.error('Comments error:', e);
    }
}

async function addComment(sid) {
    var text = document.getElementById('commentText') ? document.getElementById('commentText').value.trim() : '';
    if (!text) return toast('Enter a comment', 'error');
    if (!STATE.user) return toast('Login required', 'error');
    try {
        await db.collection('comments').add({
            serviceId: sid,
            userId: STATE.user.uid,
            userName: STATE.userData.fullName,
            text: text,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        toast('Comment posted!', 'success');
        loadComments(sid);
        document.getElementById('commentText').value = '';
    } catch(e) {
        console.error('Add comment error:', e);
        toast('Failed to post', 'error');
    }
}

async function rateService(sid) {
    if (!STATE.user) return toast('Login required', 'error');
    var r = prompt('Rate (1-5):');
    if (!r || isNaN(r) || r < 1 || r > 5) return;
    try {
        await db.collection('services').doc(sid).update({ rating: firebase.firestore.FieldValue.increment(parseInt(r)) });
        toast('Rated! ⭐', 'success');
    } catch(e) {
        console.error('Rate error:', e);
        toast('Failed to rate', 'error');
    }
}

async function followService(sid) {
    if (!STATE.user) return toast('Login required', 'error');
    try {
        await db.collection('services').doc(sid).update({ followers: firebase.firestore.FieldValue.increment(1) });
        toast('Following! ✅', 'success');
    } catch(e) {
        console.error('Follow error:', e);
        toast('Failed to follow', 'error');
    }
}

function filterServices(cat) {
    document.querySelectorAll('#svcChips .chip').forEach(function(ch) { ch.classList.remove('active'); });
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
            if ((s.username || '').toLowerCase().indexOf(q) !== -1 || (s.name || '').toLowerCase().indexOf(q) !== -1) filtered.push(d);
        });
        if (filtered.length === 0) { c.innerHTML = '<p class="empty-state-message">No services found</p>'; return; }
        c.innerHTML = '';
        filtered.forEach(function(d) {
            var s = d.data();
            c.innerHTML += '<div class="service-card" onclick="viewService(\'' + d.id + '\')">' +
                '<img class="service-card-image" src="' + (s.profileImage || 'https://via.placeholder.com/60') + '">' +
                '<div class="service-card-info"><h4>' + (s.name || 'Service') + '</h4><p>' + (s.category || 'General') + '</p></div></div>';
        });
    } catch(e) {
        console.error('Search error:', e);
        c.innerHTML = '<p class="empty-state-message">Error</p>';
    }
}

function contactWA(wa) {
    if (wa) window.open('https://wa.me/' + wa.replace(/[^0-9]/g, ''), '_blank');
}

function callNumber(phone) {
    if (phone) window.open('tel:' + phone.replace(/[^0-9+]/g, ''), '_blank');
}

// ============================================
// STORES PAGE
// ============================================
function renderStores() {
    var html = '<div style="display:flex;gap:8px;margin-bottom:10px;"><input id="storeSearch" class="input-field" placeholder="Search stores..." style="flex:1;padding:10px;background:var(--white);border:1px solid var(--gray-200);border-radius:8px;" oninput="searchStores()"></div>';
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
            g.innerHTML += '<div class="store-card" onclick="viewStore(\'' + d.id + '\')">' +
                '<div class="store-card-image">' + (s.image ? '<img src="' + s.image + '">' : '🏪') + '</div>' +
                '<div class="store-card-info"><h4>' + (s.name || 'Store') + '</h4><p>' + (s.category || 'General') + '</p></div></div>';
        });
    } catch (e) {
        console.error('Stores error:', e);
        g.innerHTML = '<p class="empty-state-message" style="grid-column:1/-1;">Error loading stores</p>';
    }
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
        if (filtered.length === 0) { g.innerHTML = '<p class="empty-state-message" style="grid-column:1/-1;">No stores found</p>'; return; }
        g.innerHTML = '';
        filtered.forEach(function(d) {
            var s = d.data();
            g.innerHTML += '<div class="store-card" onclick="viewStore(\'' + d.id + '\')">' +
                '<div class="store-card-image">' + (s.image ? '<img src="' + s.image + '">' : '🏪') + '</div>' +
                '<div class="store-card-info"><h4>' + (s.name || 'Store') + '</h4><p>' + (s.category || 'General') + '</p></div></div>';
        });
    } catch(e) {
        console.error('Search error:', e);
        g.innerHTML = '<p class="empty-state-message">Error</p>';
    }
}

async function viewStore(sid) {
    STATE.currentStoreId = sid;
    showLoading('Loading store...');
    try {
        var d = await db.collection('stores').doc(sid).get();
        hideLoading();
        if (!d.exists) return toast('Store not found', 'error');
        var s = d.data();
        var isOwner = STATE.user && s.ownerId === STATE.user.uid;
        var html = '<div class="store-hero-section"><div class="store-cover-image">' + (s.image ? '<img src="' + s.image + '">' : '') + '</div>';
        html += '<div class="store-avatar-large">' + (s.name || 'S').charAt(0) + '</div>';
        html += '<div class="store-info-section"><h2>' + (s.name || 'Store') + '</h2><p>' + (s.description || '') + '</p>';
        html += '<p>' + (s.category || 'General') + ' • ' + (s.visibility === 'worldwide' ? '🌍 Worldwide' : '📍 Local') + '</p>';
        if (isOwner) {
            html += '<p style="color:var(--purple);font-weight:600;">Store Balance: ' + formatBalance(s.storeBalance || 0) + '</p>';
            html += '<button class="btn-primary btn-sm mt-8" onclick="openAddProduct()">+ Add Product</button>';
            html += '<button class="btn-outline btn-sm mt-8" onclick="withdrawStoreBalance(\'' + sid + '\')">💸 Withdraw</button>';
        }
        html += '</div></div>';
        html += '<div class="store-tabs-row"><button class="store-tab-button active">Products</button></div>';
        html += '<div class="grid-2-col" id="storeProductsGrid"><p class="empty-state-message">Loading products...</p></div>';
        document.getElementById('appMainContent').innerHTML = html;
        loadStoreProducts(sid, isOwner);
    } catch (e) {
        hideLoading();
        console.error('View store error:', e);
        toast('Error loading store', 'error');
    }
}

async function loadStoreProducts(sid, isOwner) {
    var g = document.getElementById('storeProductsGrid');
    if (!g) return;
    try {
        var snap = await db.collection('products').where('storeId', '==', sid).where('status', '==', 'active').get();
        if (snap.empty) { g.innerHTML = '<p class="empty-state-message" style="grid-column:1/-1;">No products yet</p>'; return; }
        g.innerHTML = '';
        snap.forEach(function(d) {
            var p = d.data();
            g.innerHTML += '<div class="product-card" onclick="viewProduct(\'' + d.id + '\')">' +
                '<div class="product-card-image">' + (p.images && p.images[0] ? '<img src="' + p.images[0] + '">' : '📦') + '</div>' +
                '<div class="product-card-info"><h5>' + (p.title || 'Product') + '</h5>' +
                '<p class="product-price">' + (p.currency || '€') + (p.price || 0) + '</p>' +
                (isOwner ? '<button class="btn-outline btn-xs btn-danger mt-4" onclick="event.stopPropagation();deleteProduct(\'' + d.id + '\')">Delete</button>' :
                '<button class="btn-primary btn-xs mt-4" onclick="event.stopPropagation();openBuyProduct(\'' + d.id + '\')">Buy Now</button>') +
                '<button class="btn-outline btn-xs mt-4" onclick="event.stopPropagation();affiliateProduct(\'' + d.id + '\')" style="color:var(--blue);border-color:var(--blue);">🔗 Promote</button>' +
                '</div></div>';
        });
    } catch (e) {
        console.error('Products error:', e);
        g.innerHTML = '<p class="empty-state-message" style="grid-column:1/-1;">Error loading products</p>';
    }
}

function openCreateStore() {
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
    showLoading('Creating store...');
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
        toast('Store created! 🎉', 'success');
        navigateTo('stores');
    } catch (e) {
        hideLoading();
        console.error('Create store error:', e);
        toast('Failed to create store', 'error');
    }
}

async function withdrawStoreBalance(sid) {
    var d = await db.collection('stores').doc(sid).get();
    if (!d.exists) return;
    var bal = d.data().storeBalance || 0;
    var amt = parseFloat(prompt('Store Balance: ' + formatBalance(bal) + '. Amount to withdraw (€):'));
    if (!amt || amt < 0.01 || amt > bal) return toast('Invalid amount', 'error');
    var pin = prompt('Enter security PIN:');
    if (pin !== STATE.userData.securityPin) return toast('Invalid PIN', 'error');
    showLoading('Withdrawing...');
    try {
        await db.collection('stores').doc(sid).update({ storeBalance: firebase.firestore.FieldValue.increment(-amt) });
        await db.collection('users').doc(STATE.user.uid).update({ balance: firebase.firestore.FieldValue.increment(amt) });
        STATE.userData.balance = (STATE.userData.balance || 0) + amt;
        await db.collection('transactions').add({
            userId: STATE.user.uid, type: 'store_withdraw', amount: amt, status: 'completed',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        hideLoading();
        toast('€' + amt.toFixed(2) + ' transferred!', 'success');
        viewStore(sid);
    } catch(e) {
        hideLoading();
        console.error('Withdraw error:', e);
        toast('Failed', 'error');
    }
}

function openAddProduct() {
    var html = '<div class="modal-header-row"><h3>📦 Add Product</h3><button class="modal-close-button" onclick="closeModal()">✕</button></div>';
    html += '<div class="input-group"><input id="pTitle" class="input-field" placeholder="Product Title"></div>';
    html += '<div class="input-group"><input id="pDesc" class="input-field" placeholder="Description"></div>';
    html += '<div class="input-row-dual"><div class="input-group half"><input id="pPrice" type="number" class="input-field" placeholder="Price" step="0.01"></div><div class="input-group half"><input id="pStock" type="number" class="input-field" placeholder="Stock" value="1"></div></div>';
    html += '<div class="input-group"><select id="pCur" class="input-field select-field"><option value="EUR">EUR (€)</option><option value="USD">USD ($)</option><option value="GBP">GBP (£)</option><option value="NGN">NGN (₦)</option></select></div>';
    html += '<div class="input-group"><select id="pType" class="input-field select-field"><option value="physical">Physical</option><option value="digital">Digital</option></select></div>';
    html += '<div class="input-group"><input id="pDiscCode" class="input-field" placeholder="Discount Code (max 10)" maxlength="10"></div>';
    html += '<div class="input-group"><input id="pDiscAmt" type="number" class="input-field" placeholder="Discount %" step="0.01"></div>';
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
    var type = document.getElementById('pType').value;
    var dc = document.getElementById('pDiscCode').value.trim();
    var da = parseFloat(document.getElementById('pDiscAmt').value) || 0;
    var imgFiles = document.getElementById('pImg').files;
    if (!t || !p) return toast('Fill required fields', 'error');
    closeModal();
    showLoading('Adding product...');
    try {
        var imgs = [];
        for (var i = 0; i < Math.min(imgFiles.length, 6); i++) {
            imgs.push(await uploadToCloud(imgFiles[i]));
        }
        await db.collection('products').add({
            title: t, description: desc, price: p, stock: st, currency: cur, type: type,
            discountCode: dc || null, discountAmount: da || null, images: imgs,
            storeId: STATE.currentStoreId, ownerId: STATE.user.uid, status: 'active',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        hideLoading();
        toast('Product added!', 'success');
        viewStore(STATE.currentStoreId);
    } catch (e) {
        hideLoading();
        console.error('Add product error:', e);
        toast('Failed to add product', 'error');
    }
}

async function deleteProduct(pid) {
    if (!confirm('Delete this product?')) return;
    try {
        await db.collection('products').doc(pid).update({ status: 'deleted' });
        toast('Deleted', 'success');
        viewStore(STATE.currentStoreId);
    } catch(e) {
        console.error('Delete error:', e);
        toast('Failed', 'error');
    }
}

function viewProduct(pid) {
    STATE.currentProductId = pid;
    showLoading('Loading product...');
    db.collection('products').doc(pid).get().then(function(d) {
        hideLoading();
        if (!d.exists) return toast('Product not found', 'error');
        var p = d.data();
        var imgs = p.images || [];
        STATE.productGalleryIndex = 0;
        var html = '<button onclick="navigateTo(\'stores\')" style="background:var(--gray-100);border:none;padding:8px 14px;border-radius:20px;cursor:pointer;margin-bottom:12px;">← Back</button>';
        html += '<div class="product-gallery">' + (imgs.length > 0 ? '<img src="' + imgs[0] + '" id="galleryImg">' : '<div style="height:100%;display:flex;align-items:center;justify-content:center;font-size:4rem;">📦</div>') +
            (imgs.length > 1 ? '<div class="product-gallery-dots">' + imgs.map(function(_, i) { return '<span class="product-gallery-dot ' + (i === 0 ? 'active' : '') + '" onclick="event.stopPropagation();switchGallery(' + i + ')"></span>'; }).join('') + '</div>' : '') + '</div>';
        html += '<h2>' + (p.title || 'Product') + '</h2><p style="color:var(--gray-500);">' + (p.description || '') + '</p>';
        if (p.discountCode) html += '<p style="color:var(--green);">🎟️ Code: <strong>' + p.discountCode + '</strong> - ' + (p.discountAmount || 0) + '% off</p>';
        html += '<p style="font-size:1.5rem;font-weight:700;color:var(--purple);">' + (p.currency || '€') + (p.price || 0) + '</p>';
        html += '<p style="color:var(--gray-500);">Stock: ' + (p.stock || 0) + '</p>';
        html += '<button class="btn-primary btn-full mt-12" onclick="openBuyProduct(\'' + pid + '\')">Buy Now</button>';
        html += '<button class="btn-outline btn-full mt-8" onclick="affiliateProduct(\'' + pid + '\')" style="color:var(--blue);border-color:var(--blue);">🔗 Promote</button>';
        document.getElementById('appMainContent').innerHTML = html;
    }).catch(function(e) {
        hideLoading();
        console.error('View product error:', e);
        toast('Error loading product', 'error');
    });
}

function switchGallery(i) {
    STATE.productGalleryIndex = i;
    var img = document.getElementById('galleryImg');
    if (img && STATE.currentProductId) {
        db.collection('products').doc(STATE.currentProductId).get().then(function(d) {
            if (d.exists) {
                var imgs = d.data().images || [];
                if (imgs[i]) img.src = imgs[i];
            }
        });
    }
    document.querySelectorAll('.product-gallery-dot').forEach(function(d, idx) { d.classList.toggle('active', idx === i); });
}

function openBuyProduct(pid) {
    var html = '<div class="modal-header-row"><h3>📦 Purchase</h3><button class="modal-close-button" onclick="closeModal()">✕</button></div>';
    html += '<div class="input-group"><input id="buyCountry" class="input-field" placeholder="Country"></div>';
    html += '<div class="input-group"><input id="buyState" class="input-field" placeholder="State"></div>';
    html += '<div class="input-group"><input id="buyLocation" class="input-field" placeholder="Exact Location"></div>';
    html += '<div class="input-group"><input id="buyPhone" class="input-field" placeholder="Phone"></div>';
    html += '<div class="input-group"><input id="buyWA" class="input-field" placeholder="WhatsApp"></div>';
    html += '<div class="input-group"><input id="buyDisc" class="input-field" placeholder="Discount Code (optional)"></div>';
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
    var disc = document.getElementById('buyDisc').value.trim();
    if (!c || !st || !loc || !ph) return toast('Fill all delivery details', 'error');
    try {
        var d = await db.collection('products').doc(pid).get();
        if (!d.exists) return toast('Product not found', 'error');
        var p = d.data();
        var finalPrice = p.price || 0;
        if (disc && p.discountCode === disc) {
            finalPrice = p.price * (1 - (p.discountAmount || 0) / 100);
        }
        if ((STATE.userData.balance || 0) < finalPrice) return toast('Insufficient balance', 'error');
        closeModal();
        showLoading('Processing...');
        await db.collection('users').doc(STATE.user.uid).update({ balance: firebase.firestore.FieldValue.increment(-finalPrice) });
        if (p.stock) await db.collection('products').doc(pid).update({ stock: firebase.firestore.FieldValue.increment(-1) });
        var oRef = await db.collection('orders').add({
            userId: STATE.user.uid, sellerId: p.ownerId, productId: pid,
            itemName: p.title, total: finalPrice, originalPrice: p.price,
            discountCode: disc || null, status: 'pending', type: p.type,
            escrow: p.type === 'physical',
            deliveryDetails: { country: c, state: st, location: loc, phone: ph, whatsapp: wa },
            buyerName: STATE.userData.fullName,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        if (p.type === 'digital') {
            await db.collection('users').doc(p.ownerId).update({ balance: firebase.firestore.FieldValue.increment(finalPrice) });
            await db.collection('orders').doc(oRef.id).update({ status: 'completed' });
        } else {
            var storeSnap = await db.collection('stores').where('ownerId', '==', p.ownerId).limit(1).get();
            if (!storeSnap.empty) {
                await db.collection('stores').doc(storeSnap.docs[0].id).update({ storeBalance: firebase.firestore.FieldValue.increment(finalPrice) });
            }
        }
        await db.collection('transactions').add({
            userId: STATE.user.uid, type: 'purchase', amount: finalPrice,
            itemName: p.title, orderId: oRef.id, status: 'completed',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        if (p.ownerId) {
            await db.collection('notifications').add({
                userId: p.ownerId,
                message: 'New order: ' + p.title + ' for €' + finalPrice.toFixed(2),
                read: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        STATE.userData.balance -= finalPrice;
        hideLoading();
        toast('Order placed!', 'success');
        navigateTo('orders');
    } catch (e) {
        hideLoading();
        console.error('Buy error:', e);
        toast('Purchase failed', 'error');
    }
}

// ============================================
// AFFILIATE PAGE
// ============================================
function renderAffiliate() {
    if (!STATE.userData) return;
    if (!STATE.userData.subscription) {
        document.getElementById('appMainContent').innerHTML = '<p class="empty-state-message">Subscribe to access Affiliate Program</p>' +
            '<button class="btn-primary btn-full mt-8" onclick="navigateTo(\'profile\')">Go to Profile to Subscribe</button>';
        return;
    }
    if (!STATE.userData.affiliate) {
        var html = '<div class="card-white"><h3>Become an Affiliate</h3>';
        html += '<div class="input-group"><input id="affName" class="input-field" placeholder="Affiliate Name"></div>';
        html += '<div class="input-group"><input id="affUser" class="input-field" placeholder="Username"></div>';
        html += '<div class="input-group"><input id="affPhone" class="input-field" placeholder="Phone"></div>';
        html += '<div class="input-group"><input id="affWA" class="input-field" placeholder="WhatsApp"></div>';
        html += '<button class="btn-primary btn-full mt-12" onclick="setupAffiliate()">Generate Affiliate ID</button></div>';
        document.getElementById('appMainContent').innerHTML = html;
        return;
    }
    var a = STATE.userData.affiliate;
    var html = '';
    html += '<div class="affiliate-hero-card">';
    html += '<p style="font-size:0.7rem;color:var(--gray-500);">Affiliate ID</p>';
    html += '<div class="affiliate-id-display">' + (a.id || 'N/A') + '</div>';
    html += '<p>Level: <span class="affiliate-level-badge level-' + (a.level || 1) + '">Level ' + (a.level || 1) + '</span></p>';
    html += '<div class="affiliate-stats-row"><div class="affiliate-stat-item"><div class="stat-value">€' + (a.balance || 0).toFixed(2) + '</div><div class="stat-label">Balance</div></div><div class="affiliate-stat-item"><div class="stat-value">' + (a.completed || 0) + '</div><div class="stat-label">Completed</div></div></div>';
    html += '<button class="btn-primary btn-sm mt-8" onclick="affCashout()">Cash Out</button>';
    html += '</div>';
    html += '<div class="section-header"><h3>🏪 Promote Products</h3></div>';
    html += '<div class="grid-2-col" id="affProds"><p class="empty-state-message">Loading products...</p></div>';
    html += '<div class="share-buttons mt-8">';
    html += '<button class="share-btn share-whatsapp" onclick="shareAffiliateLink(\'whatsapp\')"><i class="fab fa-whatsapp"></i></button>';
    html += '<button class="share-btn share-facebook" onclick="shareAffiliateLink(\'facebook\')"><i class="fab fa-facebook"></i></button>';
    html += '<button class="share-btn share-telegram" onclick="shareAffiliateLink(\'telegram\')"><i class="fab fa-telegram"></i></button>';
    html += '<button class="share-btn share-twitter" onclick="shareAffiliateLink(\'twitter\')"><i class="fab fa-twitter"></i></button>';
    html += '<button class="share-btn share-instagram" onclick="shareAffiliateLink(\'instagram\')"><i class="fab fa-instagram"></i></button>';
    html += '<button class="share-btn share-tiktok" onclick="shareAffiliateLink(\'tiktok\')"><i class="fab fa-tiktok"></i></button>';
    html += '</div>';
    document.getElementById('appMainContent').innerHTML = html;
    loadAffProducts();
}

function shareAffiliateLink(platform) {
    var link = APP_BASE_URL + '?ref=' + (STATE.userData ? STATE.userData.username : '');
    var text = 'Join CONNECT - the all-in-one business ecosystem!';
    var urls = {
        whatsapp: 'https://wa.me/?text=' + encodeURIComponent(text + ' ' + link),
        facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(link),
        telegram: 'https://t.me/share/url?url=' + encodeURIComponent(link) + '&text=' + encodeURIComponent(text),
        twitter: 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(link)
    };
    if (urls[platform]) {
        window.open(urls[platform], '_blank');
    } else {
        navigator.clipboard.writeText(link).then(function() {
            toast('Link copied! Share on ' + platform, 'success');
        });
    }
}

async function loadAffProducts() {
    var g = document.getElementById('affProds');
    if (!g) return;
    try {
        var snap = await db.collection('products').where('status', '==', 'active').limit(20).get();
        if (snap.empty) { g.innerHTML = '<p class="empty-state-message">No products</p>'; return; }
        g.innerHTML = '';
        snap.forEach(function(d) {
            var p = d.data();
            g.innerHTML += '<div class="product-card" onclick="openAffProduct(\'' + d.id + '\')">' +
                '<div class="product-card-image">' + (p.images && p.images[0] ? '<img src="' + p.images[0] + '">' : '📦') + '</div>' +
                '<div class="product-card-info"><h5>' + (p.title || 'Product') + '</h5>' +
                '<p class="product-price">' + (p.currency || '€') + (p.price || 0) + '</p>' +
                '<button class="btn-outline btn-xs mt-4" onclick="event.stopPropagation();openAffProduct(\'' + d.id + '\')" style="color:var(--blue);border-color:var(--blue);">🔗 Promote</button>' +
                '</div></div>';
        });
    } catch(e) {
        console.error('Aff products error:', e);
        g.innerHTML = '<p class="empty-state-message">Error loading</p>';
    }
}

function openAffProduct(pid) {
    db.collection('products').doc(pid).get().then(function(d) {
        if (!d.exists) return toast('Product not found', 'error');
        var p = d.data();
        var link = APP_BASE_URL + '?ref=' + (STATE.userData ? STATE.userData.username : '') + '&product=' + pid;
        var html = '<div class="modal-header-row"><h3>🔗 Promote Product</h3><button class="modal-close-button" onclick="closeModal()">✕</button></div>';
        html += '<img src="' + (p.images && p.images[0] ? p.images[0] : 'https://via.placeholder.com/200') + '" style="width:100%;max-height:180px;object-fit:cover;border-radius:8px;margin-bottom:8px;">';
        html += '<h4>' + (p.title || 'Product') + '</h4>';
        html += '<p style="color:var(--purple);font-weight:700;">' + (p.currency || '€') + (p.price || 0) + '</p>';
        html += '<p style="font-size:0.75rem;color:var(--gray-500);">Share this link. All purchases count toward your affiliate earnings.</p>';
        html += '<div class="promote-link-box">' + link + '</div>';
        html += '<button class="btn-primary btn-full mt-8" onclick="startAffPromote(\'' + pid + '\',\'' + link.replace(/'/g, "\\'") + '\')">Start Promote</button>';
        html += '<button class="btn-outline btn-full mt-8" onclick="copyText(\'' + link.replace(/'/g, "\\'") + '\')">Copy Link</button>';
        document.getElementById('modalContent').innerHTML = html;
        showModal();
    });
}

function startAffPromote(pid, link) {
    toast('Promotion started! Share your link.', 'success');
    closeModal();
    var html = '<div class="modal-header-row"><h3>📤 Share Affiliate Link</h3><button class="modal-close-button" onclick="closeModal()">✕</button></div>';
    html += '<div class="promote-link-box">' + link + '</div>';
    html += '<div class="share-buttons">';
    html += '<button class="share-btn share-whatsapp" onclick="shareToPlatform(\'whatsapp\',\'' + encodeURIComponent(link) + '\')"><i class="fab fa-whatsapp"></i></button>';
    html += '<button class="share-btn share-facebook" onclick="shareToPlatform(\'facebook\',\'' + encodeURIComponent(link) + '\')"><i class="fab fa-facebook"></i></button>';
    html += '<button class="share-btn share-telegram" onclick="shareToPlatform(\'telegram\',\'' + encodeURIComponent(link) + '\')"><i class="fab fa-telegram"></i></button>';
    html += '<button class="share-btn share-twitter" onclick="shareToPlatform(\'twitter\',\'' + encodeURIComponent(link) + '\')"><i class="fab fa-twitter"></i></button>';
    html += '</div>';
    html += '<button class="btn-primary btn-full mt-8" onclick="copyText(\'' + link.replace(/'/g, "\\'") + '\')">Copy Link</button>';
    document.getElementById('modalContent').innerHTML = html;
    showModal();
}

function copyText(t) {
    navigator.clipboard.writeText(t).then(function() { toast('Copied!', 'success'); closeModal(); });
}

async function setupAffiliate() {
    var n = document.getElementById('affName').value.trim();
    var u = document.getElementById('affUser').value.trim();
    var p = document.getElementById('affPhone').value.trim();
    var w = document.getElementById('affWA').value.trim();
    if (!n || !u) return toast('Fill required fields', 'error');
    var id = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    try {
        await db.collection('users').doc(STATE.user.uid).update({
            affiliate: { name: n, username: u, phone: p, whatsapp: w, id: id, balance: 0, completed: 0, level: 1 }
        });
        STATE.userData.affiliate = { name: n, username: u, phone: p, whatsapp: w, id: id, balance: 0, completed: 0, level: 1 };
        toast('Affiliate ID generated!', 'success');
        renderAffiliate();
    } catch(e) {
        console.error('Affiliate setup error:', e);
        toast('Failed', 'error');
    }
}

async function affCashout() {
    var a = STATE.userData.affiliate;
    var amt = parseFloat(prompt('Amount to cash out (€):'));
    if (!amt || amt < 1 || amt > (a.balance || 0)) return toast('Invalid amount', 'error');
    var pin = prompt('Enter security PIN:');
    if (pin !== STATE.userData.securityPin) return toast('Invalid PIN', 'error');
    var c = getUserCountry();
    showLoading('Processing...');
    try {
        await db.collection('users').doc(STATE.user.uid).update({
            'affiliate.balance': firebase.firestore.FieldValue.increment(-amt),
            affiliateBalance: firebase.firestore.FieldValue.increment(-amt),
            balance: firebase.firestore.FieldValue.increment(amt)
        });
        STATE.userData.affiliate.balance -= amt;
        STATE.userData.balance = (STATE.userData.balance || 0) + amt;
        await db.collection('transactions').add({
            userId: STATE.user.uid, type: 'affiliate_cashout', amount: amt,
            localCurrency: c.currency, localAmount: amt * c.rate, status: 'completed',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        hideLoading();
        toast(c.symbol + (amt * c.rate).toFixed(2) + ' added to wallet!', 'success');
        renderAffiliate();
    } catch(e) {
        hideLoading();
        console.error('Cashout error:', e);
        toast('Failed', 'error');
    }
}

function affiliateProduct(pid) {
    if (!STATE.userData || !STATE.userData.subscription) return toast('Subscribe to become an affiliate', 'error');
    if (!STATE.userData.affiliate) return toast('Set up affiliate profile first', 'error');
    openAffProduct(pid);
}

// ============================================
// CART & ORDERS
// ============================================
function addToCart(pid) {
    if (STATE.cart.find(function(i) { return i.id === pid; })) return toast('Already in cart', 'info');
    STATE.cart.push({ id: pid });
    saveCartToStorage();
    updateCartBadge();
    toast('Added to cart!', 'success');
}

function removeFromCart(pid) {
    STATE.cart = STATE.cart.filter(function(i) { return i.id !== pid; });
    saveCartToStorage();
    updateCartBadge();
    renderCart();
}

async function renderCart() {
    if (STATE.cart.length === 0) {
        document.getElementById('appMainContent').innerHTML = '<p class="empty-state-message">Your cart is empty</p>';
        return;
    }
    showLoading('Loading cart...');
    var h = '<h3>🛒 Cart</h3>';
    var t = 0;
    for (var i = 0; i < STATE.cart.length; i++) {
        var item = STATE.cart[i];
        try {
            var d = await db.collection('products').doc(item.id).get();
            if (!d.exists || d.data().status === 'deleted') continue;
            var p = d.data();
            t += p.price || 0;
            h += '<div class="cart-item-row"><div class="cart-item-image">📦</div><div class="cart-item-details"><h4>' + (p.title || 'Product') + '</h4></div><div class="cart-item-price">' + (p.currency || '€') + (p.price || 0).toFixed(2) + '</div><button class="cart-item-remove" onclick="removeFromCart(\'' + item.id + '\')">✕</button></div>';
        } catch(e) {
            console.error('Cart item error:', e);
        }
    }
    h += '<div style="text-align:right;font-size:1.2rem;font-weight:700;margin:16px 0;">Total: <span style="color:var(--purple);">€' + t.toFixed(2) + '</span></div>';
    h += '<button class="btn-primary btn-full" onclick="checkoutCart()">Checkout</button>';
    document.getElementById('appMainContent').innerHTML = h;
    hideLoading();
}

async function checkoutCart() {
    if (STATE.cart.length === 0) return toast('Cart is empty', 'error');
    var items = [];
    for (var i = 0; i < STATE.cart.length; i++) {
        try {
            var d = await db.collection('products').doc(STATE.cart[i].id).get();
            if (d.exists && d.data().status !== 'deleted') {
                items.push({ id: STATE.cart[i].id, title: d.data().title, price: d.data().price, type: d.data().type, ownerId: d.data().ownerId });
            }
        } catch(e) {}
    }
    if (items.length === 0) return toast('No valid items', 'error');
    STATE.cart = [];
    saveCartToStorage();
    updateCartBadge();
    document.getElementById('appMainContent').innerHTML = '<p class="empty-state-message">Use Buy Now on each product for delivery details</p>';
    toast('Use Buy Now for each product', 'info');
}

function renderOrders() {
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
        if (snap.empty) { c.innerHTML = '<p class="empty-state-message">No orders found</p>'; return; }
        c.innerHTML = '';
        snap.forEach(function(d) {
            var o = d.data();
            var sc = o.status === 'completed' ? 'var(--green)' : o.status === 'refunded' ? 'var(--red)' : o.status === 'processing' ? 'var(--blue)' : 'var(--gold)';
            var del = o.deliveryDetails ? '<p style="font-size:0.65rem;color:var(--gray-500);">📍 ' + o.deliveryDetails.location + ', ' + o.deliveryDetails.state + '</p>' : '';
            var cb = '';
            if (o.status === 'pending' && o.escrow) {
                cb += '<button class="btn-primary btn-sm mt-8" onclick="confirmDelivery(\'' + d.id + '\')">✅ Confirm Received</button>';
                cb += '<button class="btn-outline btn-xs mt-8" onclick="openDisputeOrder(\'' + d.id + '\')" style="color:var(--red);border-color:var(--red);">🚩 Not Delivered</button>';
            }
            c.innerHTML += '<div class="card-white"><div style="display:flex;justify-content:space-between;"><span>#' + d.id.substring(0, 8) + '</span><span style="color:' + sc + ';font-weight:600;">' + o.status + '</span></div>' +
                '<div style="display:flex;justify-content:space-between;margin-top:4px;"><span>' + (o.itemName || 'Item') + '</span><span style="font-weight:700;color:var(--purple);">€' + (o.total || 0).toFixed(2) + '</span></div>' +
                (o.discountCode ? '<p style="font-size:0.65rem;color:var(--green);">🎟️ Code: ' + o.discountCode + '</p>' : '') +
                del + cb + '</div>';
        });
    } catch (e) {
        console.error('Orders error:', e);
        c.innerHTML = '<p class="empty-state-message">Error loading orders</p>';
    }
}

function filterOrders(s) { loadOrders(s); }

async function confirmDelivery(oid) {
    var d = await db.collection('orders').doc(oid).get();
    if (!d.exists) return;
    var o = d.data();
    showLoading('Confirming...');
    try {
        await db.collection('orders').doc(oid).update({ status: 'completed' });
        await db.collection('users').doc(o.sellerId).update({ balance: firebase.firestore.FieldValue.increment(o.total || 0) });
        var storeSnap = await db.collection('stores').where('ownerId', '==', o.sellerId).limit(1).get();
        if (!storeSnap.empty) {
            await db.collection('stores').doc(storeSnap.docs[0].id).update({ storeBalance: firebase.firestore.FieldValue.increment(o.total || 0) });
        }
        if (o.sellerId) {
            await db.collection('notifications').add({
                userId: o.sellerId,
                message: '🎉 Delivery confirmed for "' + (o.itemName || 'Order') + '". Payment released.',
                read: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        hideLoading();
        toast('Delivery confirmed! ✅', 'success');
        loadOrders('all');
    } catch(e) {
        hideLoading();
        console.error('Confirm error:', e);
        toast('Failed', 'error');
    }
}

function openDisputeOrder(oid) {
    var html = '<div class="modal-header-row"><h3>🚩 Order Dispute</h3><button class="modal-close-button" onclick="closeModal()">✕</button></div>';
    html += '<p style="text-align:center;font-size:0.85rem;">Do you agree to receive a refund?</p>';
    html += '<button class="btn-primary btn-full mt-8" onclick="agreeRefund(\'' + oid + '\')">Yes, Refund My Money</button>';
    html += '<button class="btn-outline btn-full mt-8" onclick="closeModal()">No, Keep Open</button>';
    html += '<p style="text-align:center;font-size:0.7rem;color:var(--gray-400);margin-top:8px;">Need help? <a href="mailto:' + CUSTOMER_SERVICE_EMAIL + '">' + CUSTOMER_SERVICE_EMAIL + '</a></p>';
    document.getElementById('modalContent').innerHTML = html;
    showModal();
}

async function agreeRefund(oid) {
    var d = await db.collection('orders').doc(oid).get();
    if (!d.exists) return;
    var o = d.data();
    closeModal();
    showLoading('Processing refund...');
    try {
        await db.collection('orders').doc(oid).update({
            status: 'refunded',
            refundedAt: firebase.firestore.FieldValue.serverTimestamp(),
            refundReason: 'Buyer agreed - not delivered'
        });
        await db.collection('users').doc(STATE.user.uid).update({ balance: firebase.firestore.FieldValue.increment(o.total || 0) });
        STATE.userData.balance = (STATE.userData.balance || 0) + (o.total || 0);
        await db.collection('transactions').add({
            userId: STATE.user.uid, type: 'refund', amount: o.total || 0,
            itemName: o.itemName, orderId: oid, status: 'completed',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        if (o.sellerId) {
            await db.collection('notifications').add({
                userId: o.sellerId,
                message: '⚠️ Order refunded: "' + (o.itemName || 'Order') + '" - buyer agreed not delivered.',
                read: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        hideLoading();
        toast('Refunded! €' + (o.total || 0).toFixed(2) + ' returned.', 'success');
        loadOrders('all');
    } catch(e) {
        hideLoading();
        console.error('Refund error:', e);
        toast('Failed', 'error');
    }
}

// ============================================
// PROFILE
// ============================================
function renderProfile() {
    if (!STATE.userData) return;
    var d = STATE.userData;
    var html = '<div class="profile-header-section"><img class="profile-avatar-large" src="' + (d.profileImage || 'https://via.placeholder.com/80') + '">';
    html += '<div class="profile-name-display">' + (d.fullName || 'User') + '</div>';
    html += '<div class="profile-username-display">@' + (d.username || 'user') + '</div>';
    html += '<div class="profile-badges-row">';
    if (d.organizer) html += '<span class="badge-pill badge-organizer">🎤 Organizer</span>';
    if (d.verified) html += '<span class="badge-pill badge-verified">✓ Verified</span>';
    if (d.hasStore) html += '<span class="badge-pill badge-store">🏪 Store</span>';
    if (d.hasService) html += '<span class="badge-pill badge-store">🛠️ Service</span>';
    if (d.affiliate) html += '<span class="badge-pill badge-affiliate">🔗 Affiliate</span>';
    if (d.connectJob && d.connectJob.active) html += '<span class="badge-pill badge-connect-job">💼 Connect Job</span>';
    html += '</div></div>';
    html += '<div class="profile-stats-row"><div class="profile-stat-item"><div class="stat-value">' + (d.followers || 0) + '</div><div class="stat-label">Followers</div></div><div class="profile-stat-item"><div class="stat-value">' + (d.following || 0) + '</div><div class="stat-label">Following</div></div><div class="profile-stat-item"><div class="stat-value">' + (d.referrals || 0) + '</div><div class="stat-label">Referrals</div></div></div>';
    html += '<div class="card-white" style="text-align:center;"><p style="font-weight:700;color:var(--purple);">' + formatBalance(d.balance || 0) + '</p><button class="btn-primary btn-sm mt-8" onclick="openDeposit()">Deposit</button> <button class="btn-outline btn-sm mt-8" onclick="openWithdraw()">Withdraw</button></div>';

    if (!d.hasStore) html += '<div class="card-white" style="text-align:center;margin-top:8px;"><button class="btn-primary btn-sm" onclick="openCreateStore()">Create Store</button></div>';
    else html += '<div class="card-white" style="text-align:center;margin-top:8px;"><p style="font-size:0.7rem;">Store ID: ' + (d.storeId || '').substring(0, 12) + '</p><button class="btn-primary btn-sm" onclick="viewStore(\'' + d.storeId + '\')">View Store</button></div>';

    if (d.hasService) html += '<div class="card-white" style="text-align:center;margin-top:8px;"><p style="font-size:0.7rem;">Service ID: ' + (d.serviceId || '').substring(0, 12) + '</p></div>';

    // Plans section - hidden until button clicked
    html += '<div class="card-white" style="text-align:center;margin-top:8px;"><button class="btn-outline btn-sm" id="showPlansBtn" onclick="togglePlans()">📋 View Plans</button></div>';
    html += '<div id="plansSection" class="hidden">';
    html += '<div class="section-header"><h3>📋 Available Plans</h3></div>';
    html += renderPlanCards();
    html += '</div>';

    html += '<div class="profile-menu-list mt-12">';
    html += '<div class="profile-menu-item" onclick="navigateTo(\'wallet\')"><i class="fas fa-wallet"></i> Wallet</div>';
    html += '<div class="profile-menu-item" onclick="navigateTo(\'orders\')"><i class="fas fa-box"></i> Orders</div>';
    html += '<div class="profile-menu-item" onclick="navigateTo(\'connectJobs\')"><i class="fas fa-user-tie"></i> Connect Jobs</div>';
    html += '<div class="profile-menu-item" onclick="openApplyConnectJobPage()"><i class="fas fa-file-alt"></i> Apply for Connect Job</div>';
    html += '<div class="profile-menu-item" onclick="navigateTo(\'affiliate\')"><i class="fas fa-link"></i> Affiliate</div>';
    html += '<div class="profile-menu-item" onclick="openSendMoney()"><i class="fas fa-paper-plane"></i> Send Money</div>';
    html += '<div class="profile-menu-item" onclick="showTransactions()"><i class="fas fa-history"></i> Transactions</div>';
    html += '<div class="profile-menu-item" onclick="openReferral()"><i class="fas fa-users"></i> Referrals</div>';
    html += '<div class="profile-menu-item" onclick="openSecurityPin()"><i class="fas fa-shield-alt"></i> Security PIN</div>';
    html += '<div class="profile-menu-item" onclick="openChangePassword()"><i class="fas fa-key"></i> Change Password</div>';
    html += '<div class="profile-menu-item" onclick="openChangeProfilePic()"><i class="fas fa-camera"></i> Change Profile Picture</div>';
    html += '<div class="profile-menu-item" onclick="openGenderSetting()"><i class="fas fa-venus-mars"></i> Set Gender</div>';
    html += '<div class="profile-menu-item danger-item" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Logout</div>';
    html += '</div>';
    document.getElementById('appMainContent').innerHTML = html;
}

function togglePlans() {
    var section = document.getElementById('plansSection');
    if (section) {
        section.classList.toggle('hidden');
        var btn = document.getElementById('showPlansBtn');
        if (btn) btn.textContent = section.classList.contains('hidden') ? '📋 View Plans' : '📋 Hide Plans';
    }
}

function openApplyConnectJobPage() {
    navigateTo('connectJobs');
    setTimeout(function() {
        if (!STATE.userData || !STATE.userData.connectJob || !STATE.userData.connectJob.active) {
            openApplyConnectJob();
        }
    }, 500);
}

function openGenderSetting() {
    var currentGender = STATE.userData.gender || '';
    var html = '<div class="modal-header-row"><h3>⚧ Set Gender</h3><button class="modal-close-button" onclick="closeModal()">✕</button></div>';
    html += '<p style="font-size:0.75rem;color:var(--gray-500);margin-bottom:12px;">Required for job applications with gender restrictions</p>';
    html += '<div class="input-group"><select id="userGender" class="input-field select-field"><option value="">Select Gender</option>';
    html += '<option value="male"' + (currentGender === 'male' ? ' selected' : '') + '>Male</option>';
    html += '<option value="female"' + (currentGender === 'female' ? ' selected' : '') + '>Female</option>';
    html += '<option value="other"' + (currentGender === 'other' ? ' selected' : '') + '>Other</option>';
    html += '</select></div>';
    html += '<button class="btn-primary btn-full mt-12" onclick="saveGender()">Save</button>';
    document.getElementById('modalContent').innerHTML = html;
    showModal();
}

async function saveGender() {
    var g = document.getElementById('userGender').value;
    if (!g) return toast('Select gender', 'error');
    try {
        await db.collection('users').doc(STATE.user.uid).update({ gender: g });
        STATE.userData.gender = g;
        closeModal();
        toast('Gender saved!', 'success');
    } catch(e) {
        console.error('Gender error:', e);
        toast('Failed', 'error');
    }
}

function renderPlanCards() {
    var plans = [
        { name: 'STARTER', price: 1, features: ['5 Listings', '10 Store Products', 'Affiliate Access', '2 Jobs/week'], plan: 'starter' },
        { name: 'BUSINESS', price: 5, features: ['50 Listings', '50 Store Products', 'Affiliate Up to €700', 'Priority Ranking', 'Unlimited Jobs'], plan: 'business', popular: true },
        { name: 'ELITE', price: 15, features: ['Unlimited Listings', 'Unlimited Store', 'All Affiliate', 'Verified Badge', 'Dropshipping', 'Unlimited Jobs'], plan: 'elite' }
    ];
    var html = '';
    for (var i = 0; i < plans.length; i++) {
        var p = plans[i];
        html += '<div class="plan-card-mini' + (p.popular ? ' popular' : '') + '" style="position:relative;">';
        if (p.popular) html += '<span class="popular-badge">POPULAR</span>';
        html += '<h4>' + p.name + '</h4><div class="plan-price">€' + p.price + '<span style="font-size:0.6rem;">/mo</span></div><ul>';
        for (var j = 0; j < p.features.length; j++) {
            html += '<li>✓ ' + p.features[j] + '</li>';
        }
        html += '</ul><button class="btn-primary btn-sm btn-full" onclick="subscribeToPlan(\'' + p.plan + '\',' + p.price + ')">' + (STATE.userData && STATE.userData.subscription === p.plan ? 'Current Plan' : 'Subscribe') + '</button></div>';
    }
    return html;
}

async function subscribeToPlan(plan, eurPrice) {
    var c = getUserCountry();
    var localPrice = eurPrice * c.rate;
    if (!confirm('Subscribe to ' + plan.toUpperCase() + ' for ' + c.symbol + localPrice.toFixed(2) + '/month?')) return;
    if ((STATE.userData.balance || 0) < eurPrice) return toast('Insufficient balance', 'error');
    showLoading('Subscribing...');
    try {
        await db.collection('users').doc(STATE.user.uid).update({
            balance: firebase.firestore.FieldValue.increment(-eurPrice),
            subscription: plan,
            subscriptionDate: firebase.firestore.FieldValue.serverTimestamp(),
            verified: plan === 'elite' ? true : (STATE.userData.verified || false)
        });
        STATE.userData.balance -= eurPrice;
        STATE.userData.subscription = plan;
        await db.collection('transactions').add({
            userId: STATE.user.uid, type: 'subscription', amount: eurPrice,
            plan: plan, status: 'completed',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        hideLoading();
        toast('Subscribed to ' + plan.toUpperCase() + '! 🎉', 'success');
        renderProfile();
    } catch(e) {
        hideLoading();
        console.error('Subscribe error:', e);
        toast('Failed', 'error');
    }
}

// ============================================
// WALLET
// ============================================
function renderWallet() {
    var d = STATE.userData;
    var html = '<div class="wallet-hero-card"><div class="wallet-total-label">Total Balance</div><div class="wallet-total-amount">' + formatBalance(d ? d.balance || 0 : 0) + '</div></div>';
    html += '<div class="wallet-sub-grid">';
    html += '<div class="wallet-sub-item"><div class="sub-label">💰 Wallet</div><div class="sub-amount">' + formatBalance(d ? d.balance || 0 : 0) + '</div></div>';
    html += '<div class="wallet-sub-item"><div class="sub-label">💎 Rubies</div><div class="sub-amount" style="color:var(--ruby);">' + (d ? d.rubyBalance || 0 : 0) + '</div></div>';
    html += '<div class="wallet-sub-item"><div class="sub-label">🏪 Store</div><div class="sub-amount">' + formatBalance(d ? d.storeBalance || 0 : 0) + '</div></div>';
    html += '<div class="wallet-sub-item"><div class="sub-label">🔗 Affiliate</div><div class="sub-amount" style="color:var(--blue);">' + formatBalance(d ? d.affiliateBalance || 0 : 0) + '</div></div>';
    html += '<div class="wallet-sub-item"><div class="sub-label">👥 Referral</div><div class="sub-amount" style="color:var(--gold);">' + formatBalance(d ? d.referralBalance || 0 : 0) + '</div></div>';
    html += '<div class="wallet-sub-item"><div class="sub-label">💼 Connect Job</div><div class="sub-amount" style="color:var(--green);">' + (d && d.connectJob ? formatBalance(0) : 'N/A') + '</div></div>';
    html += '</div>';
    html += '<div style="display:flex;gap:8px;flex-wrap:wrap;"><button class="btn-primary btn-sm" onclick="openDeposit()">Deposit</button><button class="btn-outline btn-sm" onclick="openWithdraw()">Withdraw</button><button class="btn-outline btn-sm" onclick="openSendMoney()">Send</button><button class="btn-outline btn-sm" onclick="showTransactions()">History</button></div>';
    document.getElementById('appMainContent').innerHTML = html;
}

// ============================================
// DEPOSIT / WITHDRAW / SEND
// ============================================
function openDeposit() {
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
    if (typeof FlutterwaveCheckout === 'function') {
        var ref = 'DEP-' + Date.now();
        FlutterwaveCheckout({
            public_key: FLW_PUBLIC_KEY,
            tx_ref: ref,
            amount: amt,
            currency: cur,
            payment_options: 'card,banktransfer',
            customer: { email: STATE.user ? STATE.user.email : 'user@connect.com', name: STATE.userData ? STATE.userData.fullName : 'User' },
            callback: async function(res) {
                if (res.status === 'successful') await completeDeposit(amt);
                else toast('Payment incomplete', 'error');
            },
            onclose: function() {},
            customizations: { title: 'CONNECT Deposit', description: 'Wallet Top-up', logo: 'https://via.placeholder.com/100/8b2fc9/fff?text=C' }
        });
    } else {
        toast('Loading payment gateway...', 'info');
    }
}

async function completeDeposit(amt) {
    showLoading('Processing...');
    try {
        var rate = getUserRate();
        var eur = amt / rate;
        await db.collection('users').doc(STATE.user.uid).update({ balance: firebase.firestore.FieldValue.increment(eur) });
        await db.collection('transactions').add({
            userId: STATE.user.uid, type: 'deposit', amount: eur,
            localAmount: amt, localCurrency: getFlwCurrency(),
            status: 'completed', createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        STATE.userData.balance = (STATE.userData.balance || 0) + eur;
        hideLoading();
        toast('Deposit successful! ✅', 'success');
    } catch(e) {
        hideLoading();
        console.error('Deposit error:', e);
        toast('Error processing deposit', 'error');
    }
}

function openWithdraw() {
    var html = '<div class="modal-header-row"><h3>💸 Withdraw</h3><button class="modal-close-button" onclick="closeModal()">✕</button></div>';
    html += '<div class="input-group"><input id="wAmt" type="number" class="input-field" placeholder="Amount (' + getUserSymbol() + ')" min="5"></div>';
    html += '<div class="input-group"><input id="wBank" class="input-field" placeholder="Bank Name"></div>';
    html += '<div class="input-group"><input id="wName" class="input-field" placeholder="Account Name"></div>';
    html += '<div class="input-group"><input id="wNum" class="input-field" placeholder="Account Number"></div>';
    html += '<label class="checkbox-label mt-8"><input type="checkbox" id="wConf"><span class="checkbox-mark"></span> Confirm withdrawal</label>';
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
    if (!amt || amt < 5 || eur > (STATE.userData.balance || 0)) return toast('Invalid amount', 'error');
    if (!bank || !name || !num) return toast('Fill all details', 'error');
    var pin = prompt('Enter security PIN:');
    if (pin !== STATE.userData.securityPin) return toast('Invalid PIN', 'error');
    closeModal();
    showLoading('Processing...');
    try {
        await db.collection('users').doc(STATE.user.uid).update({ balance: firebase.firestore.FieldValue.increment(-eur) });
        STATE.userData.balance = (STATE.userData.balance || 0) - eur;
        await db.collection('transactions').add({
            userId: STATE.user.uid, type: 'withdraw', amount: eur,
            localAmount: amt, localCurrency: getFlwCurrency(),
            bankName: bank, accountName: name, accountNumber: num,
            status: 'pending', createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        hideLoading();
        toast('Withdrawal submitted! ✅', 'success');
    } catch(e) {
        hideLoading();
        console.error('Withdraw error:', e);
        toast('Failed', 'error');
    }
}

function openSendMoney() {
    var html = '<div class="modal-header-row"><h3>💸 Send Money</h3><button class="modal-close-button" onclick="closeModal()">✕</button></div>';
    html += '<div class="input-group"><input id="sUser" class="input-field" placeholder="Recipient Username"></div>';
    html += '<div class="input-group"><input id="sAmt" type="number" class="input-field" placeholder="Amount (€)" min="1"></div>';
    html += '<button class="btn-primary btn-full mt-12" onclick="processSend()">Send</button>';
    document.getElementById('modalContent').innerHTML = html;
    showModal();
}

async function processSend() {
    var un = document.getElementById('sUser').value.trim().toLowerCase();
    var amt = parseFloat(document.getElementById('sAmt').value);
    if (!un || !amt || amt < 1 || amt > (STATE.userData.balance || 0)) return toast('Invalid amount or username', 'error');
    closeModal();
    showLoading('Sending...');
    try {
        var sq = await db.collection('users').where('username', '==', un).limit(1).get();
        if (sq.empty || sq.docs[0].id === STATE.user.uid) {
            hideLoading();
            return toast('User not found', 'error');
        }
        var recipientId = sq.docs[0].id;
        await db.collection('users').doc(STATE.user.uid).update({ balance: firebase.firestore.FieldValue.increment(-amt) });
        await db.collection('users').doc(recipientId).update({ balance: firebase.firestore.FieldValue.increment(amt) });
        STATE.userData.balance = (STATE.userData.balance || 0) - amt;
        await db.collection('transactions').add({
            userId: STATE.user.uid, type: 'sent', amount: amt,
            recipientId: recipientId, recipientName: un,
            status: 'completed', createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        await db.collection('transactions').add({
            userId: recipientId, type: 'received', amount: amt,
            senderId: STATE.user.uid, senderName: STATE.userData.username,
            status: 'completed', createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        await db.collection('notifications').add({
            userId: recipientId,
            message: '💰 You received €' + amt.toFixed(2) + ' from @' + STATE.userData.username,
            read: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        hideLoading();
        toast('Sent €' + amt.toFixed(2) + ' to @' + un + '!', 'success');
    } catch(e) {
        hideLoading();
        console.error('Send error:', e);
        toast('Failed to send', 'error');
    }
}

// ============================================
// TRANSACTIONS
// ============================================
async function showTransactions() {
    showLoading('Loading transactions...');
    try {
        var snap = await db.collection('transactions').where('userId', '==', STATE.user.uid).orderBy('createdAt', 'desc').limit(100).get();
        hideLoading();
        var h = '<div class="modal-header-row"><h3>📊 Transactions</h3><button class="modal-close-button" onclick="closeModal()">✕</button></div>';
        h += '<div class="txn-filters"><button class="txn-filter active" onclick="filterTxnModal(\'all\')">All</button><button class="txn-filter" onclick="filterTxnModal(\'month\')">Month</button><button class="txn-filter" onclick="filterTxnModal(\'week\')">Week</button></div>';
        h += '<div id="txnList"></div>';
        document.getElementById('modalContent').innerHTML = h;
        showModal();
        window._txnData = snap.docs;
        renderTxnList('all');
    } catch(e) {
        hideLoading();
        console.error('Transactions error:', e);
        toast('Error loading transactions', 'error');
    }
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
    if (filter === 'month') {
        filtered = window._txnData.filter(function(d) {
            var dt = d.data().createdAt ? d.data().createdAt.toDate() : null;
            return dt && dt.getFullYear() === now.getFullYear() && dt.getMonth() === now.getMonth();
        });
    } else if (filter === 'week') {
        var weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = window._txnData.filter(function(d) {
            var dt = d.data().createdAt ? d.data().createdAt.toDate() : null;
            return dt && dt >= weekAgo;
        });
    }
    if (filtered.length === 0) { c.innerHTML = '<p class="empty-state-message">No transactions</p>'; return; }
    c.innerHTML = '';
    filtered.forEach(function(d) {
        var t = d.data();
        var isIn = ['deposit', 'received', 'reward', 'sale_completed', 'affiliate_cashout', 'connect_job_pay', 'connect_job_withdraw', 'refund'].indexOf(t.type) !== -1;
        var actionHtml = '';
        if (t.type === 'sent' && t.recipientId) {
            actionHtml = '<button class="btn-outline btn-xs mt-4" onclick="event.stopPropagation();resendMoney(\'' + t.recipientId + '\',\'' + (t.recipientName || '') + '\')">↩ Resend</button>';
        }
        c.innerHTML += '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--gray-100);">' +
            '<div><strong>' + formatTxnType(t.type) + '</strong>' +
            (t.recipientName ? '<br><small style="color:var(--gray-500);">To: @' + t.recipientName + '</small>' : '') +
            (t.senderName ? '<br><small style="color:var(--gray-500);">From: @' + t.senderName + '</small>' : '') +
            '<br><small style="color:var(--gray-400);">' + (t.createdAt ? t.createdAt.toDate().toLocaleString() : '') + '</small></div>' +
            '<div style="text-align:right;"><span style="color:' + (isIn ? 'var(--green)' : 'var(--red)') + ';font-weight:700;">' + (isIn ? '+' : '-') + '€' + Math.abs(t.amount || 0).toFixed(2) + '</span>' +
            actionHtml + '</div></div>';
    });
}

function formatTxnType(type) {
    var types = {
        'deposit': '💳 Deposit',
        'withdraw': '💸 Withdraw',
        'sent': '📤 Sent Money',
        'received': '📥 Received Money',
        'purchase': '🛒 Purchase',
        'refund': '↩ Refund',
        'subscription': '📋 Subscription',
        'store_withdraw': '🏪 Store Withdraw',
        'affiliate_cashout': '🔗 Affiliate Cashout',
        'connect_job_pay': '💼 Connect Job Pay',
        'connect_job_withdraw': '💼 CJ Withdraw',
        'reward': '🎁 Reward',
        'sale_completed': '💰 Sale'
    };
    return types[type] || type;
}

function resendMoney(recipientId, recipientName) {
    var amt = parseFloat(prompt('Amount to resend to @' + recipientName + ' (€):'));
    if (!amt || amt < 1 || amt > (STATE.userData.balance || 0)) return toast('Invalid amount', 'error');
    showLoading('Sending...');
    db.collection('users').doc(recipientId).get().then(function(d) {
        if (!d.exists) { hideLoading(); return toast('User not found', 'error'); }
        db.collection('users').doc(STATE.user.uid).update({ balance: firebase.firestore.FieldValue.increment(-amt) });
        db.collection('users').doc(recipientId).update({ balance: firebase.firestore.FieldValue.increment(amt) });
        STATE.userData.balance = (STATE.userData.balance || 0) - amt;
        db.collection('transactions').add({
            userId: STATE.user.uid, type: 'sent', amount: amt,
            recipientId: recipientId, recipientName: recipientName,
            status: 'completed', createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        db.collection('transactions').add({
            userId: recipientId, type: 'received', amount: amt,
            senderId: STATE.user.uid, senderName: STATE.userData.username,
            status: 'completed', createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        db.collection('notifications').add({
            userId: recipientId,
            message: '💰 You received €' + amt.toFixed(2) + ' from @' + STATE.userData.username,
            read: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        hideLoading();
        toast('Sent €' + amt.toFixed(2) + '!', 'success');
    }).catch(function(e) {
        hideLoading();
        console.error('Resend error:', e);
        toast('Failed', 'error');
    });
}

// ============================================
// REFERRAL
// ============================================
function openReferral() {
    var d = STATE.userData;
    var link = APP_BASE_URL + '?ref=' + (d ? d.username : '');
    var html = '<div class="modal-header-row"><h3>👥 Referrals</h3><button class="modal-close-button" onclick="closeModal()">✕</button></div>';
    html += '<div style="text-align:center;padding:16px;background:var(--gray-50);border-radius:12px;">';
    html += '<div style="font-size:1.5rem;font-weight:800;color:var(--purple);">@' + (d ? d.username : 'N/A') + '</div>';
    html += '<p>' + (d ? d.referrals || 0 : 0) + ' referrals</p>';
    html += '<p style="color:var(--gold);">Referral Balance: ' + formatBalance(d ? d.referralBalance || 0 : 0) + '</p>';
    if ((d ? d.referralBalance || 0 : 0) >= 0.30) {
        html += '<button class="btn-primary btn-sm mt-8" onclick="withdrawReferral()">Withdraw (Min €0.30)</button>';
    }
    html += '</div>';
    html += '<div class="promote-link-box mt-8">' + link + '</div>';
    html += '<button class="btn-primary btn-full mt-8" onclick="copyText(\'' + link.replace(/'/g, "\\'") + '\')">Copy Link</button>';
    html += '<div class="share-buttons mt-8">';
    html += '<button class="share-btn share-whatsapp" onclick="shareToPlatform(\'whatsapp\',\'' + encodeURIComponent(link) + '\')"><i class="fab fa-whatsapp"></i></button>';
    html += '<button class="share-btn share-facebook" onclick="shareToPlatform(\'facebook\',\'' + encodeURIComponent(link) + '\')"><i class="fab fa-facebook"></i></button>';
    html += '<button class="share-btn share-telegram" onclick="shareToPlatform(\'telegram\',\'' + encodeURIComponent(link) + '\')"><i class="fab fa-telegram"></i></button>';
    html += '<button class="share-btn share-twitter" onclick="shareToPlatform(\'twitter\',\'' + encodeURIComponent(link) + '\')"><i class="fab fa-twitter"></i></button>';
    html += '</div>';
    document.getElementById('modalContent').innerHTML = html;
    showModal();
}

async function withdrawReferral() {
    var bal = STATE.userData ? STATE.userData.referralBalance || 0 : 0;
    if (bal < 0.30) return toast('Minimum €0.30', 'error');
    var pin = prompt('Enter security PIN:');
    if (pin !== STATE.userData.securityPin) return toast('Invalid PIN', 'error');
    try {
        await db.collection('users').doc(STATE.user.uid).update({
            referralBalance: 0,
            balance: firebase.firestore.FieldValue.increment(bal)
        });
        STATE.userData.balance = (STATE.userData.balance || 0) + bal;
        STATE.userData.referralBalance = 0;
        await db.collection('transactions').add({
            userId: STATE.user.uid, type: 'referral_withdraw', amount: bal, status: 'completed',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        toast('€' + bal.toFixed(2) + ' transferred!', 'success');
        closeModal();
    } catch(e) {
        console.error('Referral withdraw error:', e);
        toast('Failed', 'error');
    }
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
    if (el.value.length === 1) {
        var n = document.getElementById(next);
        if (n) n.focus();
    }
}

async function savePin() {
    var pin = '';
    for (var i = 1; i <= 4; i++) {
        var el = document.getElementById('pin' + i);
        pin += el ? el.value : '';
    }
    if (pin.length !== 4) return toast('Enter 4 digits', 'error');
    try {
        await db.collection('users').doc(STATE.user.uid).update({ securityPin: pin });
        STATE.userData.securityPin = pin;
        closeModal();
        toast('PIN saved!', 'success');
    } catch(e) {
        console.error('PIN error:', e);
        toast('Failed', 'error');
    }
}

function openChangePassword() {
    var html = '<div class="modal-header-row"><h3>🔑 Change Password</h3><button class="modal-close-button" onclick="closeModal()">✕</button></div>';
    html += '<div class="input-group"><input id="newPw" type="password" class="input-field" placeholder="New Password"></div>';
    html += '<div class="input-group"><input id="newPw2" type="password" class="input-field" placeholder="Confirm Password"></div>';
    html += '<button class="btn-primary btn-full mt-12" onclick="changePassword()">Change</button>';
    document.getElementById('modalContent').innerHTML = html;
    showModal();
}

async function changePassword() {
    var pw = document.getElementById('newPw').value;
    var cp = document.getElementById('newPw2').value;
    if (!pw || pw.length < 6) return toast('Min 6 characters', 'error');
    if (pw !== cp) return toast('Passwords do not match', 'error');
    var user = auth.currentUser;
    if (!user) return toast('Not logged in', 'error');
    try {
        await user.updatePassword(pw);
        toast('Password changed!', 'success');
        closeModal();
    } catch(e) {
        console.error('Password error:', e);
        if (e.code === 'auth/requires-recent-login') toast('Please re-login first', 'error');
        else toast('Failed to change', 'error');
    }
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
    if (!f) return toast('Select an image', 'error');
    showLoading('Uploading...');
    try {
        var url = await uploadToCloud(f);
        await db.collection('users').doc(STATE.user.uid).update({ profileImage: url });
        STATE.userData.profileImage = url;
        updateHeaderUI();
        hideLoading();
        toast('Profile picture updated!', 'success');
        closeModal();
    } catch(e) {
        hideLoading();
        console.error('PFP error:', e);
        toast('Upload failed', 'error');
    }
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
    var container = document.getElementById('toastContainer');
    if (!container) return;
    var el = document.createElement('div');
    el.className = 'toast-message toast-' + (type || 'info');
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(function() { el.remove(); }, 3500);
}

function showLoading(t) {
    var overlay = document.getElementById('loadingOverlay');
    var text = document.getElementById('loadingText');
    if (overlay) overlay.classList.remove('hidden');
    if (text) text.textContent = t || 'Loading...';
}

function hideLoading() {
    var overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.add('hidden');
}

// ============================================
// NOTIFICATIONS
// ============================================
function listenNotifications() {
    if (!STATE.user) return;
    try {
        db.collection('notifications').where('userId', '==', STATE.user.uid).where('read', '==', false)
            .onSnapshot(function(snap) {
                var badge = document.getElementById('notificationBadge');
                if (badge) {
                    var count = snap.size;
                    badge.textContent = count > 99 ? '99+' : count;
                    badge.classList.toggle('hidden', count === 0);
                }
            }, function(err) {
                console.error('Notification listener error:', err);
            });
    } catch(e) {
        console.error('Notification setup error:', e);
    }
}

function toggleNotifs() {
    var panel = document.getElementById('notificationPanel');
    if (!panel) return;
    panel.classList.toggle('hidden');
    if (!panel.classList.contains('hidden')) {
        db.collection('notifications').where('userId', '==', STATE.user.uid).orderBy('createdAt', 'desc').limit(20).get()
            .then(function(snap) {
                var list = document.getElementById('notificationList');
                if (!list) return;
                if (snap.empty) { list.innerHTML = '<p class="empty-state-message">No notifications</p>'; return; }
                list.innerHTML = '';
                snap.forEach(function(d) {
                    var n = d.data();
                    list.innerHTML += '<div style="padding:12px;border-bottom:1px solid var(--gray-100);cursor:pointer;font-size:0.8rem;" onclick="markNotif(\'' + d.id + '\')"><p>' + (n.message || '') + '</p><small style="color:var(--gray-400);">' + (n.createdAt ? n.createdAt.toDate().toLocaleString() : '') + '</small></div>';
                });
            }).catch(function(e) {
                console.error('Notification load error:', e);
            });
    }
}

async function markNotif(id) {
    try {
        await db.collection('notifications').doc(id).update({ read: true });
    } catch(e) {
        console.error('Mark notif error:', e);
    }
}

// ============================================
// EVENT LISTENERS
// ============================================
document.getElementById('onboardingNext').addEventListener('click', nextOnboarding);
document.getElementById('onboardingSkip').addEventListener('click', skipOnboarding);
document.getElementById('loginSubmitButton').addEventListener('click', login);
document.getElementById('googleLoginButton').addEventListener('click', loginGoogle);
document.getElementById('appleLoginButton').addEventListener('click', loginApple);
document.getElementById('googleRegisterButton').addEventListener('click', loginGoogle);
document.getElementById('appleRegisterButton').addEventListener('click', loginApple);
document.getElementById('registerSubmitButton').addEventListener('click', register);
document.getElementById('resetPasswordButton').addEventListener('click', resetPassword);
document.getElementById('forgotPasswordLink').addEventListener('click', showForgotPasswordForm);
document.getElementById('showRegisterLink').addEventListener('click', showRegisterForm);
document.getElementById('showLoginLink').addEventListener('click', showLoginForm);
document.getElementById('backToLoginLink').addEventListener('click', showLoginForm);
document.getElementById('headerNotificationBtn').addEventListener('click', toggleNotifs);
document.getElementById('headerCartBtn').addEventListener('click', function() { navigateTo('cart'); });
document.getElementById('loginPwToggle').addEventListener('click', function() {
    var pw = document.getElementById('loginPassword');
    if (pw) pw.type = pw.type === 'password' ? 'text' : 'password';
});
document.getElementById('regAccountType').addEventListener('change', toggleSvcCat);
document.getElementById('regCountrySearch').addEventListener('input', filterCountryDropdown);
document.getElementById('regStateSearch').addEventListener('input', filterStateDropdown);
document.getElementById('regProfileImage').addEventListener('change', previewProfileImage);
document.getElementById('modalOverlay').addEventListener('click', closeModal);
document.getElementById('closeNotificationPanel').addEventListener('click', toggleNotifs);
document.getElementById('appHeaderLeft').addEventListener('click', function() { navigateTo('home'); });

// Handle URL parameters for referrals
(function() {
    var params = new URLSearchParams(window.location.search);
    var ref = params.get('ref');
    if (ref) {
        localStorage.setItem('cn_referral', ref);
    }
})();

console.log('✅ CONNECT App - Production Ready');
console.log('💼 Jobs | 🏪 Stores | 🛠️ Services | 🔗 Affiliate | 💼 Connect Jobs');
console.log('📧 Support: ' + CUSTOMER_SERVICE_EMAIL);
console.log('🌐 App URL: ' + APP_BASE_URL);