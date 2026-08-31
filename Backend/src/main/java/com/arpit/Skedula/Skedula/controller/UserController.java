package com.arpit.Skedula.Skedula.controller;

import com.arpit.Skedula.Skedula.dto.UserDTO;
import com.arpit.Skedula.Skedula.services.UserService;
import com.arpit.Skedula.Skedula.utils.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping(path = "/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final FileService fileService;

    /**
     * Returns the currently authenticated user's profile.
     * No path parameter — derived from JWT, inherently safe.
     */
    @GetMapping("/getCurrentUser")
    public ResponseEntity<UserDTO> getCurrentUser() {
        return ResponseEntity.ok(userService.getCurrentUser());
    }

    /**
     * Update a user's profile image.
     * Only the user themselves can update their own image.
     */
    @PreAuthorize("@businessService.isCurrentUser(#id)")
    @PutMapping("/update/image/{id}")
    public ResponseEntity<Void> setUserImage(@PathVariable Long id, @RequestParam("file") MultipartFile image) {
        return ResponseEntity.ok(fileService.setUserImage(image, id));
    }

}
