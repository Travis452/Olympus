import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [completedWorkouts, setCompletedWorkouts] = useState(0);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        const userDoc = await getDoc(doc(db, "users", authUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();

          // Convert Firestore Timestamps to JavaScript Date objects
          const sanitizedUserData = {
            ...userData,
            createdAt: userData.createdAt?.toDate?.() || new Date(),
            updatedAt: userData.updatedAt?.toDate?.() || new Date(),
          };

          setUser({
            uid: authUser.uid,
            email: authUser.email,
            ...sanitizedUserData,
          });
          setCompletedWorkouts(userData.completedWorkouts || 0);
        } else {
          setUser({
            uid: authUser.uid,
            email: authUser.email,
            firstName: "",
            lastName: "",
            completedWorkouts: 0,
            createdAt: new Date(),
          });
          setCompletedWorkouts(0);
        }
      } else {
        setUser(null);
        setCompletedWorkouts(0);
      }
      setIsLoading(false);
    });

    return unsub;
  }, []);

  return { user, isLoading, completedWorkouts };
}
