package com.rslsolution.speakmateai.service;

import com.rslsolution.speakmateai.dto.request.SchoolAdminSendOtpRequest;
import com.rslsolution.speakmateai.dto.request.SchoolAdminVerifyOtpRequest;
import com.rslsolution.speakmateai.dto.response.SchoolAdminSendOtpResponse;
import com.rslsolution.speakmateai.dto.response.SchoolAdminVerifyOtpResponse;

public interface SchoolAdminVerificationService {

    SchoolAdminSendOtpResponse sendOtp(SchoolAdminSendOtpRequest request);

    SchoolAdminVerifyOtpResponse verifyOtp(SchoolAdminVerifyOtpRequest request);
}
