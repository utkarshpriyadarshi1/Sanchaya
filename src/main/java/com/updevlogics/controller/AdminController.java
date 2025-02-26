package com.updevlogics.controller;

import com.updevlogics.model.FileInfo;
import com.updevlogics.model.Role;
import com.updevlogics.model.User;
import com.updevlogics.service.FileService;
import com.updevlogics.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Controller
public class AdminController {
    @Autowired
    private UserService userService;

    @Autowired
    private FileService fileService;

    @GetMapping("/admin/dashboard")
    public String adminDashboard(Model model) {
        List<FileInfo> files = fileService.getLast10Files();
        List<User> users = userService.getAllUsers();
        List<Role> roles = userService.getAllRoles();
        model.addAttribute("files", files);
        model.addAttribute("users", users);
        model.addAttribute("roles", roles);
        return "adminDashboard";
    }

    @GetMapping("/admin/createCategory")
    public String createCategoryPage() {
        return "createCategory";
    }

    @GetMapping("/admin/modifyCategory")
    public String modifyCategoryPage() {
        return "modifyCategory";
    }

    @GetMapping("/admin/createUser")
    public String createUserPage(Model model) {
        List<Role> roles = userService.getAllRoles();
        model.addAttribute("roles", roles);
        return "createUser";
    }
}