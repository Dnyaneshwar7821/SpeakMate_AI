package com.rslsolution.speakmateai.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.rslsolution.speakmateai.dto.request.ClassRoomRequest;
import com.rslsolution.speakmateai.dto.request.ClassStudentRequest;
import com.rslsolution.speakmateai.dto.response.ClassRoomResponse;
import com.rslsolution.speakmateai.service.ClassRoomService;

@RestController
@RequestMapping("/api/school/classes")
public class ClassController {

	private final ClassRoomService classRoomService;

	public ClassController(ClassRoomService classRoomService) {
		this.classRoomService = classRoomService;
	}

	@GetMapping
	public ResponseEntity<List<ClassRoomResponse>> getAllClassRooms(@RequestParam(required = false) Long schoolId) {
		return ResponseEntity.ok(classRoomService.getAllClassRooms(schoolId));
	}

	@PostMapping
	public ResponseEntity<ClassRoomResponse> createClassRoom(@RequestBody ClassRoomRequest request) {
		return ResponseEntity.ok(classRoomService.createClassRoom(request));
	}

	@PutMapping("/{id}")
	public ResponseEntity<ClassRoomResponse> updateClassRoom(@PathVariable Long id, @RequestBody ClassRoomRequest request) {
		return ResponseEntity.ok(classRoomService.updateClassRoom(id, request));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteClassRoom(@PathVariable Long id) {
		classRoomService.deleteClassRoom(id);
		return ResponseEntity.ok().build();
	}

	@GetMapping("/{id}/students")
	public ResponseEntity<List<Long>> getStudentsInClass(@PathVariable Long id) {
		return ResponseEntity.ok(classRoomService.getStudentsInClass(id));
	}

	@PostMapping("/{id}/students")
	public ResponseEntity<Void> addStudentsToClass(@PathVariable Long id, @RequestBody ClassStudentRequest request) {
		classRoomService.addStudentsToClass(id, request);
		return ResponseEntity.ok().build();
	}
}
