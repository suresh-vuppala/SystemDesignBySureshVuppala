/**
 * Firebase Cloud Function — Razorpay Payment Webhook
 * 
 * SETUP:
 * 1. cd functions && npm install
 * 2. firebase functions:config:set razorpay.webhook_secret="YOUR_WEBHOOK_SECRET"
 * 3. firebase deploy --only functions
 * 4. In Razorpay Dashboard → Settings → Webhooks → Add:
 *    URL: https://<region>-<project-id>.cloudfunctions.net/razorpayWebhook
 *    Events: payment.captured
 *    Secret: same as step 2
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const crypto = require("crypto");

admin.initializeApp();
const db = admin.firestore();

exports.razorpayWebhook = functions.https.onRequest(async (req, res) => {
  // Only accept POST
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  // Verify webhook signature
  const webhookSecret = functions.config().razorpay.webhook_secret;
  const signature = req.headers["x-razorpay-signature"];

  if (!signature) {
    return res.status(400).send("Missing signature");
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (signature !== expectedSignature) {
    console.error("Invalid webhook signature");
    return res.status(400).send("Invalid signature");
  }

  // Process payment.captured event
  const event = req.body.event;
  if (event !== "payment.captured") {
    // Acknowledge other events but don't process
    return res.status(200).send("OK");
  }

  const payment = req.body.payload.payment.entity;
  const paymentId = payment.id;
  const email = payment.email;
  const amount = payment.amount; // in paise
  const notes = payment.notes || {};
  const uid = notes.uid; // We'll pass uid in payment notes

  console.log(`Payment captured: ${paymentId}, email: ${email}, amount: ${amount}, uid: ${uid}`);

  // Find user by uid (passed in notes) or by email
  let userRef = null;

  if (uid) {
    userRef = db.collection("users").doc(uid);
  } else if (email) {
    // Fallback: find user by email
    const snapshot = await db.collection("users").where("email", "==", email).limit(1).get();
    if (!snapshot.empty) {
      userRef = snapshot.docs[0].ref;
    }
  }

  if (userRef) {
    await userRef.set({
      isPremium: true,
      purchasedAt: new Date().toISOString(),
      razorpayPaymentId: paymentId,
      amountPaid: amount,
      verifiedByWebhook: true,
    }, { merge: true });

    console.log(`User ${uid || email} marked as premium`);
  } else {
    // Store payment for manual reconciliation
    await db.collection("unmatched_payments").doc(paymentId).set({
      email: email,
      amount: amount,
      paymentId: paymentId,
      timestamp: new Date().toISOString(),
    });
    console.warn(`No user found for payment ${paymentId}, stored for reconciliation`);
  }

  return res.status(200).send("OK");
});
