package com.colledge.backend.controller;

import com.colledge.backend.entity.LostFoundItem;
import com.colledge.backend.repository.LostFoundItemRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/hub")
@CrossOrigin(origins = "*")
public class CampusHubController {

    private final LostFoundItemRepository repository;

    public CampusHubController(LostFoundItemRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/lost-found")
    public List<LostFoundItem> getLostFoundItems() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping("/lost-found")
    public ResponseEntity<LostFoundItem> createLostFoundItem(@RequestBody LostFoundItem item) {
        LostFoundItem saved = repository.save(item);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PatchMapping("/lost-found/{id}/resolve")
    public ResponseEntity<LostFoundItem> resolveItem(@PathVariable UUID id) {
        return repository.findById(id)
                .map(item -> {
                    item.setResolved(true);
                    return ResponseEntity.ok(repository.save(item));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
