
package com.colledge.backend.repository;

import com.colledge.backend.entity.UserCredential;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface UserCredentialRepository
        extends JpaRepository<UserCredential, UUID> {
}
