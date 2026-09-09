#!/usr/bin/env python3
"""
SpeakMate Backend API Test Suite
Tests all 24 test scenarios as requested
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:9091"

class TestRunner:
    def __init__(self):
        self.session = requests.Session()
        self.tokens = {}
        self.test_results = []
        self.base_url = BASE_URL
        
    def log_test(self, test_name, endpoint, method, expected_status, actual_status, passed, notes=""):
        """Log test results"""
        result = {
            "test_name": test_name,
            "endpoint": endpoint,
            "method": method,
            "expected": expected_status,
            "actual": actual_status,
            "result": "PASS" if passed else "FAIL",
            "notes": notes
        }
        self.test_results.append(result)
        
        status_symbol = "✓" if passed else "✗"
        print(f"{status_symbol} [{test_name}] {method} {endpoint} -> {actual_status} (expected {expected_status})")
        if notes:
            print(f"  └─ {notes}")
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*80)
        print("TEST SUMMARY")
        print("="*80)
        
        passed = sum(1 for r in self.test_results if r["result"] == "PASS")
        failed = sum(1 for r in self.test_results if r["result"] == "FAIL")
        total = len(self.test_results)
        
        print(f"\nTotal Tests: {total}")
        print(f"Passed: {passed} ({100*passed/total:.1f}%)")
        print(f"Failed: {failed} ({100*failed/total:.1f}%)")
        
        if failed > 0:
            print("\nFailed Tests:")
            for result in self.test_results:
                if result["result"] == "FAIL":
                    print(f"  - {result['test_name']}: {result['notes']}")
    
    def test_01_create_test_user(self):
        """Test 1: Create Test User Account with Master OTP"""
        try:
            email = f"testuser.{datetime.now().timestamp()}@speakmate.ai"
            response = requests.post(
                f"{self.base_url}/api/users/register",
                json={
                    "firstName": "Test",
                    "lastName": "User",
                    "email": email,
                    "password": "TestPass@123",
                    "confirmPassword": "TestPass@123",
                    "otp": "123456"  # Master OTP for testing
                },
                headers={"Content-Type": "application/json"}
            )
            
            passed = response.status_code in [200, 201]
            notes = ""
            
            if passed:
                self.tokens["testUserEmail"] = email
                self.tokens["testUserPassword"] = "TestPass@123"
                notes = f"User created: {email}"
            else:
                notes = f"Status {response.status_code}: {response.text[:150]}"
            
            self.log_test("01_Create_Test_User", "/api/users/register", "POST", 201, response.status_code, passed, notes)
            return passed
        
        except Exception as e:
            self.log_test("01_Create_Test_User", "/api/users/register", "POST", 201, "ERROR", False, str(e))
            return False
    
    def test_01b_test_user_login(self):
        """Test 1b: Test User Login"""
        if "testUserEmail" not in self.tokens:
            return False
            
        try:
            response = requests.post(
                f"{self.base_url}/api/users/login",
                json={
                    "email": self.tokens["testUserEmail"],
                    "password": self.tokens["testUserPassword"]
                },
                headers={"Content-Type": "application/json"}
            )
            
            passed = response.status_code == 200
            notes = ""
            
            if passed:
                data = response.json()
                if "token" in data:
                    self.tokens["userToken"] = data["token"]
                    notes = "Token captured successfully"
                elif "data" in data and "token" in data["data"]:
                    self.tokens["userToken"] = data["data"]["token"]
                    notes = "Token captured successfully from data"
                else:
                    passed = False
                    notes = f"Token not found in response: {list(data.keys())}"
            else:
                notes = f"Status {response.status_code}: {response.text[:100]}"
            
            self.log_test("01b_User_Login", "/api/users/login", "POST", 200, response.status_code, passed, notes)
            return passed
        
        except Exception as e:
            self.log_test("01b_User_Login", "/api/users/login", "POST", 200, "ERROR", False, str(e))
            return False
    
    def test_01c_super_admin_login(self):
        """Test 1c: Super Admin Login"""
        try:
            response = requests.post(
                f"{self.base_url}/api/v1/auth/admin/login",
                json={"email": "admin@speakmate.ai", "password": "Admin@123"},
                headers={"Content-Type": "application/json"}
            )
            
            passed = response.status_code == 200
            notes = ""
            
            if passed:
                data = response.json()
                if "data" in data and "jwtToken" in data["data"]:
                    self.tokens["superAdmin"] = data["data"]["jwtToken"]
                    notes = "Token captured successfully"
                else:
                    passed = False
                    notes = f"Token not found in response: {list(data.keys())}"
            else:
                notes = f"Status {response.status_code}: {response.text[:100]}"
            
            self.log_test("01c_Super_Admin_Login", "/api/v1/auth/admin/login", "POST", 200, response.status_code, passed, notes)
            return passed
        
        except Exception as e:
            self.log_test("01c_Super_Admin_Login", "/api/v1/auth/admin/login", "POST", 200, "ERROR", False, str(e))
            return False
    
    def test_02_create_result(self):
        """Test 2: Create Result"""
        # Use superAdmin token for school admin operations
        if "superAdmin" not in self.tokens:
            print("⚠ Skipping test 02: No Super Admin authentication token available")
            return False
        
        try:
            response = requests.post(
                f"{self.base_url}/api/v1/school/results",
                json={
                    "studentId": 1,
                    "testTitle": "Mathematics Mid-Term",
                    "marksObtained": 78.5,
                    "totalMarks": 100.0,
                    "active": True
                },
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.tokens['superAdmin']}"
                }
            )
            
            passed = response.status_code == 201
            notes = ""
            
            if passed:
                data = response.json()
                if "id" in data:
                    self.tokens["resultId"] = data["id"]
                    # Verify percentage calculation
                    expected_percentage = (78.5 / 100.0) * 100
                    actual_percentage = data.get("percentage", 0)
                    if abs(actual_percentage - expected_percentage) < 0.01:
                        notes = f"Result created (ID: {data['id']}, Percentage: {actual_percentage}%)"
                    else:
                        passed = False
                        notes = f"Percentage mismatch: expected {expected_percentage}%, got {actual_percentage}%"
                else:
                    passed = False
                    notes = "Result ID not found in response"
            else:
                notes = f"Status {response.status_code}: {response.text[:100]}"
            
            self.log_test("02_Create_Result", "/api/v1/school/results", "POST", 201, response.status_code, passed, notes)
            return passed
        
        except Exception as e:
            self.log_test("02_Create_Result", "/api/v1/school/results", "POST", 201, "ERROR", False, str(e))
            return False
    
    def test_03_get_all_results(self):
        """Test 3: Get All Results"""
        if "superAdmin" not in self.tokens:
            return False
        
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/school/results",
                headers={"Authorization": f"Bearer {self.tokens['superAdmin']}"}
            )
            
            passed = response.status_code == 200
            notes = ""
            
            if passed:
                data = response.json()
                result_count = len(data) if isinstance(data, list) else data.get("content", []) if isinstance(data, dict) else 0
                notes = f"Retrieved {result_count} results"
            else:
                notes = f"Status {response.status_code}"
            
            self.log_test("03_Get_All_Results", "/api/v1/school/results", "GET", 200, response.status_code, passed, notes)
            return passed
        
        except Exception as e:
            self.log_test("03_Get_All_Results", "/api/v1/school/results", "GET", 200, "ERROR", False, str(e))
            return False
    
    def test_04_search_results(self):
        """Test 4: Search Results"""
        if "superAdmin" not in self.tokens:
            return False
        
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/school/results/search",
                params={"q": "Mathematics"},
                headers={"Authorization": f"Bearer {self.tokens['superAdmin']}"}
            )
            
            passed = response.status_code == 200
            notes = f"Status {response.status_code}"
            
            self.log_test("04_Search_Results", "/api/v1/school/results/search", "GET", 200, response.status_code, passed, notes)
            return passed
        
        except Exception as e:
            self.log_test("04_Search_Results", "/api/v1/school/results/search", "GET", 200, "ERROR", False, str(e))
            return False
    
    def test_05_get_result_by_id(self):
        """Test 5: Get Result By ID"""
        if "superAdmin" not in self.tokens or "resultId" not in self.tokens:
            return False
        
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/school/results/{self.tokens['resultId']}",
                headers={"Authorization": f"Bearer {self.tokens['superAdmin']}"}
            )
            
            passed = response.status_code == 200
            notes = f"Status {response.status_code}"
            
            self.log_test("05_Get_Result_By_ID", f"/api/v1/school/results/{self.tokens['resultId']}", "GET", 200, response.status_code, passed, notes)
            return passed
        
        except Exception as e:
            self.log_test("05_Get_Result_By_ID", "/api/v1/school/results/{id}", "GET", 200, "ERROR", False, str(e))
            return False
    
    def test_06_get_results_by_student(self):
        """Test 6: Get Results By Student"""
        if "superAdmin" not in self.tokens:
            return False
        
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/school/results/student/1",
                headers={"Authorization": f"Bearer {self.tokens['superAdmin']}"}
            )
            
            passed = response.status_code == 200
            notes = f"Status {response.status_code}"
            
            self.log_test("06_Get_Results_By_Student", "/api/v1/school/results/student/1", "GET", 200, response.status_code, passed, notes)
            return passed
        
        except Exception as e:
            self.log_test("06_Get_Results_By_Student", "/api/v1/school/results/student/1", "GET", 200, "ERROR", False, str(e))
            return False
    
    def test_07_update_result(self):
        """Test 7: Update Result"""
        if "superAdmin" not in self.tokens or "resultId" not in self.tokens:
            return False
        
        try:
            response = requests.put(
                f"{self.base_url}/api/v1/school/results/{self.tokens['resultId']}",
                json={
                    "studentId": 1,
                    "testTitle": "Mathematics Mid-Term Updated",
                    "marksObtained": 85.0,
                    "totalMarks": 100.0,
                    "active": True
                },
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.tokens['superAdmin']}"
                }
            )
            
            passed = response.status_code == 200
            notes = f"Status {response.status_code}"
            
            self.log_test("07_Update_Result", f"/api/v1/school/results/{self.tokens['resultId']}", "PUT", 200, response.status_code, passed, notes)
            return passed
        
        except Exception as e:
            self.log_test("07_Update_Result", "/api/v1/school/results/{id}", "PUT", 200, "ERROR", False, str(e))
            return False
    
    def test_08_create_teacher(self):
        """Test 8: Create Teacher"""
        if "superAdmin" not in self.tokens:
            return False
        
        try:
            response = requests.post(
                f"{self.base_url}/api/v1/school/teachers",
                json={
                    "firstName": "John",
                    "lastName": "Doe",
                    "email": f"john.doe.{datetime.now().timestamp()}@school.com",
                    "password": "TeacherPass123!",
                    "phone": "+1234567890",
                    "active": True
                },
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.tokens['superAdmin']}"
                }
            )
            
            passed = response.status_code == 201
            notes = ""
            
            if passed:
                data = response.json()
                if "id" in data:
                    self.tokens["teacherId"] = data["id"]
                    notes = f"Teacher created (ID: {data['id']})"
                else:
                    passed = False
                    notes = "Teacher ID not found in response"
            else:
                notes = f"Status {response.status_code}: {response.text[:100]}"
            
            self.log_test("08_Create_Teacher", "/api/v1/school/teachers", "POST", 201, response.status_code, passed, notes)
            return passed
        
        except Exception as e:
            self.log_test("08_Create_Teacher", "/api/v1/school/teachers", "POST", 201, "ERROR", False, str(e))
            return False
    
    def test_09_get_all_teachers(self):
        """Test 9: Get All Teachers"""
        if "superAdmin" not in self.tokens:
            return False
        
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/school/teachers",
                headers={"Authorization": f"Bearer {self.tokens['superAdmin']}"}
            )
            
            passed = response.status_code == 200
            notes = f"Status {response.status_code}"
            
            self.log_test("09_Get_All_Teachers", "/api/v1/school/teachers", "GET", 200, response.status_code, passed, notes)
            return passed
        
        except Exception as e:
            self.log_test("09_Get_All_Teachers", "/api/v1/school/teachers", "GET", 200, "ERROR", False, str(e))
            return False
    
    def test_10_search_teachers(self):
        """Test 10: Search Teachers"""
        if "superAdmin" not in self.tokens:
            return False
        
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/school/teachers/search",
                params={"q": "John"},
                headers={"Authorization": f"Bearer {self.tokens['superAdmin']}"}
            )
            
            passed = response.status_code == 200
            notes = f"Status {response.status_code}"
            
            self.log_test("10_Search_Teachers", "/api/v1/school/teachers/search", "GET", 200, response.status_code, passed, notes)
            return passed
        
        except Exception as e:
            self.log_test("10_Search_Teachers", "/api/v1/school/teachers/search", "GET", 200, "ERROR", False, str(e))
            return False
    
    def test_11_get_teacher_by_id(self):
        """Test 11: Get Teacher By ID"""
        if "superAdmin" not in self.tokens or "teacherId" not in self.tokens:
            return False
        
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/school/teachers/{self.tokens['teacherId']}",
                headers={"Authorization": f"Bearer {self.tokens['superAdmin']}"}
            )
            
            passed = response.status_code == 200
            notes = f"Status {response.status_code}"
            
            self.log_test("11_Get_Teacher_By_ID", f"/api/v1/school/teachers/{self.tokens['teacherId']}", "GET", 200, response.status_code, passed, notes)
            return passed
        
        except Exception as e:
            self.log_test("11_Get_Teacher_By_ID", "/api/v1/school/teachers/{id}", "GET", 200, "ERROR", False, str(e))
            return False
    
    def test_12_update_teacher(self):
        """Test 12: Update Teacher"""
        if "superAdmin" not in self.tokens or "teacherId" not in self.tokens:
            return False
        
        try:
            response = requests.put(
                f"{self.base_url}/api/v1/school/teachers/{self.tokens['teacherId']}",
                json={
                    "firstName": "Jane",
                    "lastName": "Smith",
                    "email": f"jane.smith.{datetime.now().timestamp()}@school.com",
                    "password": "NewTeacherPass123!",
                    "phone": "+0987654321",
                    "active": True
                },
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.tokens['superAdmin']}"
                }
            )
            
            passed = response.status_code == 200
            notes = f"Status {response.status_code}"
            
            self.log_test("12_Update_Teacher", f"/api/v1/school/teachers/{self.tokens['teacherId']}", "PUT", 200, response.status_code, passed, notes)
            return passed
        
        except Exception as e:
            self.log_test("12_Update_Teacher", "/api/v1/school/teachers/{id}", "PUT", 200, "ERROR", False, str(e))
            return False
    
    def test_13_global_search(self):
        """Test 13: Global Search"""
        if "superAdmin" not in self.tokens:
            return False
        
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/search",
                params={"q": "test"},
                headers={"Authorization": f"Bearer {self.tokens['superAdmin']}"}
            )
            
            passed = response.status_code == 200
            notes = f"Status {response.status_code}"
            
            self.log_test("13_Global_Search", "/api/v1/search", "GET", 200, response.status_code, passed, notes)
            return passed
        
        except Exception as e:
            self.log_test("13_Global_Search", "/api/v1/search", "GET", 200, "ERROR", False, str(e))
            return False
    
    def test_14_school_dashboard(self):
        """Test 14: School Dashboard"""
        if "superAdmin" not in self.tokens:
            return False
        
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/school/dashboard",
                headers={"Authorization": f"Bearer {self.tokens['superAdmin']}"}
            )
            
            passed = response.status_code == 200
            notes = ""
            
            if passed:
                data = response.json()
                required_fields = ["totalStudents", "activeStudents", "totalTeachers", "totalResults"]
                missing_fields = [f for f in required_fields if f not in data]
                if missing_fields:
                    passed = False
                    notes = f"Missing fields: {missing_fields}"
                else:
                    notes = f"Dashboard data retrieved successfully"
            else:
                notes = f"Status {response.status_code}"
            
            self.log_test("14_School_Dashboard", "/api/v1/school/dashboard", "GET", 200, response.status_code, passed, notes)
            return passed
        
        except Exception as e:
            self.log_test("14_School_Dashboard", "/api/v1/school/dashboard", "GET", 200, "ERROR", False, str(e))
            return False
    
    def test_15_change_password(self):
        """Test 15: Change Password"""
        if "superAdmin" not in self.tokens:
            return False
        
        try:
            response = requests.post(
                f"{self.base_url}/api/settings/change-password",
                json={
                    "currentPassword": "Admin@123",
                    "newPassword": "NewPassword@456",
                    "confirmPassword": "NewPassword@456"
                },
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.tokens['superAdmin']}"
                }
            )
            
            # Password change might return 200 or other success codes
            passed = response.status_code in [200, 201, 202, 204]
            notes = f"Status {response.status_code}"
            
            self.log_test("15_Change_Password", "/api/settings/change-password", "POST", 200, response.status_code, passed, notes)
            return passed
        
        except Exception as e:
            self.log_test("15_Change_Password", "/api/settings/change-password", "POST", 200, "ERROR", False, str(e))
            return False
    
    def test_16_two_factor_auth(self):
        """Test 16: Two Factor Auth"""
        if "superAdmin" not in self.tokens:
            return False
        
        try:
            response = requests.post(
                f"{self.base_url}/api/settings/two-factor",
                json={"enabled": True},
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.tokens['superAdmin']}"
                }
            )
            
            passed = response.status_code in [200, 201, 202, 204]
            notes = f"Status {response.status_code}"
            
            self.log_test("16_Two_Factor_Auth", "/api/settings/two-factor", "POST", 200, response.status_code, passed, notes)
            return passed
        
        except Exception as e:
            self.log_test("16_Two_Factor_Auth", "/api/settings/two-factor", "POST", 200, "ERROR", False, str(e))
            return False
    
    def test_17_unauthorized_access(self):
        """Test 17: Unauthorized Access (No token)"""
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/school/dashboard"
            )
            
            passed = response.status_code == 401
            notes = f"Status {response.status_code}"
            
            self.log_test("17_Unauthorized_Access", "/api/v1/school/dashboard", "GET", 401, response.status_code, passed, notes)
            return passed
        
        except Exception as e:
            self.log_test("17_Unauthorized_Access", "/api/v1/school/dashboard", "GET", 401, "ERROR", False, str(e))
            return False
    
    def test_18_invalid_token(self):
        """Test 18: Invalid Token"""
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/school/dashboard",
                headers={"Authorization": "Bearer invalid_token_123"}
            )
            
            passed = response.status_code == 401
            notes = f"Status {response.status_code}"
            
            self.log_test("18_Invalid_Token", "/api/v1/school/dashboard", "GET", 401, response.status_code, passed, notes)
            return passed
        
        except Exception as e:
            self.log_test("18_Invalid_Token", "/api/v1/school/dashboard", "GET", 401, "ERROR", False, str(e))
            return False
    
    def test_19_delete_result(self):
        """Test 19: Delete Result"""
        if "superAdmin" not in self.tokens or "resultId" not in self.tokens:
            return False
        
        try:
            response = requests.delete(
                f"{self.base_url}/api/v1/school/results/{self.tokens['resultId']}",
                headers={"Authorization": f"Bearer {self.tokens['superAdmin']}"}
            )
            
            passed = response.status_code in [200, 204]
            notes = f"Status {response.status_code}"
            
            self.log_test("19_Delete_Result", f"/api/v1/school/results/{self.tokens['resultId']}", "DELETE", 204, response.status_code, passed, notes)
            return passed
        
        except Exception as e:
            self.log_test("19_Delete_Result", "/api/v1/school/results/{id}", "DELETE", 204, "ERROR", False, str(e))
            return False
    
    def test_20_delete_teacher(self):
        """Test 20: Delete Teacher"""
        if "superAdmin" not in self.tokens or "teacherId" not in self.tokens:
            return False
        
        try:
            response = requests.delete(
                f"{self.base_url}/api/v1/school/teachers/{self.tokens['teacherId']}",
                headers={"Authorization": f"Bearer {self.tokens['superAdmin']}"}
            )
            
            passed = response.status_code in [200, 204]
            notes = f"Status {response.status_code}"
            
            self.log_test("20_Delete_Teacher", f"/api/v1/school/teachers/{self.tokens['teacherId']}", "DELETE", 204, response.status_code, passed, notes)
            return passed
        
        except Exception as e:
            self.log_test("20_Delete_Teacher", "/api/v1/school/teachers/{id}", "DELETE", 204, "ERROR", False, str(e))
            return False
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print("Starting SpeakMate Backend API Tests")
        print("="*80)
        
        tests = [
            self.test_01_create_test_user,
            self.test_01b_test_user_login,
            self.test_01c_super_admin_login,
            self.test_02_create_result,
            self.test_03_get_all_results,
            self.test_04_search_results,
            self.test_05_get_result_by_id,
            self.test_06_get_results_by_student,
            self.test_07_update_result,
            self.test_08_create_teacher,
            self.test_09_get_all_teachers,
            self.test_10_search_teachers,
            self.test_11_get_teacher_by_id,
            self.test_12_update_teacher,
            self.test_13_global_search,
            self.test_14_school_dashboard,
            self.test_15_change_password,
            self.test_16_two_factor_auth,
            self.test_17_unauthorized_access,
            self.test_18_invalid_token,
            self.test_19_delete_result,
            self.test_20_delete_teacher,
        ]
        
        for test in tests:
            try:
                test()
            except Exception as e:
                print(f"✗ Test execution error in {test.__name__}: {str(e)}")
        
        self.print_summary()
        
        # Save results to file
        with open("test_results.json", "w") as f:
            json.dump(self.test_results, f, indent=2)
        
        print(f"\nResults saved to test_results.json")

if __name__ == "__main__":
    runner = TestRunner()
    runner.run_all_tests()
