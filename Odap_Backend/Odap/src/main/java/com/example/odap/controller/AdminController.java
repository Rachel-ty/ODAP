package com.example.odap.controller;

import com.example.odap.entity.PictureData;
import com.example.odap.entity.User;
import com.example.odap.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;



@RestController
@CrossOrigin
@RequestMapping("/api")
public class AdminController {
    @Autowired
    private UserRepository userRepository;

    @CrossOrigin
    @GetMapping("/user_by_pages")
    public ResponseEntity<Map<String, Object>> getUsersByPage(
            @RequestParam("page_num") int pageNum,
            @RequestParam("page_size") int pageSize
    ) {
        PageRequest pageRequest = PageRequest.of(pageNum - 1, pageSize);
        // page request
        Page<User> userDataPage;
        userDataPage = userRepository.findAll(pageRequest);
        // response data
        List<User> userData = userDataPage.getContent();
        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("error_msg", "success");
        response.put("data", userData);
        return ResponseEntity.ok(response);
    }




    @RequestMapping("/del_user")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> delUser(HttpServletRequest request,
            @RequestParam("user_name") String userName
    ){
        HttpSession session = request.getSession();
        User user = (User) session.getAttribute("user");
            User delUser = userRepository.findByUserName(userName);
            userRepository.delete(delUser);
            Map<String, Object> response = new HashMap<>();
            response.put("code", 200);
            response.put("error_msg", "success");
            return ResponseEntity.ok(response);

    }
}
