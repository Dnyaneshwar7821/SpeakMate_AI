package com.rslsolution.speakmateai.service;

import com.rslsolution.speakmateai.dto.request.SchoolAdminSendInvitationRequest;
import com.rslsolution.speakmateai.dto.request.SchoolRequest;
import com.rslsolution.speakmateai.dto.response.SchoolAdminSendInvitationResponse;
import com.rslsolution.speakmateai.dto.response.SchoolResponse;

import com.rslsolution.speakmateai.dto.request.SchoolPaymentOrderRequest;
import com.rslsolution.speakmateai.dto.response.CreateOrderResponse;

import java.util.List;

public interface SchoolService {
    SchoolAdminSendInvitationResponse sendInvitation(SchoolAdminSendInvitationRequest request);
    CreateOrderResponse createSchoolPaymentOrder(SchoolPaymentOrderRequest request);
    SchoolResponse createSchool(SchoolRequest request);
    List<SchoolResponse> getAllSchools();
    SchoolResponse getSchoolById(Long id);
    SchoolResponse updateSchool(Long id, SchoolRequest request);
    SchoolResponse activateSchool(Long id);
    SchoolResponse deactivateSchool(Long id);
    void deleteSchool(Long id);
}
