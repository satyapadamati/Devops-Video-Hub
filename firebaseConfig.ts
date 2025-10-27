
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// SECURITY WARNING: Your previous API key was exposed and is public.
// 1. Go to your Google Cloud Console and DELETE the old key immediately.
// 2. CREATE a new key.
// 3. RESTRICT the new key to your website's URL under "Application restrictions".
// 4. PASTE the new, restricted key here.
const firebaseConfig = {
  apiKey: "PASTE_YOUR_NEW_RESTRICTED_API_KEY_HERE",
  authDomain: "devops-hub-d249a.firebaseapp.com",
  projectId: "devops-hub-d249a",
  storageBucket: "devops-hub-d249a.firebasestorage.app",
  messagingSenderId: "68559255729",
  appId: "1:68559255729:web:1fcab0d4dee4370061ca90",
  measurementId: "G-ZF1WXG2RCN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
