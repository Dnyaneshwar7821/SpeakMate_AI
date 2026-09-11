package com.rslsolution.speakmateai.service;

import java.util.List;

import com.rslsolution.speakmateai.dto.request.ClassRoomRequest;
import com.rslsolution.speakmateai.dto.request.ClassStudentRequest;
import com.rslsolution.speakmateai.dto.response.ClassRoomResponse;

public interface ClassRoomService {
	ClassRoomResponse createClassRoom(ClassRoomRequest request);
	List<ClassRoomResponse> getAllClassRooms(Long schoolId);
	ClassRoomResponse updateClassRoom(Long id, ClassRoomRequest request);
	void deleteClassRoom(Long id);
	
	// Students within a class
	List<Long> getStudentsInClass(Long classId);
	void addStudentsToClass(Long classId, ClassStudentRequest request);
}
