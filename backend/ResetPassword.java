import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class ResetPassword {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5433/odyssey_db";
        String user = "postgres";
        String password = "postgres";
        String email = "v.atharvan@gmail.com";
        String plainPassword = "aaaaaaaa";

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
        String encodedPassword = encoder.encode(plainPassword);

        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            System.out.println("Updating password for user '" + email + "'...");
            String update = "UPDATE users SET password = ?, status = 'ACTIVE' WHERE email = ?";
            try (PreparedStatement pstmt = conn.prepareStatement(update)) {
                pstmt.setString(1, encodedPassword);
                pstmt.setString(2, email);
                int rows = pstmt.executeUpdate();
                if (rows > 0) {
                    System.out.println("PASSWORD RESET SUCCESSFUL!");
                } else {
                    System.out.println("USER NOT FOUND - FAILED TO RESET PASSWORD");
                }
            }
        } catch (Exception e) {
            System.err.println("DB Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
