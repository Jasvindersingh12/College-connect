
package com.colledge.backend.controller;

import com.colledge.backend.entity.MenuItem;
import com.colledge.backend.service.MenuItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/canteen/menu")
public class MenuItemController {

    private final MenuItemService menuItemService;

    public MenuItemController(MenuItemService menuItemService) {
        this.menuItemService = menuItemService;
    }

    // Get all menu items
    @GetMapping
    public List<MenuItem> getAllMenuItems() {
        return menuItemService.getAllMenuItems();
    }

    // Get available menu items
    @GetMapping("/available")
    public List<MenuItem> getAvailableMenuItems() {
        return menuItemService.getAvailableMenuItems();
    }

    // Add a menu item
    @PostMapping
    public MenuItem addMenuItem(@RequestBody MenuItem menuItem) {
        return menuItemService.saveMenuItem(menuItem);
    }

    // Update a menu item
    @PutMapping("/{id}")
    public ResponseEntity<MenuItem> updateMenuItem(
            @PathVariable UUID id,
            @RequestBody MenuItem menuItem) {

        return menuItemService.getMenuItemById(id)
                .map(existing -> {
                    existing.setName(menuItem.getName());
                    existing.setDescription(menuItem.getDescription());
                    existing.setPrice(menuItem.getPrice());
                    existing.setCategoryId(menuItem.getCategoryId());
                    existing.setImageUrl(menuItem.getImageUrl());
                    existing.setIsAvailable(menuItem.getIsAvailable());

                    return ResponseEntity.ok(
                            menuItemService.saveMenuItem(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete a menu item
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable UUID id) {
        if (menuItemService.getMenuItemById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        menuItemService.deleteMenuItem(id);
        return ResponseEntity.noContent().build();
    }
}
