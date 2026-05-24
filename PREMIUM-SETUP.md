# HelloSDE Premium Setup Guide

## Architecture
```
User clicks "Sign in" → Google OAuth popup → Firebase Auth
User clicks "Upgrade" → Razorpay checkout (₹2500) → Payment success → Firestore marks isPremium=true
Page load → Firebase checks auth state → Firestore checks isPremium → Show/hide premium content
```

## Step 1: Firebase Setup

1. Go to https://console.firebase.google.com
2. Create new project: "hellosde"
3. Enable **Authentication** → Sign-in method → **Google** → Enable
4. Enable **Firestore Database** → Create database (production mode)
5. Go to Project Settings → General → Your apps → Add web app
6. Copy the config object

## Step 2: Razorpay Setup

1. Go to https://dashboard.razorpay.com
2. Create account, complete KYC
3. Get API keys from Settings → API Keys
4. Use `rzp_test_` key for testing, `rzp_live_` for production

## Step 3: Update auth.js Config

Open `js/auth.js` and replace the CONFIG object:

```javascript
var CONFIG = {
  firebase: {
    apiKey: "AIzaSy...",           // from Firebase console
    authDomain: "hellosde.firebaseapp.com",
    projectId: "hellosde",
    storageBucket: "hellosde.appspot.com",
    messagingSenderId: "123...",
    appId: "1:123...:web:abc..."
  },
  razorpay: {
    key: "rzp_live_YOUR_KEY",     // from Razorpay dashboard
    amount: 250000,               // ₹2500 in paise
    currency: "INR",
    name: "HelloSDE",
    description: "Premium Access — Full System Design Content",
    theme: { color: "#6c8cff" }
  }
};
```

## Step 4: Add Scripts to HTML Pages

Add these to every HTML page, BEFORE the closing `</body>` tag:

```html
<!-- Firebase SDK (add before auth.js) -->
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>

<!-- Razorpay SDK -->
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>

<!-- HelloSDE Auth -->
<script src="../js/auth.js"></script>
```

## Step 5: Firestore Security Rules

In Firebase Console → Firestore → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Users can read their own doc
      allow read: if request.auth != null && request.auth.uid == userId;
      // Only server/admin can write (or use Cloud Functions for payment verification)
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## What's Free vs Premium

### Free (65%):
- Cheatsheet: Topics 1-9 (Foundations → Consistency)
- Problems: First 5 problems in each module
- Decision flowcharts (basic)
- Key numbers (latency + throughput tables)

### Premium (35%) — ₹2500:
- Cheatsheet: Topics 10-15 (Scalability deep sections, Data Pipelines, Distributed Systems advanced, Observability full, Key Numbers cost/SLA, Decision Flowcharts advanced)
- Problems: All 201 problems (problems 6-11 in each module)
- Interview cheat sheets (the "5 things to say" panels)
- Step-through SVG animations
- Future updates included

## Firestore User Document Structure

```json
{
  "email": "user@gmail.com",
  "name": "John Doe",
  "isPremium": true,
  "purchasedAt": "2026-05-24T10:30:00Z",
  "razorpayPaymentId": "pay_ABC123XYZ"
}
```

## Testing

1. Set Razorpay key to `rzp_test_...`
2. Use test card: 4111 1111 1111 1111, any future expiry, any CVV
3. Verify Firestore document is created with isPremium: true
4. Refresh page — premium content should be visible

## Production Checklist

- [ ] Replace Firebase config with production values
- [ ] Replace Razorpay key with `rzp_live_` key
- [ ] Set Firestore rules to production
- [ ] Add Firebase authorized domains (your domain)
- [ ] Test payment flow end-to-end
- [ ] Add error handling for failed payments
- [ ] Consider adding Cloud Function for payment verification (server-side)
