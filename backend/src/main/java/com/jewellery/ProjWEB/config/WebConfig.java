package com.jewellery.ProjWEB.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Files;
import java.nio.file.Path;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations(homeUiLocation(), "classpath:/static/");
    }

    private String homeUiLocation() {
        Path workingDirectory = Path.of("").toAbsolutePath();
        Path homeUi = workingDirectory.resolve("frontend/home");
        if (!Files.isDirectory(homeUi)) {
            homeUi = workingDirectory.resolve("../frontend/home");
        }
        return homeUi.normalize().toUri().toString();
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addRedirectViewController("/", "/trangchu.html");
    }
}
