import { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  db, 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword 
} from '../services/firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  writeBatch  // Add this import
} from 'firebase/firestore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkUsername = async (username) => {
	  try {
		if (!username || !username.trim()) {
		  throw new Error("Le pseudo ne peut pas être vide");
		}
		
		const normalizedUsername = username.toLowerCase().trim();
		const userRef = doc(db, 'usernames', normalizedUsername);
		const docSnap = await getDoc(userRef);
		
		if (!docSnap.exists()) {
		  return true; // Le pseudo est disponible
		}
		
		// Si le document existe mais appartient à l'utilisateur actuel, on considère que c'est disponible
		if (currentUser && docSnap.data().uid === currentUser.uid) {
		  return true;
		}
		
		return false; // Le pseudo est déjà pris
	  } catch (err) {
		console.error("Erreur lors de la vérification du pseudo:", err);
		throw new Error("Erreur lors de la vérification du pseudo");
	  }
	};

  const updateUsername = async (newUsername) => {
	  if (!currentUser) throw new Error("Utilisateur non connecté");
  
	  const userRef = doc(db, 'users', currentUser.uid);
	  const userDoc = await getDoc(userRef);
	  
	  if (!userDoc.exists()) {
		throw new Error("Profil utilisateur introuvable - Veuillez vous reconnecter");
	  };
	  
	  const isAvailable = await checkUsername(newUsername);
	  if (!isAvailable) throw new Error("Ce pseudo est déjà pris");

	  // Mettre à jour le document utilisateur
	  await updateDoc(doc(db, 'users', currentUser.uid), {
		username: newUsername,
		updatedAt: new Date()
	  });

	  // Mettre à jour la référence du nom d'utilisateur
	  const batch = writeBatch(db);
	  
	  // Supprimer l'ancien nom d'utilisateur
	  if (currentUser.username) {
		batch.delete(doc(db, 'usernames', currentUser.username.toLowerCase()));
	  }
	  
	  // Ajouter le nouveau
	  batch.set(doc(db, 'usernames', newUsername.toLowerCase()), {
		uid: currentUser.uid
	  });

	  await batch.commit();

	  // Mettre à jour l'utilisateur local
	  setCurrentUser({
		...currentUser,
		username: newUsername
	  });
	};

  const register = async (email, password, username) => {
    const isAvailable = await checkUsername(username);
    if (!isAvailable) throw new Error("Ce pseudo est déjà pris");

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await setUserData(userCredential.user, username);
    return userCredential;
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    
    // Vérifier si c'est une première connexion
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    if (!userDoc.exists()) {
      // Générer un pseudo basé sur le nom Google
      const baseUsername = userCredential.user.displayName.replace(/\s+/g, '').toLowerCase();
      let username = baseUsername;
      let counter = 1;

      while (!(await checkUsername(username))) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      await setUserData(userCredential.user, username);
    }

    return userCredential;
  };

  const setUserData = async (user, username) => {
	  const userRef = doc(db, 'users', user.uid);
	  const usernameRef = doc(db, 'usernames', username.toLowerCase());
	  
	  // Utilisez une transaction ou un batch pour garantir l'intégrité
	  const batch = writeBatch(db);
	  
	  batch.set(userRef, {
		uid: user.uid,
		email: user.email,
		username: username,
		createdAt: new Date(),
		updatedAt: new Date()
	  });

	  batch.set(usernameRef, {
		uid: user.uid,
		createdAt: new Date()
	  });

	  await batch.commit();
	};

  const loginWithEmail = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    return await auth.signOut();
  };

  useEffect(() => {
	  const unsubscribe = auth.onAuthStateChanged(async (user) => {
		if (user) {
		  const userDoc = await getDoc(doc(db, 'users', user.uid));
		  
		  if (userDoc.exists()) {
			const userData = userDoc.data();
			setCurrentUser({
			  uid: user.uid,
			  email: user.email,
			  username: userData.username,
			  createdAt: userData.createdAt?.toDate(), // Conversion Firestore timestamp
			  updatedAt: userData.updatedAt?.toDate()
			});
		  } else {
			// Création du document si inexistant
			await setUserData(user, user.email.split('@')[0]);
		  }
		} else {
		  setCurrentUser(null);
		}
		setLoading(false);
	  });

	  return unsubscribe;
	}, []);

  const value = {
    currentUser,
    register,
    loginWithGoogle,
    loginWithEmail,
    logout,
    updateUsername,
    checkUsername
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}