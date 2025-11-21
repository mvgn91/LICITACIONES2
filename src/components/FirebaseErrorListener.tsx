'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';
import { useClientEffect } from '@/hooks/use-client-effect';

// This component is responsible for listening to Firestore permission errors
// and displaying them in a toast notification during development.
// It uses a custom hook `useClientEffect` to ensure it only runs on the client.
export function FirebaseErrorListener() {
  const { toast } = useToast();

  useClientEffect(() => {
    const handleError = (error: Error) => {
      // In a real app, you might want to log this to a service like Sentry.
      // For this prototype, we'll just show a toast in development.
      if (process.env.NODE_ENV === 'development') {
        console.error("Caught a Firestore permission error:", error);
        toast({
          variant: "destructive",
          title: "Firestore Security Rule Error",
          description: (
            <pre className="mt-2 w-full rounded-md bg-slate-950 p-4">
              <code className="text-white">{error.message}</code>
            </pre>
          ),
          duration: 20000, // Show for longer
        });
      }
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]); // Dependency array ensures this effect runs only when toast changes.

  return null; // This component does not render anything.
}
