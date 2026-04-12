package com.jewellery.ProjWEB.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller 
public class SpaForwardController {
    // Temporarily disabled - WebConfig now serves static files from classpath:/static/
    // SPA forwarding will be re-enabled after verifying static resources work
    
    // @GetMapping("/admin/**")
    // public String forwardAdmin(HttpServletRequest request) {
    //     String uri = request.getRequestURI();
    //     if (uri.contains(".") || uri.endsWith("/index.html")) {
    //         return "forward:" + uri;
    //     }
    //     return "forward:/admin/index.html";
    // }
}

