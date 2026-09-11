package com.rslsolution.speakmateai.service;

import com.rslsolution.speakmateai.dto.request.StudentRequest;
import com.rslsolution.speakmateai.dto.response.StudentImportResponse;
import com.rslsolution.speakmateai.dto.response.StudentResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface StudentService {

    List<StudentResponse> getAllStudents();

    StudentResponse getStudentById(Long id);

    StudentResponse createStudent(StudentRequest request);

    StudentResponse updateStudent(Long id, StudentRequest request);

    void deleteStudent(Long id);

    StudentImportResponse importStudents(MultipartFile file);

    byte[] exportStudents(String format);

    void resetPassword(Long id, String newPassword);
}
