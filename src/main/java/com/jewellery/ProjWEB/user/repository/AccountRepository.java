package com.jewellery.ProjWEB.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.jewellery.ProjWEB.entity.AccountEntity;
import com.jewellery.ProjWEB.user.entity.User;

import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<AccountEntity, Integer> {

    /**
     * Find an account entity associated with the given domain `User`.
     */
    Optional<AccountEntity> findByUser(User user);
}
