package com.bettina.hardware.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "bettina.loyalty")
@Getter
@Setter
public class LoyaltyProperties {
    private int pointsPer1000Rwf = 1;
}
