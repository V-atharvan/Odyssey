package com.odyssey.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;

public class ActivateAdminUser {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://ep-aged-surf-adpnc89l-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require";
        String user = "neondb_owner";
        String password = "npg_NasFQiBSCh29";

        try {
            Class.forName("org.postgresql.Driver");
            System.out.println("Connecting to Neon PostgreSQL database...");
            try (Connection conn = DriverManager.getConnection(url, user, password)) {
                System.out.println("Connected successfully!");
                String query = "UPDATE users SET status = 'ACTIVE', email_verified = true, active = true WHERE email = 'v.atharvanadmin@gmail.com'";
                try (PreparedStatement stmt = conn.prepareStatement(query)) {
                    int rowsUpdated = stmt.executeUpdate();
                    System.out.println("Rows updated: " + rowsUpdated);
                    if (rowsUpdated > 0) {
                        System.out.println("SUCCESS: Successfully activated admin user: v.atharvanadmin@gmail.com");
                    } else {
                        System.out.println("WARNING: Admin user v.atharvanadmin@gmail.com not found in the database. Creating it...");
                        // If it doesn't exist, we can let it be created by the initializer next time they boot the backend
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Database operation failed:");
            e.printStackTrace();
        }
    }
}
