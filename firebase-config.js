// ═══════════════════════════════════════════════════════════════
// EMPIRE — firebase-config.js
// Connects the game to Firebase so save data lives in the cloud.
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WHAT IS FIREBASE?
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Firebase is Google's free cloud storage service.
// It lets your game save data online so players can pick up
// their progress on any device, any browser, any time.
//
// The FREE plan (Spark) gives you:
//   • 1 GB of storage       — enough for millions of save files
//   • 10 GB/month transfers — more than enough for 5–20 players
//   • No credit card needed
//   • Never expires
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HOW TO SET UP FIREBASE (step by step)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// STEP 1 — Create a Firebase project
//   • Go to: https://firebase.google.com
//   • Click "Get started" and sign in with your Google account
//   • Click "Create a project"
//   • Name it: empire-fvgs
//   • On the "Google Analytics" page, turn it OFF (not needed)
//   • Click "Create project" and wait for it to finish
//
// STEP 2 — Create the Realtime Database
//   • In the left side menu, click "Build" → "Realtime Database"
//   • Click the blue "Create Database" button
//   • Choose the server location closest to you (US or Europe)
//   • When asked for security rules, choose "Start in test mode"
//     (This lets anyone read/write for 30 days — perfect for playtesting)
//   • Click "Enable"
//   • You should now see a database URL like:
//     https://empire-fvgs-default-rtdb.firebaseio.com/
//     COPY THAT URL — you'll need it below.
//
// STEP 3 — Register your web app
//   • Click the gear icon ⚙️ at the top of the left menu
//   • Click "Project settings"
//   • Scroll down to the "Your apps" section
//   • Click the web icon: </>
//   • App nickname: empire
//   • DO NOT check "Firebase Hosting" — leave it unchecked
//   • Click "Register app"
//   • You will see a block of code like this:
//
//       const firebaseConfig = {
//         apiKey: "AIzaSy...",
//         authDomain: "empire-fvgs.firebaseapp.com",
//         databaseURL: "https://empire-fvgs-default-rtdb.firebaseio.com",
//         projectId: "empire-fvgs",
//         storageBucket: "empire-fvgs.appspot.com",
//         messagingSenderId: "123456789",
//         appId: "1:123456789:web:abc123"
//       };
//
//   • COPY those values and paste them into the firebaseConfig
//     object below, replacing the "YOUR_..." placeholders.
//
// STEP 4 — Paste your config below and save this file
//
// STEP 5 — Done! The game will now save to the cloud automatically.
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WHAT EACH FIELD MEANS (plain English)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//   apiKey           — like a password that lets the game talk to Firebase
//   authDomain       — the web address for login (we don't use login, but it's required)
//   databaseURL      — the web address of YOUR specific database ← most important one
//   projectId        — the internal name Firebase uses for your project
//   storageBucket    — where files would be stored (we only use the database, not this)
//   messagingSenderId — used for push notifications (we don't use this)
//   appId            — the unique ID for this specific web app
// ═══════════════════════════════════════════════════════════════


// ── YOUR FIREBASE CONFIG ───────────────────────────────────────
// ⚠️  REPLACE every "YOUR_..." value below with your real values from Firebase.
// ⚠️  Leave the quotes ("") around each value.

const firebaseConfig = {
    apiKey: "AIzaSyDmdsrQr44ksoqNb60XD9aGuXademgc9nU",
    authDomain: "empire-fvgs.firebaseapp.com",
    databaseURL: "https://empire-fvgs-default-rtdb.firebaseio.com",
    projectId: "empire-fvgs",
    storageBucket: "empire-fvgs.firebasestorage.app",
    messagingSenderId: "76630294328",
    appId: "1:76630294328:web:8337f77bbfba86af554bcd"
};


// ── CONNECT TO FIREBASE ────────────────────────────────────────
// This block initializes Firebase and creates a 'db' variable
// that game.js uses to read and write save data.
// If the config above still has placeholder values, Firebase will
// fail silently and the game will fall back to localStorage saves.

(function () {
  try {
    // Check if the developer has filled in their real config
    const isConfigured = !firebaseConfig.apiKey.startsWith("YOUR_");

    if (!isConfigured) {
      // Config not filled in yet — that's okay.
      // The game will still work using localStorage only.
      console.warn(
        "⚠️  Firebase is not configured yet.\n" +
        "    Cloud saves are disabled. The game will save locally.\n" +
        "    Follow the steps in firebase-config.js to enable cloud saves."
      );
      window.db = null; // tells game.js there is no cloud database available
      return;
    }

    // Initialize Firebase using the config above
    firebase.initializeApp(firebaseConfig);

    // Create a reference to the Realtime Database.
    // game.js will use window.db to read and write save data.
    window.db = firebase.database();

    console.log("✅ Firebase connected! Cloud saves are active.");

  } catch (err) {
    // Something went wrong — log it and fall back to localStorage
    console.warn("Firebase setup failed:", err.message);
    window.db = null;
  }
})();
