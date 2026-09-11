import apiClient from "./apiClient";

/**
 * frontend/src/services/adminInsightsApi.js
 *
 * Dedicated API service for Super Admin AI Insights.
 * Consumes existing backend endpoints and handles:
 *  - Raw array unwrapping for /api/admin/schools
 *  - Wrapped ApiResponse<Page<T>> unwrapping for /api/admin/school-users
 *  - Complete multi-page traversal so no students are omitted
 */

export const adminInsightsApi = {
  /**
   * Fetch all registered schools.
   * Backend returns raw array List<SchoolResponse> directly in response.data.
   *
   * @returns {Promise<Array>} List of school objects with embedded academicStructure
   */
  getSchools: async () => {
    const response = await apiClient.get("/api/admin/schools");
    // /api/admin/schools returns a raw array directly
    if (Array.isArray(response.data)) {
      return response.data;
    }
    // Defensive fallback if wrapped in ApiResponse
    if (Array.isArray(response.data?.data)) {
      return response.data.data;
    }
    return [];
  },

  /**
   * Fetch ALL school users (students) across all pages.
   * Backend endpoint /api/admin/school-users returns:
   * ApiResponse<Page<AdminSchoolUserResponse>>
   * Structure: { success: true, message: "...", data: { content: [...], totalElements, totalPages, number, size } }
   *
   * @param {number} pageSize Batch size per request (default 1000)
   * @returns {Promise<{ students: Array, totalElements: number, totalPages: number, pagesFetched: number }>}
   */
  getAllSchoolUsers: async (pageSize = 1000) => {
    let currentPage = 0;
    let allStudents = [];
    let totalElements = 0;
    let totalPages = 1;
    let pagesFetched = 0;

    // Fetch initial page
    const initialResponse = await apiClient.get("/api/admin/school-users", {
      params: {
        page: currentPage,
        size: pageSize,
        sortBy: "id",
        sortDir: "DESC",
      },
    });

    pagesFetched += 1;

    // Correctly unwrap ApiResponse<Page<T>>
    const pageData = initialResponse.data?.data || initialResponse.data || {};
    const content = Array.isArray(pageData.content) ? pageData.content : [];

    totalElements = typeof pageData.totalElements === "number" ? pageData.totalElements : content.length;
    totalPages = typeof pageData.totalPages === "number" ? pageData.totalPages : 1;

    allStudents.push(...content);

    // If there are more pages, sequentially fetch until complete dataset is loaded
    while (currentPage + 1 < totalPages) {
      currentPage += 1;
      const nextPageResponse = await apiClient.get("/api/admin/school-users", {
        params: {
          page: currentPage,
          size: pageSize,
          sortBy: "id",
          sortDir: "DESC",
        },
      });

      pagesFetched += 1;

      const nextPageData = nextPageResponse.data?.data || nextPageResponse.data || {};
      const nextContent = Array.isArray(nextPageData.content) ? nextPageData.content : [];
      allStudents.push(...nextContent);
    }

    return {
      students: allStudents,
      totalElements,
      totalPages,
      pagesFetched,
    };
  },
};

export default adminInsightsApi;
