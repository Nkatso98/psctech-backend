"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.db = exports.auth = void 0;
var app_1 = require("firebase/app");
var auth_1 = require("firebase/auth");
var firestore_1 = require("firebase/firestore");
var storage_1 = require("firebase/storage");
// Your Firebase configuration
// Real configuration for psctechsuperadmin project
var firebaseConfig = {
    apiKey: "AIzaSyAQF76hBKQy8sn7rAsvYN94IfZl2Zx3oWY",
    authDomain: "psctechsuperadmin.firebaseapp.com",
    projectId: "psctechsuperadmin",
    storageBucket: "psctechsuperadmin.firebasestorage.app",
    messagingSenderId: "768756486561",
    appId: "1:768756486561:web:e2960a3072df2817583be0",
    measurementId: "G-YRM9TG9YYQ"
};
// Initialize Firebase
var app = (0, app_1.initializeApp)(firebaseConfig);
// Initialize Firebase services
exports.auth = (0, auth_1.getAuth)(app);
exports.db = (0, firestore_1.getFirestore)(app);
exports.storage = (0, storage_1.getStorage)(app);
exports.default = app;
