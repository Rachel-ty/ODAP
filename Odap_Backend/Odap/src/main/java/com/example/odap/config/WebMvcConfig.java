package com.example.odap.config;

import com.example.odap.Interceptor.AdminInterceptor;
import com.example.odap.Interceptor.AuthenticationInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    @Autowired
    private AuthenticationInterceptor authenticationInterceptor;

    @Autowired
    private AdminInterceptor adminInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(adminInterceptor)
                .addPathPatterns("/api/user_by_pages", "/api/del_user"); // url that needs admin permission
        registry.addInterceptor(authenticationInterceptor)
                .addPathPatterns("/api/dataset/**"); // url that needs authentication

    }
}
