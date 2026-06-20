package com.odyssey.repository;

import com.odyssey.entity.OAuthAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OAuthAccountRepository extends JpaRepository<OAuthAccount, Long> {
    Optional<OAuthAccount> findByProviderAndProviderUserId(String provider, String providerUserId);
    Optional<OAuthAccount> findByEmail(String email);
    boolean existsByUserAndProvider(com.odyssey.entity.User user, String provider);
}
