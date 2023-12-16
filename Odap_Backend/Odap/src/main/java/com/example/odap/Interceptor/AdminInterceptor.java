package com.example.odap.Interceptor;

import com.example.odap.entity.User;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

@Component
public class AdminInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        HttpSession session = request.getSession(false);

        if(session != null) {
            System.out.println(session);
            User user = (User) session.getAttribute("user");
            System.out.println(user.getUserName());
            if (user != null && "admin".equals(user.getUserName())) {
                return true;
            } else {
                response.sendError(HttpServletResponse.SC_FORBIDDEN, "Only admin users are allowed to access");
                return false;
            }
        }
        else{
            return false;
        }
    }
}
