package com.colledge.backend.dto;

import java.math.BigDecimal;
import java.util.UUID;

public class OrderItemRequest {
    private String name;
    private Integer quantity;
    private BigDecimal price;
    private UUID menuItemId;

    public OrderItemRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public UUID getMenuItemId() { return menuItemId; }
    public void setMenuItemId(UUID menuItemId) { this.menuItemId = menuItemId; }
}
