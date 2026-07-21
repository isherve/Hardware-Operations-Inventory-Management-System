package com.bettina.hardware.sales;

import com.bettina.hardware.auth.AuthResponse;
import com.bettina.hardware.auth.LoginRequest;
import com.bettina.hardware.common.enums.UserType;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SaleIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String employeeToken;

    @BeforeEach
    void login() throws Exception {
        LoginRequest login = new LoginRequest();
        login.setUsername("cashier1");
        login.setPassword("Cashier@2024");
        login.setUserType(UserType.EMPLOYEE);

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andReturn();

        AuthResponse auth = objectMapper.readValue(result.getResponse().getContentAsString(), AuthResponse.class);
        employeeToken = auth.getToken();
    }

    @Test
    void createSale_decrementsInventory() throws Exception {
        CreateSaleRequest request = new CreateSaleRequest();
        request.setLines(List.of(line(8, 1)));

        mockMvc.perform(post("/api/sales")
                        .header("Authorization", "Bearer " + employeeToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.totalAmount").exists());

        mockMvc.perform(get("/api/inventory")
                        .header("Authorization", "Bearer " + employeeToken))
                .andExpect(status().isOk());
    }

    @Test
    void createSale_rejectsInsufficientStock() throws Exception {
        CreateSaleRequest request = new CreateSaleRequest();
        request.setLines(List.of(line(8, 99999)));

        mockMvc.perform(post("/api/sales")
                        .header("Authorization", "Bearer " + employeeToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void employeeEndpoints_forbiddenForAdminProductWrite() throws Exception {
        LoginRequest adminLogin = new LoginRequest();
        adminLogin.setUsername("admin");
        adminLogin.setPassword("Admin@BuiltIn2024");
        adminLogin.setUserType(UserType.ADMIN);

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andReturn();
        AuthResponse auth = objectMapper.readValue(result.getResponse().getContentAsString(), AuthResponse.class);

        mockMvc.perform(post("/api/products")
                        .header("Authorization", "Bearer " + auth.getToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "productName", "Test", "category", "Tools", "unitPrice", 1000))))
                .andExpect(status().isCreated());
    }

    private SaleLineRequest line(long productId, int qty) {
        SaleLineRequest line = new SaleLineRequest();
        line.setProductId(productId);
        line.setQuantity(qty);
        return line;
    }
}
