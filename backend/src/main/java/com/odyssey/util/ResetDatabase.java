package com.odyssey.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;

public class ResetDatabase {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://ep-aged-surf-adpnc89l-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require";
        String user = "neondb_owner";
        String password = "npg_NasFQiBSCh29";

        try {
            Class.forName("org.postgresql.Driver");
            System.out.println("Connecting to Neon PostgreSQL database...");
            try (Connection conn = DriverManager.getConnection(url, user, password)) {
                System.out.println("Connected successfully!");

                // Show count before delete
                try (Statement st = conn.createStatement();
                     ResultSet rs = st.executeQuery("SELECT COUNT(*) FROM users")) {
                    if (rs.next()) System.out.println("Users before delete: " + rs.getInt(1));
                }

                // Use TRUNCATE CASCADE to handle all FK dependencies automatically
                String sql = "TRUNCATE TABLE reviews, payments, project_applications, projects, " +
                             "student_profiles, college_courses_offered, college_departments, " +
                             "company_college_partnerships, colleges, companies, notifications, users " +
                             "CASCADE";
                try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                    stmt.executeUpdate();
                    System.out.println("SUCCESS: All tables truncated with CASCADE.");
                }

                System.out.println("\nSUCCESS: All users and related data deleted from database.");
                System.out.println("The admin user will be recreated automatically on next backend restart.");
            }
        } catch (Exception e) {
            System.err.println("Database operation failed:");
            e.printStackTrace();
        }
    }
}
