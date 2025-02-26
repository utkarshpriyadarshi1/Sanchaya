package com.updevlogics.controller;

import com.updevlogics.model.User;
import com.updevlogics.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping("/admin/createUser")
    public String createUser(@RequestParam("username") String username,
                             @RequestParam("password") String password,
                             @RequestParam("role") Long roleId,
                             Model model) {
        userService.createUser(username, password, roleId);
        model.addAttribute("message", "User created successfully!");
        return "createUser";
    }

    @PostMapping("/admin/createRole")
    public String createRole(@RequestParam("roleName") String roleName,
                             Model model) {
        userService.createRole(roleName);
        model.addAttribute("message", "Role created successfully!");
        return "adminDashboard";
    }
}