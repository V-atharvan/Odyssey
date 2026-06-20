package com.odyssey.util;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.UserRecord;
import java.io.InputStream;

public class DeleteFirebaseUser {
    public static void main(String[] args) {
        if (args.length == 0) {
            System.out.println("Please provide at least one email address to delete.");
            return;
        }

        try {
            InputStream serviceAccount = DeleteFirebaseUser.class.getClassLoader()
                    .getResourceAsStream("service-account.json");
            if (serviceAccount == null) {
                System.out.println("service-account.json not found in classpath!");
                return;
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
            }

            for (String email : args) {
                try {
                    System.out.println("Searching for user with email: " + email);
                    UserRecord userRecord = FirebaseAuth.getInstance().getUserByEmail(email);
                    System.out.println("Found user. Uid: " + userRecord.getUid());
                    FirebaseAuth.getInstance().deleteUser(userRecord.getUid());
                    System.out.println("Successfully deleted user: " + email + " from Firebase Auth.");
                } catch (Exception e) {
                    if (e.getMessage().contains("USER_NOT_FOUND") || e.getMessage().contains("no user record")) {
                        System.out.println("User not found in Firebase: " + email);
                    } else {
                        System.err.println("Firebase error for " + email + ": " + e.getMessage());
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
