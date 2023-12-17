package com.example.odap.service;

import com.example.odap.entity.User;

import javax.servlet.http.HttpServletRequest;

public interface UserService {

    User register(String userName, String password);

    User findUserByName(String userName);

    boolean isUserExist(String userName);

    Long getCurrentUserId(HttpServletRequest request);

    User getCurrentUser(HttpServletRequest request);
}

