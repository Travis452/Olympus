import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';



export default function useAuth() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
            } else {
                setUser(null);
            }
            setIsLoading(false);


        });

        return unsub;
    }, []);

    return { user, isLoading }

}