package com.DocuFlow.DocuFlow.Configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class consConfi {
        @Bean
        public WebMvcConfigurer corsConfigurer() {
            return new WebMvcConfigurer() {
                @Override
                public void addCorsMappings(CorsRegistry registry) {
                    registry.addMapping("/**") // Allow all endpoints
                            .allowedOrigins("https://docuflow-pdf-operation-app.onrender.com") // your frontend origin
                            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                            .allowCredentials(true);
                }
            };
        }
    }













