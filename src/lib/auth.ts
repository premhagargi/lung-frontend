
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User,
  updateProfile,
  confirmPasswordReset as firebaseConfirmPasswordReset,
  applyActionCode,
} from 'firebase/auth';
import { auth } from './firebase';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

// Login with email and password
export async function loginUser(email: string, password: string): Promise<AuthUser> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
    };
  } catch (error) {
    throw new Error(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Register new user
export async function registerUser(email: string, password: string, displayName: string): Promise<AuthUser> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name
    await updateProfile(user, { displayName });

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
    };
  } catch (error) {
    throw new Error(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Logout user
export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error(`Logout failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Send password reset email
export async function resetPassword(email: string): Promise<void> {
  try {
    const actionCodeSettings = {
        url: `${window.location.origin}/reset-password`,
        handleCodeInApp: true,
    };
    await sendPasswordResetEmail(auth, email, actionCodeSettings);
  } catch (error) {
    throw new Error(`Password reset failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Confirm password reset
export async function confirmPasswordReset(oobCode: string, newPassword: string): Promise<void> {
    try {
        await firebaseConfirmPasswordReset(auth, oobCode, newPassword);
    } catch (error) {
        throw new Error(`Password reset failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}


// Listen to auth state changes
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  return onAuthStateChanged(auth, (user: User | null) => {
    if (user) {
      callback({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      });
    } else {
      callback(null);
    }
  });
}
