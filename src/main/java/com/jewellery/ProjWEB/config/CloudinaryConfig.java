package com.jewellery.ProjWEB.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {
    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", "dl5ozzjg7",
                "api_key", "685893197267192",
                "api_secret", "fOb96vC1WPTJNge0cENsaFo7qZE",
                "secure", true
        ));
    }
}
