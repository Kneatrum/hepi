

const DEFAULT_PAGE_SIZE = 20;

// --- TYPE DEFINITIONS ---


interface Permission {
  id: number;
  name: string;
  description?: string; // Added to match UserPopup.tsx, adjust if API differs
}

interface Role {
  roleCode: number;
  roleName: string;
  roleShortDesc: string;
  roleDescription: string;
  roleStatus: string;
  createDate: string;
  lastModified: string | null;
  createdBy: string | null;
  lastModifiedBy: string | null;
  permissions: Permission[];
  version: number;
}

interface RawUser {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  userPhoneNumber: string;
  country: string | null;
  role: Role;
  forgotPassword: boolean | null; // Type according to actual data
  enabled: boolean;
  accountNonExpired: boolean;
  accountNonLocked: boolean;
  credentialsNonExpired: boolean;
  // Other fields from the raw response can be added here if needed.
}

interface Pageable {
  pageNumber: number;
  pageSize: number;
  // Other pageable fields...
}

interface ApiResponse {
  content: RawUser[];
  pageable: Pageable;
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
  // Other API response fields...
}

// --- DESIRED OUTPUT STRUCTURE ---
// The clean, formatted user data object.

export interface FormattedUser {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  userPhoneNumber: string;
  country: string | null;
  roleCode: number;
  roleName: string;
  permissions: Permission[];
  roleShortDesc: string;
  roleDescription: string;
  roleStatus: string;
  forgotPassword: boolean | null;
  accountEnabled: boolean;
  accountNotExpired: boolean;
  accountNotLocked: boolean;
  credentialsNotExpired: boolean;
}

/**
 * Transforms a raw user object from the API into the desired structured format.
 * @param rawUser - The user object from the API response.
 * @returns A formatted user object.
 */
const formatUserData = (rawUser: RawUser): FormattedUser => {
  return {
    id: rawUser.id,
    firstname: rawUser.firstname,
    lastname: rawUser.lastname,
    email: rawUser.email,
    userPhoneNumber: rawUser.userPhoneNumber,
    country: rawUser.country,
    roleCode: rawUser.role.roleCode,
    roleName: rawUser.role.roleName,
    permissions: rawUser.role.permissions,
    roleShortDesc: rawUser.role.roleShortDesc,
    roleDescription: rawUser.role.roleDescription,
    roleStatus: rawUser.role.roleStatus,
    forgotPassword: rawUser.forgotPassword,
    accountEnabled: rawUser.enabled,
    accountNotExpired: rawUser.accountNonExpired,
    accountNotLocked: rawUser.accountNonLocked,
    credentialsNotExpired: rawUser.credentialsNonExpired,
  };
};


/**
 * Fetches a single page of data from the API.
 * @param baseUrl - The base URL of the API endpoint (without page query param).
 * @param page - The page number to fetch.
 * @param accessToken - The access token for authorization.
 * @returns A Promise that resolves to the API response for the given page.
 */
const fetchPage = async (baseUrl: string, page: number, accessToken: string): Promise<ApiResponse> => {
  const url = `${baseUrl}?page=${page}&size=${DEFAULT_PAGE_SIZE}`;
  console.log(`Fetching: ${url}`);
  const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status} for page ${page}`);
  }

  return response.json();
};

/**
 * Fetches all pages of data from a paginated API endpoint, parallelizing requests.
 * @param baseUrl - The base URL of the API endpoint.
 * @returns A promise that resolves to an array of all formatted user data.
 */
export const getAllUsers = async (baseUrl: string, accessToken: string): Promise<FormattedUser[]> => {
  try {
    // 1. Fetch the first page to determine the total number of pages
    const firstPageResponse = await fetchPage(baseUrl, 0, accessToken);
    const totalPages = firstPageResponse.totalPages;
    let allRawUsers: RawUser[] = firstPageResponse.content;

    // 2. If there is more than one page, prepare to fetch the rest
    if (totalPages > 1) {
      // Create an array of promises for all remaining pages (from page 1 to totalPages - 1)
      const pagePromises: Promise<ApiResponse>[] = [];
      for (let page = 1; page < totalPages; page++) {
        pagePromises.push(fetchPage(baseUrl, page, accessToken));
      }

      // 3. Execute all requests in parallel
      const subsequentPageResponses = await Promise.all(pagePromises);

      // 4. Extract and combine the content from all subsequent pages
      const subsequentRawUsers = subsequentPageResponses.flatMap(response => response.content);
      allRawUsers = [...allRawUsers, ...subsequentRawUsers];
    }

    // 5. Format the combined raw user data into the desired structure
    return allRawUsers.map(formatUserData);

  } catch (error) {
    console.error("Failed to fetch paginated data:", error);
    // Return an empty array or re-throw the error, depending on desired error handling
    return [];
  }
};