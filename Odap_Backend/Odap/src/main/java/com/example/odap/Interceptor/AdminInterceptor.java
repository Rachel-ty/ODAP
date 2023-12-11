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
        System.out.println("1");
        HttpSession session = request.getSession(false);

        if(session != null) {
            System.out.println(session);
            User user = (User) session.getAttribute("user");
            System.out.println(user.getUserName());
            if (user != null && "admin".equals(user.getUserName())) { // 假设用户角色存储在role属性中
                System.out.println("3");
                return true; // 用户是管理员，允许访问
            } else {
                System.out.println("2");
                response.sendError(HttpServletResponse.SC_FORBIDDEN, "Only admin users are allowed to access");
                return false; // 用户不是管理员，阻止访问
            }
        }
        else{
            System.out.println("4");
            return false;
        }
    }
}
