// This file defines custom error types for the application.
// Using custom errors allows for more specific error handling
// and provides richer context for debugging.

export type SecurityRuleContext = {
    path: string;
    operation: 'get' | 'list' | 'create' | 'update' | 'delete';
    // The `request.resource.data` in security rules.
    requestResourceData?: any;
};

// A custom error for Firestore permission issues.
export class FirestorePermissionError extends Error {
  public context: SecurityRuleContext;

  constructor(context: SecurityRuleContext) {
    const prettyContext = JSON.stringify(context, null, 2);
    const message = `FirestoreError: Missing or insufficient permissions. The following request was denied by Firestore Security Rules:\n${prettyContext}`;
    
    super(message);
    this.name = 'FirestorePermissionError';
    this.context = context;
    
    // This is for V8 environments (like Node.js and Chrome)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FirestorePermissionError);
    }
  }
}
