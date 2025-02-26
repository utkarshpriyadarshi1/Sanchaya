package com.updevlogics.service;

import com.updevlogics.model.Role;
import com.updevlogics.model.User;
import com.updevlogics.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    public void saveUser(User user) {
        user.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));
        userRepository.save(user);
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<Role> getAllRoles() {
        return userRepository.findAllRoles();
    }

    public void createUser(String username, String password, Long roleId) {
        Role role = userRepository.findRoleById(roleId);
        User user = new User();
        user.setUsername(username);
        user.setPassword(bCryptPasswordEncoder.encode(password));
        user.setRoles(Set.of(role));
        userRepository.save(user);
    }

    public void createRole(String roleName) {
        Role role = new Role();
        role.setName(roleName);
        userRepository.saveRole(role);
    }
}