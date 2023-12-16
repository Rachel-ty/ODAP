package com.example.odap.service.impl;

import com.example.odap.entity.User;
import com.example.odap.exception.UserRegistrationException;
import com.example.odap.repository.UserRepository;
import com.example.odap.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
@Service
public class UserServiceImpl implements UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;
    @Override
    public User register(String userName, String password) {
        if (userRepository.existsByUserName(userName)){
            throw new UserRegistrationException("user name exists!");
        }
        String encodedPassword = passwordEncoder.encode(password);
        User user = new User(userName, encodedPassword);

        return userRepository.save(user);
    }

    @Override
    public User findUserByName(String userName) {
        return userRepository.findByUserName(userName);
    }

    @Override
    public boolean isUserExist(String userName) {
        return userRepository.existsByUserName(userName);
    }

    @Override
    public Long getCurrentUserId(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("user") == null) {
            return null;
        }
        User user = (User) session.getAttribute("user");
        return user.getId();
    }
    @Override
    public User getCurrentUser(HttpServletRequest request){
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("user")==null){
            return null;
        }
        User user= (User) session.getAttribute("user") ;
        return user;
    }
}
