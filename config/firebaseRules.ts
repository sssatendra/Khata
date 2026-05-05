// Configure Firebase Security Rules for Production

export const FIRESTORE_RULES = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users
    function isAuthenticated() {
      return request.auth != null;
    }

    function isAdmin(shopId) {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.shopId == shopId;
    }

    function isStaff(shopId) {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.shopId == shopId;
    }

    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated() && (resource.data.shopId == get(/databases/$(database)/documents/users/$(request.auth.uid)).data.shopId || request.auth.uid == userId);
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && request.auth.uid == userId;
      allow delete: if isAdmin(resource.data.shopId);
    }

    // Shops collection
    match /shops/{shopId} {
      allow read: if isAuthenticated() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.shopId == shopId;
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && isAdmin(shopId);
      allow delete: if isAuthenticated() && isAdmin(shopId);
    }

    // Customers collection
    match /customers/{customerId} {
      allow read: if isAuthenticated() && isStaff(resource.data.shopId);
      allow create: if isAuthenticated() && isStaff(request.resource.data.shopId);
      allow update: if isAuthenticated() && (isAdmin(resource.data.shopId) || isStaff(resource.data.shopId));
      allow delete: if isAuthenticated() && isAdmin(resource.data.shopId);
    }

    // Transactions collection
    match /transactions/{transactionId} {
      allow read: if isAuthenticated() && isStaff(resource.data.shopId);
      allow create: if isAuthenticated() && isStaff(request.resource.data.shopId);
      allow update: if isAuthenticated() && isAdmin(resource.data.shopId);
      allow delete: if isAuthenticated() && isAdmin(resource.data.shopId);
    }
  }
}
`;

export const FIREBASE_STORAGE_RULES = `
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /shops/{shopId}/{allPaths=**} {
      allow read: if request.auth != null && request.auth.uid in resource.metadata.authorizedUsers;
      allow write: if request.auth != null && request.auth.uid in request.resource.metadata.authorizedUsers;
    }
  }
}
`;
