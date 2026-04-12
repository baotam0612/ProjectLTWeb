package com.jewellery.ProjWEB.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Default static resource serving is already configured for /static/**
        // Admin UI is now accessible at /static/index.html or /static/
        // No custom mapping needed - Spring Boot handles classpath:/static/ automatically
    }
}
