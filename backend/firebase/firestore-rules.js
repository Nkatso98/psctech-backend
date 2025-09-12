// Firestore security rules for PSC Tech School Portal
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Function to check if the user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Function to check if the user is an administrator
    function isAdmin() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Function to check if the user is a principal
    function isPrincipal() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'principal';
    }
    
    // Function to check if the user is a teacher
    function isTeacher() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher';
    }
    
    // Function to check if the user is a parent
    function isParent() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'parent';
    }
    
    // Function to check if the user is a learner
    function isLearner() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'learner';
    }
    
    // Function to check if the user belongs to the specified institution
    function belongsToInstitution(institutionId) {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.institutionId == institutionId;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
      allow create: if isAuthenticated() && isAdmin();
      allow update: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
      allow delete: if isAdmin();
    }
    
    // Institutions collection
    match /institutions/{institutionId} {
      allow read: if isAuthenticated();
      allow create: if isAdmin();
      allow update: if isAuthenticated() && (isPrincipal() && belongsToInstitution(institutionId)) || isAdmin();
      allow delete: if isAdmin();
    }
    
    // Learners collection
    match /learners/{learnerId} {
      allow read: if isAuthenticated() && (
        isAdmin() || 
        isPrincipal() && belongsToInstitution(resource.data.institutionId) || 
        isTeacher() && belongsToInstitution(resource.data.institutionId) ||
        isParent() && resource.data.parentId == request.auth.uid ||
        isLearner() && learnerId == request.auth.uid
      );
      allow create: if isAuthenticated() && (isAdmin() || isPrincipal() || isTeacher());
      allow update: if isAuthenticated() && (
        isAdmin() || 
        isPrincipal() && belongsToInstitution(resource.data.institutionId) || 
        isTeacher() && belongsToInstitution(resource.data.institutionId)
      );
      allow delete: if isAuthenticated() && (isAdmin() || isPrincipal());
    }
    
    // Teachers collection
    match /teachers/{teacherId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && (isAdmin() || isPrincipal());
      allow update: if isAuthenticated() && (
        isAdmin() || 
        isPrincipal() && belongsToInstitution(resource.data.institutionId) ||
        teacherId == request.auth.uid
      );
      allow delete: if isAuthenticated() && (isAdmin() || isPrincipal());
    }
    
    // Attendances collection
    match /attendances/{attendanceId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && (isAdmin() || isPrincipal() || isTeacher());
      allow update: if isAuthenticated() && (isAdmin() || isPrincipal() || isTeacher());
      allow delete: if isAuthenticated() && (isAdmin() || isPrincipal());
    }
    
    // Performances collection
    match /performances/{performanceId} {
      allow read: if isAuthenticated() && (
        isAdmin() || 
        isPrincipal() || 
        isTeacher() || 
        isParent() && resource.data.learnerId in get(/databases/$(database)/documents/parents/$(request.auth.uid)).data.learnerIds ||
        isLearner() && resource.data.learnerId == request.auth.uid
      );
      allow create: if isAuthenticated() && (isAdmin() || isPrincipal() || isTeacher());
      allow update: if isAuthenticated() && (isAdmin() || isPrincipal() || isTeacher());
      allow delete: if isAuthenticated() && (isAdmin() || isPrincipal());
    }
    
    // Subscriptions collection
    match /subscriptions/{subscriptionId} {
      allow read: if isAuthenticated() && (
        isAdmin() || 
        isParent() && resource.data.parentId == request.auth.uid ||
        isLearner() && resource.data.learnerId == request.auth.uid
      );
      allow create: if isAuthenticated() && (isAdmin() || isParent());
      allow update: if isAuthenticated() && (isAdmin() || resource.data.parentId == request.auth.uid);
      allow delete: if isAdmin();
    }
    
    // Vouchers collection
    match /vouchers/{voucherId} {
      allow read: if isAuthenticated() && (isAdmin() || resource.data.redeemedBy == request.auth.uid);
      allow create: if isAdmin();
      allow update: if isAuthenticated() && (isAdmin() || (!resource.data.isRedeemed && request.resource.data.redeemedBy == request.auth.uid));
      allow delete: if isAdmin();
    }
    
    // Tests collection
    match /tests/{testId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && (isAdmin() || isTeacher());
      allow update: if isAuthenticated() && (isAdmin() || isTeacher() && resource.data.createdBy == request.auth.uid);
      allow delete: if isAuthenticated() && (isAdmin() || isTeacher() && resource.data.createdBy == request.auth.uid);
    }
    
    // Test sessions collection
    match /testSessions/{sessionId} {
      allow read: if isAuthenticated() && (
        isAdmin() || 
        isTeacher() || 
        isLearner() && resource.data.learnerId == request.auth.uid ||
        isParent() && resource.data.learnerId in get(/databases/$(database)/documents/parents/$(request.auth.uid)).data.learnerIds
      );
      allow create: if isAuthenticated() && (isAdmin() || isTeacher());
      allow update: if isAuthenticated() && (
        isAdmin() || 
        isTeacher() || 
        isLearner() && resource.data.learnerId == request.auth.uid
      );
      allow delete: if isAuthenticated() && (isAdmin() || isTeacher() && resource.data.createdBy == request.auth.uid);
    }
    
    // Test results collection
    match /testResults/{resultId} {
      allow read: if isAuthenticated() && (
        isAdmin() || 
        isTeacher() || 
        isLearner() && resource.data.learnerId == request.auth.uid ||
        isParent() && resource.data.learnerId in get(/databases/$(database)/documents/parents/$(request.auth.uid)).data.learnerIds
      );
      allow create: if isAuthenticated() && (isAdmin() || isTeacher());
      allow update: if isAuthenticated() && (isAdmin() || isTeacher());
      allow delete: if isAdmin();
    }
  }
}