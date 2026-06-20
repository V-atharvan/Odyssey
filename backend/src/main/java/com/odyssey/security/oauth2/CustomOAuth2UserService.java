package com.odyssey.security.oauth2;

import com.odyssey.entity.AccountStatus;
import com.odyssey.entity.OAuthAccount;
import com.odyssey.entity.User;
import com.odyssey.repository.OAuthAccountRepository;
import com.odyssey.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final OAuthAccountRepository oAuthAccountRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest oAuth2UserRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(oAuth2UserRequest);
        try {
            return processOAuth2User(oAuth2UserRequest, oAuth2User);
        } catch (Exception ex) {
            log.error("Error processing OAuth2 user", ex);
            throw new OAuth2AuthenticationException(ex.getMessage());
        }
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest oAuth2UserRequest, OAuth2User oAuth2User) {
        String provider = oAuth2UserRequest.getClientRegistration().getRegistrationId();
        Map<String, Object> attributes = oAuth2User.getAttributes();
        
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String providerId = oAuth2User.getName(); // For GitHub it's numeric ID, for Google it's sub

        if (email == null) {
            throw new RuntimeException("Email not found from OAuth2 provider");
        }

        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
            updateExistingUser(user, provider, providerId);
        } else {
            user = registerNewUser(email, name, provider, providerId);
        }

        return CustomOAuth2User.create(user, attributes);
    }

    private User registerNewUser(String email, String name, String provider, String providerId) {
        User user = User.builder()
                .email(email)
                .fullName(name != null ? name : email.split("@")[0])
                .password("") // Social accounts don't have local password initially
                .status(AccountStatus.ACTIVE) // OAuth verified email
                .role(User.Role.STUDENT) // Default role, user can change in Step 2
                .build();
        
        user = userRepository.save(user);

        OAuthAccount oAuthAccount = OAuthAccount.builder()
                .user(user)
                .provider(provider)
                .providerUserId(providerId)
                .build();
        oAuthAccountRepository.save(oAuthAccount);

        log.info("Registered new OAuth2 user: {} via {}", email, provider);
        return user;
    }

    private void updateExistingUser(User user, String provider, String providerId) {
        if (!oAuthAccountRepository.existsByUserAndProvider(user, provider)) {
            OAuthAccount oAuthAccount = OAuthAccount.builder()
                    .user(user)
                    .provider(provider)
                    .providerUserId(providerId)
                    .build();
            oAuthAccountRepository.save(oAuthAccount);
            log.info("Linked existing user {} to new OAuth2 provider: {}", user.getEmail(), provider);
        }
    }
}
