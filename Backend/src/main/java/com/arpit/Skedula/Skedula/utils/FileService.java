package com.arpit.Skedula.Skedula.utils;

import com.arpit.Skedula.Skedula.entity.BusinessServiceOffered;
import com.arpit.Skedula.Skedula.entity.User;
import com.arpit.Skedula.Skedula.exceptions.ResourceNotFoundException;
import com.arpit.Skedula.Skedula.repository.UserRepository;
import com.uploadcare.api.Client;
import com.uploadcare.upload.FileUploader;
import com.uploadcare.upload.UploadFailureException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;

@Service
@RequiredArgsConstructor
public class FileService {

    private final UserRepository userRepository;
    private final Client client;

    public String uploadFile(MultipartFile multipartFile) {

        if(multipartFile.isEmpty()){
            throw new RuntimeException("File is empty");
        }
        File tempfile = null;
        try{
            String originalFilename = multipartFile.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));;
            String uniqueName = System.currentTimeMillis() + extension;


            tempfile = File.createTempFile(uniqueName, extension);
            multipartFile.transferTo(tempfile);

            FileUploader uploader = new FileUploader(client, tempfile);
            uploader.store(true);
            com.uploadcare.api.File uploadedFile = uploader.upload();

            return "https://ucarecdn.com/" + uploadedFile.getFileId() + "/";

        } catch (IOException e) {
            throw new RuntimeException("File upload failed due to an I/O error", e);
        } catch (UploadFailureException e) {
            throw new RuntimeException("File upload failed due to Uploadcare error", e);
        } finally {
            if (tempfile != null && tempfile.exists()) {
                tempfile.delete();
            }
        }

    }

    public Void setUserImage(MultipartFile multipartFile, Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        String fileUrl = uploadFile(multipartFile);
        user.setImageUrl(fileUrl);
        userRepository.save(user);
        System.out.println("file set: -------------------------------------------------------------");

        return null;
    }


}
