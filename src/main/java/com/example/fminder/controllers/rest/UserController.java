package com.example.fminder.controllers.rest;

import com.example.fminder.models.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@RestController
public class UserController extends BaseController {

    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable int id) {
        return new ResponseEntity<>(userService.getUserById(id), HttpStatus.OK);
    }

    @GetMapping("/users/profile")
    public ResponseEntity<User> showUserProfile(HttpServletRequest request) {
        return getUserById(authenticationHelper.getLoggedUserId(request));
    }

    @PutMapping("/users/profile")
    public ResponseEntity<User> updateUserProfile(@RequestBody User user, HttpServletRequest request) {
        int userId = authenticationHelper.getLoggedUserId(request);
        return new ResponseEntity<>(userService.updateUser(userId, user), HttpStatus.OK);
    }

    @PutMapping("/users/profile/changePassword")
    public ResponseEntity<User> changePassword(@Valid @RequestBody User user, HttpServletRequest request) {
        int userId = authenticationHelper.getLoggedUserId(request);
        return new ResponseEntity<>(userService.changePassword(userId, user), HttpStatus.OK);
    }

    @PostMapping("/users/profile/upload-picture")
    public CompletableFuture<ResponseEntity<String>> uploadProfileImage(@RequestParam(value = "file") MultipartFile file, HttpServletRequest request) {
        int userId = authenticationHelper.getLoggedUserId(request);
        return userService.uploadProfilePicture(file, userId)
                .thenApply(fileName -> new ResponseEntity<>("Uploaded picture: " + fileName, HttpStatus.OK));
    }


    @GetMapping("/matches")
    public ResponseEntity<List<User>> getPotentialMatches(HttpServletRequest request) {
        int userId = authenticationHelper.getLoggedUserId(request);
        return new ResponseEntity<>(userService.getPotentialMatches(userId), HttpStatus.OK);
    }

    @GetMapping("/matched")
    public ResponseEntity<List<User>> getMatches(HttpServletRequest request) {
        int userId = authenticationHelper.getLoggedUserId(request);
        return new ResponseEntity<>(userService.getMatches(userId), HttpStatus.OK);
    }
}
