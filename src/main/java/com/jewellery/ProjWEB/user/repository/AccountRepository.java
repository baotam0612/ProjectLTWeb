package com.jewellery.ProjWEB.user.repository;

import com.jewellery.ProjWEB.entity.AccountEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AccountRepository extends JpaRepository<AccountEntity, Integer> {
    Optional<AccountEntity> findByUserId(Long userId);
    Optional<AccountEntity> findByUsername(String username);
}
