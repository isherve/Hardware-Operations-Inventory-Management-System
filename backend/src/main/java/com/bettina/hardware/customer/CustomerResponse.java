package com.bettina.hardware.customer;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CustomerResponse {
    private Long customerId;
    private String customerName;
    private String phoneNumber;
    private String email;
    private String address;
    private int loyaltyPoints;
}
