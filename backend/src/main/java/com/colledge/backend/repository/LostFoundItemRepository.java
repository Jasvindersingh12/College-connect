package com.colledge.backend.repository;

import com.colledge.backend.entity.LostFoundItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LostFoundItemRepository extends JpaRepository<LostFoundItem, UUID> {
    List<LostFoundItem> findAllByOrderByCreatedAtDesc();
}
