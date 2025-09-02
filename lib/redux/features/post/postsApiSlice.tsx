import { apiSlice } from "../api/apiSlice"

// Define a type for your Post
export interface Post {
    id: string | number
    title: string
    body: string
    userId: string | number
}

// Define a type for creating a new post
export interface CreatePostRequest {
    title: string
    body: string
    userId: string | number
}

// Define a type for updating a post
export interface UpdatePostRequest {
    id: string | number
    title?: string
    body?: string
    userId?: string | number
}


interface LoginRequest {
    email: string
    password: string
}

interface LoginResponse {
    success: boolean
    message: string
    token: string
    user: {
        id: string
        name: string
        email: string
        role: string
    }
}

export interface AuthUser {
    _id: string
    name: string
    email: string
    role: string
    status: number
    createdAt: string
    updatedAt: string
}


interface PaginationParams {
    page?: number
    limit?: number
    search?: string
    role?: string
}

// Update the response interface to include meta data
export interface GetAuthUsersResponse {
    success: boolean
    message: string
    meta: {
        total: number
        page: number
        limit: number
        totalPages: number
    }
    data: AuthUser[]
}

export interface CreateUserRequest {
    name: string
    email: string
    password: string
    role: string
}

export interface CreateUserResponse {
    success: boolean
    messages: string
    data: {
        id: string
        name: string
        email: string
        role: string
    }
}

type UpdateUserRequest = {
    id: string;
    name: string;
    email: string;
    password: string;
    role: "admin" | "subadmin" | "manager";
};

type UpdateUserResponse = {
    message: string;
};

export interface GetRoleDropdownResponse {
    success: boolean;
    messages: string;
    data: string[]; // Array of role strings like ['admin', 'manager', 'subAdmin']
}

// NEW: Interface for role-based permissions API response
export interface RolePermission {
    _id: string
    role: string
    permissions: string[]
    createdAt: string
    updatedAt: string
}

export interface GetAllRolePermissionsResponse {
    success: boolean
    message: string
    meta: {
        total: number
        page: number
        limit: number
        totalPages: number
    }
    data: RolePermission[]
}


// Request payload for creating a role with permissions
export interface CreateRolePermissionRequest {
    role: string;
    permissions: string[];
}

// Response from the API when a role is successfully created
export interface CreateRolePermissionResponse {
    success: boolean;
    messages: string;
    data: {
        role: string;
        permissions: string[];
        _id: string;
        createdAt: string;
        updatedAt: string;
    };
}


// Request body you send to the API
interface CreateRolePermissionRequest1 {
    role: string
    permissions: string[]
}

// Response you expect back from the API
interface CreateRolePermissionResponse1 {
    message: string
}


// Request type
export interface UpdateRolePermissionRequest {
    role: string; // original role name
    updatedRole: string; // new role name (same as original if unchanged)
    permissions: string[];
}

// API responds with this
export interface UpdateRolePermissionResponse {
    success: boolean;
    messages: string;
    data: {
        _id: string;
        role: string;
        permissions: string[];
        createdAt: string;
        updatedAt: string;
    };
}


// Response returned when fetching permissions by role
export interface GetPermissionsByRoleResponse {
    success: boolean;
    messages: string;
    data: {
        role: string;
        permissions: string[];
        _id: string;
        createdAt: string;
        updatedAt: string;
    };
}



// Updated interfaces for the API
// Updated interfaces for the API
// Updated interfaces for the API
export interface Coupon {
    _id: string
    couponCode: string
    discount: number
    type: string // '%' or '$'
    couponType: string // 'Diamond', 'Gold', 'Silver', 'Bronze'
    status: number
    limit: number
    attendeeId: string
    attendeeIds: string[]
    createdAt: string
    updatedAt: string
}

export interface GetCouponsResponse {
    success: boolean
    messages: string
    meta: {
        total: number
        page: number
        limit: number
        totalPages: number
    }
    data: Coupon[]
}

// Updated request payload for creating a coupon
export interface CreateCouponRequest {
    couponCode: string
    discount: any
    type: string // '%' or '$'
    couponType: string // 'Diamond', 'Gold', 'Silver', 'Bronze'
    limit: number
}

// Updated response payload for creating a coupon
export interface CreateCouponResponse {
    success: boolean
    messages: string
    data: {
        couponCode: string
        discount: any
        type: string
        couponType: string
        limit: number
        status: number
        attendeeIds: string[]
        _id: string
        createdAt: string
        updatedAt: string
    }
}

// Updated request payload for updating a coupon
export interface UpdateCouponRequest {
    id: string
    couponCode: string
    discount: any
    type: string
    couponType: string
    limit: number
}

// Updated response payload for updating a coupon
export interface UpdateCouponResponse {
    success: boolean
    messages: string
    data: {
        _id: string
        couponCode: string
        discount: any
        type: string
        couponType: string
        limit: number
        createdAt: string
        updatedAt: string
    }
}



export interface WelcomeContent {
    _id: string;
    userId: string;
    title: string;
    description: string;
}

export interface GetWelcomeContentResponse {
    success: boolean;
    message: string;
    data: WelcomeContent[];
}

interface AboutUsContent {
    _id: string
    content: string
}

interface GetAboutUsContentResponse {
    data: AboutUsContent[]
}

export interface DashboardCountResponse {
    success: boolean
    messages: string
    data: {
        managerCount: number
        adminCount: number
        subAdminCount: number
        attendeeCount: number
    }
}

interface DashboardCountParams {
    startDate?: string
    endDate?: string
}

// types/home.types.ts

// types/home.types.ts

export interface HomeContent {
    _id: string;
    userId: string;
    title: string;
    subTitle: string;
    description: string;
    subDescription: string;
    subDescription1: string;
    createdAt: string;
    updatedAt: string;
}

export interface GetHomeResponse {
    success: boolean;
    message: string;
    data: HomeContent[];
}

export interface UpdateHomeContentRequest {
    id: string;
    title: string;
    subTitle: string;
    description: string;
}

export interface AttendeeFormContent {
    _id: string;
    userId: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

export interface GetAttendeeFormContentResponse {
    success: boolean;
    message: string;
    data: AttendeeFormContent[];
}

export interface UpdateAttendeeFormContentRequest {
    _id: string;
    content: string;
}

export interface UpdateAttendeeFormContentResponse {
    success: boolean;
    message: string;
    data: AttendeeFormContent;
}




export interface AccommodationsContent {
    _id: string;
    userId: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

export interface GetAccommodationsContentResponse {
    success: boolean;
    message: string;
    data: AccommodationsContent[];
}

export interface UpdateAccommodationsContentRequest {
    _id: string;
    content: string;
}

export interface UpdateAttendeeFormContentResponse {
    success: boolean;
    message: string;
    data: AccommodationsContent;
}


// types/welcome.types.ts
export interface WelcomeContent {
    _id: string;
    userId: string;
    title: string;
    description: string;
}

export interface GetWelcomeContentResponse {
    success: boolean;
    message: string;
    data: WelcomeContent[];
}


export interface CreateResourceRequest {
    name: string
    link: string
    type?: string
    activity?: number
}

// Response payload for creating a resource
export interface CreateResourceResponse {
    success: boolean
    message: string
    data: {
        userId: string
        name: string
        link: string
        type?: string
        _id: string
        createdAt: string
        updatedAt: string
        activity?: number
    }
}



// Define a type for your QuestionContent
export interface QuestionContent {
    _id: string
    userId: string
    question: string
    answer: string
    createdAt: string
    updatedAt: string
}

// Define the response interface for fetching question content
export interface GetQuestionContentResponse {
    success: boolean
    message: string
    data: QuestionContent[]
}

// Define the request interface for creating a new question
export interface CreateQuestionContentRequest {
    question: string
    answer: string
}

// Define the request interface for updating a question
export interface UpdateQuestionContentRequest {
    id: string
    question: string
    answer: string
    activity?: number
}

// Define the response interface for creating a new question
export interface CreateQuestionContentResponse {
    success: boolean
    message: string
    data: QuestionContent
}


// Define a type for your Agenda
export interface Agenda {
    _id: string
    userId: string
    title: string
    organizer: string
    description: string
    meetingRoom: string
    day: string
    time: string
    date: string
    createdAt: string
    updatedAt: string
}

// Define the response interface for fetching agendas
export interface GetAgendasResponse {
    success: boolean
    message: string
    data: Agenda[]
}

// Define the request interface for creating a new agenda
export interface CreateAgendaRequest {
    title: string
    organizer: string
    description: string
    meetingRoom: string
    day: string
    time: string
    date: string
}

// Define the request interface for updating an agenda
export interface UpdateAgendaRequest {
    id: string
    title: string
    organizer: string
    description: string
    meetingRoom: string
    day: string
    time: string
    date: string
    activity?: number
}

// New interface for updating just the activity status
export interface UpdateAgendaStatusRequest {
    id: string
    activity: number
}


// Define the interface for footer content
export interface FooterContent {
    _id: string
    userId: string
    images: string[]
    content: string
    createdAt: string
    updatedAt: string
}

// Define the response interface for fetching footer content
export interface GetFooterContentResponse {
    success: boolean
    message: string
    data: FooterContent[]
}

// Define the request interface for updating footer content
export interface UpdateFooterContentRequest {
    id: string
    content: string
    images: string[]
}


// First, let's add the MainHeading interface and response types
export interface MainHeading {
    _id: string
    userId: string
    image: string
    subImage: string
    buttonName: string
    description: string
    subDescription: string
    date: string
    createdAt: string
    updatedAt: string
}

export interface GetMainHeadingResponse {
    success: boolean
    message: string
    data: MainHeading[]
}

export interface CreateMainHeadingResponse {
    success: boolean
    message: string
    data: MainHeading
}

export interface UpdateMainHeadingRequest {
    id: string
    formData: FormData
}


// Speaker interfaces
export interface Speaker {
    _id: string
    userId: string
    name: string
    image: string
    type: string // NEW: Speaker type field
    description: string
    activity: number // Status field
    featured: number // NEW: Featured field (0 or 1)
    order: number // NEW: Order field for drag-and-drop
    createdAt: string
    updatedAt: string
}

export interface GetSpeakersResponse {
    success: boolean
    message: string
    data: Speaker[]
}

// NEW: Speaker reorder interfacesPlenary Speakers
export interface ReorderSpeakerRequest {
    startIndex: number
    endIndex: number
}

export interface ReorderSpeakerResponse {
    success: boolean
    message: string
    data: Speaker[]
}

// Speaker type constants
export const SPEAKER_TYPES = ["Featured Speakers", "Keynote Speakers", "Plenary Speakers"]
export type SpeakerType = (typeof SPEAKER_TYPES)[number]

export interface CreateSpeakerRequest {
    name: string
    description: string
    image: File
}

export interface UpdateSpeakerRequest {
    id: string
    name?: string
    description?: string
    image?: File
}

export interface CreateSpeakerResponse {
    success: boolean
    message: string
    data: Speaker
}

export interface UpdateSpeakerResponse {
    success: boolean
    message: string
    data: Speaker
    activity?: number
    featured?: number // NEW: Featured field
    order?: number // NEW: Order field
}


// Define TypeScript interfaces for AwardType
export interface AwardType {
    _id: string
    userId: string
    type: string
    description: string
    createdAt: string
    updatedAt: string
}

// Response interface for GET all award types
export interface GetAwardTypesResponse {
    success: boolean
    message: string
    data: AwardType[]
}

// Request interface for creating a new award type
export interface CreateAwardTypeRequest {
    type: string
    description: string
}

// Request interface for updating an award type
export interface UpdateAwardTypeRequest {
    id: string
    type: string
    description: string
    activity?: number
}

// Response interface for create/update operations
export interface AwardTypeResponse {
    success: boolean
    message: string
    data: AwardType
}

// Response interface for delete operation
export interface DeleteAwardTypeResponse {
    success: boolean
    message: string
}


// Define TypeScript interfaces for Award
export interface Award {
    _id: string
    userId: string
    name: string
    image: string
    description: string
    type: string
    createdAt: string
    updatedAt: string
}

// Response interface for GET all awards
export interface GetAwardsResponse {
    success: boolean
    message: string
    data: Award[]
}

// Request interface for creating a new award
export interface CreateAwardRequest {
    name: string
    description: string
    type: string
    image: File
}

// Request interface for updating an award
export interface UpdateAwardRequest {
    id: string
    name: string
    description: string
    type: string
    image?: File
    activity?: number
}

// Response interface for create/update operations
export interface AwardResponse {
    success: boolean
    message: string
    data: Award
}

// Response interface for delete operation
export interface DeleteAwardResponse {
    success: boolean
    message: string
}

// Award Type Dropdown Response
export interface GetAwardTypeDropdownResponse {
    success: boolean
    message: string
    data: string[]
}


// Define TypeScript interfaces for Sponsor
export interface Sponsor {
    _id: string
    image: string
    email: string
    password: string
    amount: number
    type: string
    activity: number
    createdAt: string
    updatedAt: string
}

// Define pagination params interface
interface PaginationParams {
    page?: number
    limit?: number
    search?: string
    type?: string
}

// Update the GetSponsorsResponse to include pagination meta
export interface GetSponsorsResponse {
    success: boolean
    messages: string
    meta: {
        total: number
        page: number
        limit: number
        totalPages: number
    }
    data: Sponsor[]
}

// Request interface for updating a sponsor
export interface UpdateSponsorRequest {
    id: string
    email: string
    amount: number
    type: string
    image?: File
}

// Response interface for update operations
export interface UpdateSponsorResponse {
    success: boolean
    messages: string
    data: Sponsor
}

// Response interface for delete operation
export interface DeleteSponsorResponse {
    success: boolean
    messages: string
}

// Sponsor type dropdown options
export const SPONSOR_TYPES = ["Gold", "Diamond", "Bronze"] as const
export type SponsorType = (typeof SPONSOR_TYPES)[number]


// Define the interface for sponsors content
export interface SponsorsContent {
    _id: string;
    userId: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

// Define the response interface for fetching sponsors content
export interface GetSponsorsContentResponse {
    success: boolean;
    message: string;
    data: SponsorsContent[];
}

// Define the request interface for updating sponsors content
export interface UpdateSponsorsContentRequest {
    id: string;
    content: string;
}

// Define the response interface for updating sponsors content
export interface UpdateSponsorsContentResponse {
    success: boolean;
    message: string;
    data: SponsorsContent;
}



// ATTENDEE INTERFACES
export interface Attendee {
    _id: string
    firstName: string
    lastName: string
    Institution: string
    primaryAffiliation: string
    primaryRoleintheIDeAPrograms: string
    city: string
    email: string
    activity?: number
    phone: number
    cellPhone: number
    termsAndConditions: string
    streetAddress: string
    state: string
    zipCode: string
    foodAndMealPlanning: {
        vegetarian: boolean
        allergies: string[]
    }
    registrationDetails: {
        track: string
        ticketType: string
    }
    preConferenceEvents: number[]
    awardSponsorship: number[]
    discountCoupon: string
    actualAmount: number
    createdAt: string
    updatedAt: string
}

// Response interface for GET all attendees
export interface GetAttendeesResponse {
    success: boolean
    message: string
    meta: {
        total: number
        page: number
        limit: number
        totalPages: number
    }
    data: Attendee[]
}

// Request interface for updating an attendee
export interface UpdateAttendeeRequest {
    id: string
    firstName: string
    lastName: string
    Institution: string
    primaryAffiliation: string
    primaryRoleintheIDeAPrograms: string
    city: string
    email: string
    phone: number
    activity?: number
    cellPhone: number
    termsAndConditions: string
    streetAddress: string
    state: string
    zipCode: string
    foodAndMealPlanning: {
        vegetarian: boolean
        allergies: string[]
    }
    registrationDetails: {
        track: string
        ticketType: string
    }
    preConferenceEvents: number[]
    awardSponsorship: number[]
    discountCoupon: string
    actualAmount: number
}

// Response interface for update operations
export interface UpdateAttendeeResponse {
    success: boolean
    message: string
    data: Attendee
}

// Response interface for delete operation
export interface DeleteAttendeeResponse {
    success: boolean
    message: string
}

export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
}

export interface ChangePasswordResponse {
    success: boolean;
    messages: string;
}


// Define the interface for abstracts content
export interface AbstractsContent {
    _id: string;
    userId: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

// Define the response interface for fetching abstracts content
export interface GetAbstractsContentResponse {
    success: boolean;
    message: string;
    data: AbstractsContent[];
}



// Define the request interface for updating sponsors content
export interface UpdateAbstractContentRequest {
    id: string;
    content: string;
}

// Define the response interface for updating sponsors content
export interface UpdateAbstractContentResponse {
    success: boolean;
    message: string;
    data: AbstractsContent;
}

// User interface for localStorage
export interface LocalStorageUser {
    id: string
    name: string
    email: string
    role: string
}


// Sponsor Payment Types
export interface SponsorPayment {
    payment: {
        _id: string
        payerId: string
        payeeId: string
        merchantId: string
        amount: number
        actualAmount: number
        status: string
        payerModel: string
        method: string
        currency: string
        transactionId: string
        requestedAt: string
        completedAt: string
        paypalJson: any
        createdAt: string
        updatedAt: string
        payer: {
            _id: string
            firstName: string
            lastName: string
            email: string
            phone: string
            termsAndConditions: string
            companyName: string
            companyDescription: string
            websiteUrl: string
            sponsorshipTier: string
            image: string
            actualAmount: number
            type: string
            awardSponsorship: string[]
            registrationDetails: {
                selectedSessions: Array<{
                    Level: string
                    Fee: string
                    Booth: string
                    Extras: string
                    Registrations: string
                    Recognition: string
                }>
            }
            sponsorType: string
            createdAt: string
            updatedAt: string
        }
    }
    payer: {
        _id: string
        firstName: string
        lastName: string
        email: string
        phone: string
        termsAndConditions: string
        companyName: string
        companyDescription: string
        websiteUrl: string
        sponsorshipTier: string
        image: string
        actualAmount: number
        type: string
        awardSponsorship: string[]
        registrationDetails: {
            selectedSessions: Array<{
                Level: string
                Fee: string
                Booth: string
                Extras: string
                Registrations: string
                Recognition: string
            }>
        }
        sponsorType: string
        createdAt: string
        updatedAt: string
    }
    coupon: any
}

export interface GetSponsorPaymentsResponse {
    success: boolean
    message: string
    meta: {
        total: number
        page: number
        limit: number
        totalPages: number
    }
    data: SponsorPayment[]
}

export interface SponsorPaymentParams {
    page?: number
    limit?: number
    search?: string
    startDate?: string
    endDate?: string
    type?: string
    sponsorType?: string
}


// Attendee Payment Interfaces
export interface AttendeePaymentParams {
    page?: number
    limit?: number
    search?: string
    startDate?: string
    endDate?: string
}

export interface MealQuestion {
    question: string
    answer: string
}

export interface FoodAndMealPlanning {
    mealQuestions: MealQuestion[]
    vegetarian: boolean
    allergies: string[]
}

export interface SelectedSession {
    question: string
    answer: string
    day: string
    session: string
    time: string
    selected: string
}

export interface AttendeeRegistrationDetails {
    track: string
    ticketType: string
    selectedSessions: SelectedSession[]
}

export interface AttendeePayerData {
    _id: string
    firstName: string
    lastName: string
    Institution: string
    dob: string
    designation: string
    aboutMe: string
    image: string
    LinkedIn: string
    instagram: string
    twitter: string
    facebook: string
    primaryAffiliation: string
    primaryRoleintheIDeAPrograms: string
    city: string
    email: string
    role: string
    phone: number
    cellPhone: number
    termsAndConditions: string
    streetAddress: string
    state: string
    zipCode: string
    foodAndMealPlanning: FoodAndMealPlanning
    registrationDetails: AttendeeRegistrationDetails
    preConferenceEvents: number[]
    awardSponsorship: string[]
    actualAmount: number
    createdAt: string
    updatedAt: string
}

export interface AttendeePaymentData {
    payment: {
        _id: string
        payerId: string
        payeeId: string
        merchantId: string
        amount: number
        actualAmount: number
        status: string
        payerModel: string
        method: string
        currency: string
        transactionId: string
        requestedAt: string
        completedAt: string
        paypalJson: any
        createdAt: string
        updatedAt: string
    }
    payer: AttendeePayerData
    coupon: any
}

export interface AttendeePaymentsResponse {
    success: boolean
    message: string
    meta: {
        total: number
        page: number
        limit: number
        totalPages: number
    }
    summary: {
        fullTotal: number
        pending: number
        completed: number
        failed: number
        refunded: number
    }
    data: AttendeePaymentData[]
}


// NEW: Refund Payment Interfaces
export interface RefundPaymentRequest {
    transactionId: string
}

export interface RefundPaymentResponse {
    success: boolean
    messages: string
    data: {
        payment: {
            _id: string
            payerId: string
            payeeId: string
            merchantId: string
            amount: number
            actualAmount: number
            couponCode: string
            couponDiscount: string
            status: string
            payerModel: string
            method: string
            currency: string
            transactionId: string
            requestedAt: string
            completedAt: string
            paypalJson: any
            payerDetails: any
            createdAt: string
            updatedAt: string
            reference: string
        }
        refundDetails: {
            id: string
            status: string
            links: Array<{
                href: string
                rel: string
                method: string
            }>
        }
    }
}


// SEO Data Interface - Updated with page field
export interface SEOData {
    _id: string
    image: string
    page: string // Changed from title to page
    title: string
    description: string
    createdAt: string
    updatedAt: string
}

// API Response Interface
export interface GetSEOResponse {
    success: boolean
    message: string
    data: SEOData[]
}

// Update Request Interface
export interface UpdateSEORequest {
    id: string
    formData: FormData
}

// Update Response Interface
export interface UpdateSEOResponse {
    success: boolean
    message: string
    data: SEOData
}

// Page names constant - matching your requirements
export const SEO_PAGES = [
    "Home",
    "Welcome",
    "Agenda",
    "Speakers",
    "FAQs",
    "NISBRE Awards",
    "Abstracts",
    "Resources",
    "Sponsors",
    "Accommodations",
    "About Us",
    "Registrations",
] as const

export type SEOPageType = (typeof SEO_PAGES)[number]

// Define types for the new notification API
export type NotificationResponseItem = {
    token: string
    success: boolean
    error?: {
        code: string
        message: string
    }
    messageId?: string
}

export type SendNotificationResponse = {
    success: boolean
    response: {
        successCount: number
        failureCount: number
        responses: NotificationResponseItem[]
        image?: string // URL of the uploaded image
    }
}


// New types for user dropdown
// New types for user dropdown
export type UserDrop = {
    name: string
    image: string
    fcmToken: string
}

export type GetUserDropsResponse = {
    success: boolean
    userDrops: UserDrop[]
}

// PhotoBooth Types - Updated for new API response format
export interface PhotoBoothImage {
    _id: string
    username: string
    url: string
    date: string
}

export interface GetPhotoBoothResponse {
    success: boolean
    message: string
    data: PhotoBoothImage[]
}

export interface UpdatePhotoBoothRequest {
    urlToReplace: string
    images: File[]
}

export interface UpdatePhotoBoothResponse {
    success: boolean
    message: string
    data: any
}

export interface DeletePhotoBoothImagesRequest {
    images: string[]
}

export interface DeletePhotoBoothImagesResponse {
    success: boolean
    message: string
}

// Attendee Dropdown Types
export interface AttendeeDropdown {
    id: string
    username: string
    email: string
    image: string
}

export interface GetAttendeeDropdownResponse {
    success: boolean
    message: string
    data: AttendeeDropdown[]
}

// Filter Parameters
export interface PhotoBoothFilterParams {
    attendeeId?: string
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
}

// Keep old types for backward compatibility if needed elsewhere
export interface PhotoBoothAttendee {
    _id: string
    firstName: string
    lastName: string
}

export interface PhotoBooth {
    _id: string
    attendeeId: PhotoBoothAttendee
    images: string[]
    createdAt: string
    updatedAt: string
}



// Extend the apiSlice with posts-specific endpoints
export const postsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // GET all posts
        getPosts: builder.query<Post[], void>({
            query: () => "/posts",
            providesTags: (result) =>
                result
                    ? [...result.map(({ id }) => ({ type: "Posts" as const, id })), { type: "Posts", id: "LIST" }]
                    : [{ type: "Posts", id: "LIST" }],
        }),

        // GET a single post by ID
        getPostById: builder.query<Post, string | number>({
            query: (id) => `/posts/${id}`,
            providesTags: (_, __, id) => [{ type: "Posts", id }],
        }),


        // POST a new post
        createPost: builder.mutation<Post, CreatePostRequest>({
            query: (post) => ({
                url: "/posts",
                method: "POST",
                body: post,
            }),
            invalidatesTags: [{ type: "Posts", id: "LIST" }],
        }),

        // PUT/PATCH to update a post
        updatePost: builder.mutation<Post, UpdatePostRequest>({
            query: ({ id, ...patch }) => ({
                url: `/posts/${id}`,
                method: "PATCH", // or 'PUT' depending on your API
                body: patch,
            }),
            invalidatesTags: (_, __, { id }) => [{ type: "Posts", id }],
        }),

        // DELETE a post
        deletePost: builder.mutation<void, string | number>({
            query: (id) => ({
                url: `/posts/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (_, __, id) => [{ type: "Posts", id }],
        }),

        // Login API
        loginUser: builder.mutation<LoginResponse, LoginRequest>({
            query: (credentials) => ({
                url: "/auth/login",
                method: "POST",
                body: credentials,
            }),
        }),

        // Enhanced Login API that also refreshes permissions
        loginUserWithPermissions: builder.mutation<LoginResponse, LoginRequest>({
            query: (credentials) => ({
                url: "/auth/login",
                method: "POST",
                body: credentials,
            }),
            // Invalidate role permissions cache after login to force fresh fetch
            invalidatesTags: [{ type: "RolePermissions", id: "LIST" }],
        }),

        getAuthUsers: builder.query<GetAuthUsersResponse, PaginationParams | void>({
            query: (params: PaginationParams = {}) => {
                const queryParams = new URLSearchParams()

                if (params.page) queryParams.append("page", params.page.toString())
                if (params.limit) queryParams.append("limit", params.limit.toString())
                if (params.search?.trim()) queryParams.append("search", params.search.trim())
                if (params.role) queryParams.append("role", params.role)

                const queryString = queryParams.toString()
                return `/auth${queryString ? `?${queryString}` : ""}`
            },
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ _id }) => ({ type: "AuthUsers" as const, id: _id })),
                        { type: "AuthUsers", id: "LIST" },
                    ]
                    : [{ type: "AuthUsers", id: "LIST" }],
        }),

        // DELETE an auth user
        deleteAuthUser: builder.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `/auth/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (_, __, id) => [{ type: "AuthUsers", id }],
        }),

        // POST new auth user
        createAuthUser: builder.mutation<{ message: string }, CreateUserRequest>({
            query: (userData) => ({
                url: "/auth/createUserByAdmin",
                method: "POST",
                body: userData,
            }),
            invalidatesTags: [{ type: "AuthUsers", id: "LIST" }],
        }),


        updateAuthUser: builder.mutation<{ message: string }, UpdateUserRequest>({
            query: ({ id, ...data }) => ({
                url: `/auth/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: (_, __, { id }) => [{ type: "AuthUsers", id }],
        }),

        getRoleDropdown: builder.query<GetRoleDropdownResponse, void>({
            query: () => "/roleBase/Drops",
            providesTags: [{ type: "Roles", id: "LIST" }],
        }),

        // NEW: GET all role permissions for sidebar filtering
        // NEW: GET all role permissions for sidebar filtering - WITH PROPER AUTH
        getAllRolePermissions: builder.query<GetAllRolePermissionsResponse, void>({
            query: () => ({
                url: "/roleBase",
                method: "GET",
            }),
            // Add retry logic for this specific endpoint
            extraOptions: {
                maxRetries: 3,
                retryCondition: (error: any) => {
                    // Retry on 401 errors which might be due to token not being available yet
                    return error.status === 401
                },
                retryDelay: (attempt: any) => {
                    // Exponential backoff: 300ms, 600ms, 1200ms, etc.
                    return Math.min(300 * 2 ** attempt, 3000)
                },
            },
            providesTags: [{ type: "RolePermissions", id: "LIST" }],
        }),

        // POST a new role with permissions
        createRolePermission: builder.mutation<{ message: string }, CreateRolePermissionRequest1, CreateRolePermissionResponse1>({
            query: (data) => ({
                url: "/roleBase",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [{ type: "Roles", id: "LIST" }],
        }),

        // PUT a new role with permissions
        // Define the mutation correctly with only two generic types
        updateRolePermission: builder.mutation<{ message: string }, UpdateRolePermissionRequest>({
            query: ({ role, updatedRole, permissions }) => ({
                url: `/roleBase/${role}`,
                method: "PUT",
                body: {
                    role: updatedRole, // Send the updated role name in the body
                    permissions,
                },
            }),
            invalidatesTags: [{ type: "Roles", id: "LIST" }],
        }),



        getPermissionsByRole: builder.query<GetPermissionsByRoleResponse, string>({
            query: (role) => `/roleBase/${role}`,
            providesTags: (result, error, role) => [{ type: "Roles", id: role }],
        }),


        deleteRolePermission: builder.mutation<{ success: boolean; messages: string }, string>({
            query: (role) => ({
                url: `/roleBase/${role}`,
                method: "DELETE",
            }),
            invalidatesTags: [{ type: "Roles", id: "LIST" }],
        }),


        // Get Coupen Function with pagination
        getCoupons: builder.query<GetCouponsResponse, PaginationParams | void>({
            query: (params: PaginationParams = {}) => {
                const queryParams = new URLSearchParams()

                if (params.page) queryParams.append("page", params.page.toString())
                if (params.limit) queryParams.append("limit", params.limit.toString())
                if (params.search?.trim()) queryParams.append("search", params.search.trim())

                const queryString = queryParams.toString()
                return `/coupon${queryString ? `?${queryString}` : ""}`
            },
            providesTags: (result) =>
                result?.data
                    ? [...result.data.map(({ _id }) => ({ type: "Coupons" as const, id: _id })), { type: "Coupons", id: "LIST" }]
                    : [{ type: "Coupons", id: "LIST" }],
        }),

        // Create New Coupons
        createCoupon: builder.mutation<{ messages: string }, CreateCouponRequest>({
            query: (newCoupon) => ({
                url: "/coupon",
                method: "POST",
                body: {
                    couponCode: newCoupon.couponCode,
                    discount: newCoupon.discount,
                    type: newCoupon.type,
                    couponType: newCoupon.couponType,
                    limit: newCoupon.limit,
                },
            }),
            invalidatesTags: [{ type: "Coupons", id: "LIST" }],
        }),

        // PUT to update a coupon
        updateCoupon: builder.mutation<UpdateCouponResponse, UpdateCouponRequest>({
            query: ({ id, ...data }) => ({
                url: `/coupon/${id}`,
                method: "PUT",
                body: {
                    couponCode: data.couponCode,
                    discount: data.discount,
                    type: data.type,
                    couponType: data.couponType,
                    limit: data.limit,
                },
            }),
            invalidatesTags: (_, __, { id }) => [{ type: "Coupons", id }],
        }),

        // DELETE a coupon
        deleteCoupon: builder.mutation<{ success: boolean; messages: string }, string>({
            query: (id) => ({
                url: `/coupon/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (_, __, id) => [{ type: "Coupons", id }],
        }),


        // Get Welcome page
        getWelcomeContent: builder.query<GetWelcomeContentResponse, void>({
            query: () => "/welcomeContent",
            providesTags: (result) =>
                result?.data
                    ? [...result.data.map(({ _id }) => ({ type: "WelcomeContent" as const, id: _id })), { type: "WelcomeContent", id: "LIST" }]
                    : [{ type: "WelcomeContent", id: "LIST" }],
        }),

        updateWelcomeContent: builder.mutation({
            query: (data) => ({
                url: `/welcomeContent/${data.id}`,
                method: "PUT",
                body: {
                    title: data.title, // ✅ Include title
                    description: data.description,
                },
            }),
            invalidatesTags: [{ type: "WelcomeContent", id: "LIST" }],
        }),


        getDashboardCount: builder.query<DashboardCountResponse, DashboardCountParams | void>({
            query: (params) => {
                let url = "/auth/dashboardCount"

                if (params?.startDate && params?.endDate) {
                    const searchParams = new URLSearchParams({
                        startDate: params.startDate,
                        endDate: params.endDate,
                    })
                    url += `?${searchParams.toString()}`
                }

                return url
            },
            providesTags: [{ type: "Dashboard", id: "COUNT" }],
        }),


        getHomeContent: builder.query<GetHomeResponse, void>({
            query: () => '/homeContent',
            providesTags: [{ type: 'HomeContent', id: 'LIST' }],
        }),

        updateHomeContent: builder.mutation<any, UpdateHomeContentRequest>({
            query: (data) => ({
                url: `/homeContent/${data.id}`,
                method: 'PUT',
                body: {
                    title: data.title,
                    subTitle: data.subTitle,
                    description: data.description,
                },
            }),
            invalidatesTags: [{ type: 'HomeContent', id: 'LIST' }],
        }),

        // GET: Fetch attendee registration form content
        getAttendeeFormContent: builder.query<GetAttendeeFormContentResponse, void>({
            query: () => "/attendeeRegistrationFormContent",
            providesTags: [{ type: "AttendeeFormContent", id: "LIST" }],
        }),

        // PUT: Update attendee registration form content
        updateAttendeeFormContent: builder.mutation<UpdateAttendeeFormContentResponse, UpdateAttendeeFormContentRequest>({
            query: (data) => ({
                url: `/attendeeRegistrationFormContent/${data._id}`,
                method: "PUT",
                body: { content: data.content },
            }),
            invalidatesTags: [{ type: "AttendeeFormContent", id: "LIST" }],
        }),


        getAccommodationsContent: builder.query<GetAttendeeFormContentResponse, void>({
            query: () => "/accommodationsContent",
            providesTags: [{ type: "AccommodationsContent", id: "LIST" }],
        }),

        // PUT: Update attendee registration form content
        updateAccommodationsContent: builder.mutation<UpdateAttendeeFormContentResponse, UpdateAttendeeFormContentRequest>({
            query: (data) => ({
                url: `/accommodationsContent/${data._id}`,
                method: "PUT",
                body: { content: data.content },
            }),
            invalidatesTags: [{ type: "AccommodationsContent", id: "LIST" }],
        }),


        getResourcesContent: builder.query<GetWelcomeContentResponse, void>({
            query: () => "/resourcesContent",
            providesTags: [{ type: "Resources", id: "LIST" }],
        }),

        createResource: builder.mutation<CreateResourceResponse, CreateResourceRequest>({
            query: (resourceData) => ({
                url: "/resourcesContent",
                method: "POST",
                body: resourceData,
            }),
            invalidatesTags: [{ type: "Resources", id: "LIST" }],
        }),

        // PUT to update a resource
        updateResource: builder.mutation<CreateResourceResponse, { id: string } & CreateResourceRequest>({
            query: ({ id, ...data }) => ({
                url: `/resourcesContent/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: [{ type: "Resources", id: "LIST" }],
        }),

        // DELETE a resource
        deleteResource: builder.mutation<{ success: boolean; message: string }, string>({
            query: (id) => ({
                url: `/resourcesContent/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: [{ type: "Resources", id: "LIST" }],
        }),


        // GET all question content
        getQuestionContent: builder.query<GetQuestionContentResponse, void>({
            query: () => "/questionContent",
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ _id }) => ({ type: "QuestionContent" as const, id: _id })),
                        { type: "QuestionContent", id: "LIST" },
                    ]
                    : [{ type: "QuestionContent", id: "LIST" }],
        }),

        // POST a new question
        createQuestionContent: builder.mutation<CreateQuestionContentResponse, CreateQuestionContentRequest>({
            query: (questionData) => ({
                url: "/questionContent",
                method: "POST",
                body: questionData,
            }),
            invalidatesTags: [{ type: "QuestionContent", id: "LIST" }],
        }),

        // PUT to update a question
        updateQuestionContent: builder.mutation<CreateQuestionContentResponse, UpdateQuestionContentRequest>({
            query: ({ id, ...data }) => ({
                url: `/questionContent/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: [{ type: "QuestionContent", id: "LIST" }],
        }),

        // DELETE a question
        deleteQuestionContent: builder.mutation<{ success: boolean; message: string }, string>({
            query: (id) => ({
                url: `/questionContent/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: [{ type: "QuestionContent", id: "LIST" }],
        }),


        // GET all agendas
        // getAgendas: builder.query<GetAgendasResponse, void>({
        //     query: () => "/agenda",
        //     providesTags: (result) =>
        //         result?.data
        //             ? [
        //                 ...result.data.map(({ _id }) => ({ type: "Agendas" as const, id: _id })),
        //                 { type: "Agendas", id: "LIST" },
        //             ]
        //             : [{ type: "Agendas", id: "LIST" }],
        // }),

        // GET all agendas
        getAgendas: builder.query<GetAgendasResponse, void>({
            query: () => "/agenda",
            providesTags: (result) =>
                result?.data
                    ? [...result.data.map(({ _id }) => ({ type: "Agendas" as const, id: _id })), { type: "Agendas", id: "LIST" }]
                    : [{ type: "Agendas", id: "LIST" }],
        }),

        // POST a new agenda
        createAgenda: builder.mutation<{ success: boolean; message: string; data: Agenda }, CreateAgendaRequest>({
            query: (agendaData) => ({
                url: "/agenda",
                method: "POST",
                body: agendaData,
            }),
            invalidatesTags: [{ type: "Agendas", id: "LIST" }],
        }),

        // PUT to update an agenda
        updateAgenda: builder.mutation<{ success: boolean; message: string; data: Agenda }, UpdateAgendaRequest>({
            query: ({ id, ...data }) => ({
                url: `/agenda/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: (_, __, { id }) => [{ type: "Agendas", id }],
        }),

        // DELETE an agenda
        deleteAgenda: builder.mutation<{ success: boolean; message: string }, string>({
            query: (id) => ({
                url: `/agenda/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (_, __, id) => [{ type: "Agendas", id }],
        }),


        // GET footer content
        getFooterContent: builder.query<GetFooterContentResponse, void>({
            query: () => "/footerContent",
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ _id }) => ({ type: "FooterContent" as const, id: _id })),
                        { type: "FooterContent", id: "LIST" },
                    ]
                    : [{ type: "FooterContent", id: "LIST" }],
        }),

        // PUT to update footer content
        updateFooterContent: builder.mutation<{ success: boolean; message: string; data: FooterContent }, { id: string; formData: FormData }>({
            query: ({ id, formData }) => ({
                url: `/footerContent/${id}`,
                method: "PUT",
                body: formData,
                headers: {},
                formData: true, // This signals RTK Query that we're sending FormData
            }),
            invalidatesTags: [{ type: "FooterContent", id: "LIST" }],
        }),

        // POST to create footer content
        createFooterContent: builder.mutation<{ success: boolean; message: string; data: FooterContent }, { formData: FormData }>({
            query: ({ formData }) => ({
                url: "/footerContent",
                method: "POST",
                body: formData,
                headers: {},
                formData: true, // This signals RTK Query that we're sending FormData
            }),
            invalidatesTags: [{ type: "FooterContent", id: "LIST" }],
        }),


        // GET main heading
        getMainHeading: builder.query<GetMainHeadingResponse, void>({
            query: () => "/mainHeading",
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ _id }) => ({ type: "MainHeading" as const, id: _id })),
                        { type: "MainHeading", id: "LIST" },
                    ]
                    : [{ type: "MainHeading", id: "LIST" }],
        }),

        // PUT to update main heading
        updateMainHeading: builder.mutation<CreateMainHeadingResponse, UpdateMainHeadingRequest>({
            query: ({ id, formData }) => ({
                url: `/mainHeading/${id}`,
                method: "PUT",
                body: formData,
                formData: true,
            }),
            invalidatesTags: (_, __, { id }) => [{ type: "MainHeading", id }],
        }),

        // SPEAKERS CRUD OPERATIONS
        // GET all speakers
        getSpeakers: builder.query<GetSpeakersResponse, void>({
            query: () => "/speaker",
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ _id }) => ({ type: "Speakers" as const, id: _id })),
                        { type: "Speakers", id: "LIST" },
                    ]
                    : [{ type: "Speakers", id: "LIST" }],
        }),

        // POST create new speaker
        createSpeaker: builder.mutation<CreateSpeakerResponse, FormData>({
            query: (formData) => ({
                url: "/speaker",
                method: "POST",
                body: formData,
                formData: true,
            }),
            invalidatesTags: [{ type: "Speakers", id: "LIST" }],
        }),

        // PUT update speaker
        updateSpeaker: builder.mutation<UpdateSpeakerResponse, { id: string; formData: FormData }>({
            query: ({ id, formData }) => ({
                url: `/speaker/${id}`,
                method: "PUT",
                body: formData,
                formData: true,
            }),
            invalidatesTags: (_, __, { id }) => [{ type: "Speakers", id }],
        }),

        // DELETE speaker
        deleteSpeaker: builder.mutation<{ success: boolean; message: string }, string>({
            query: (id) => ({
                url: `/speaker/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (_, __, id) => [{ type: "Speakers", id }],
        }),

        // COMMITTEE CRUD OPERATIONS
        // GET all committees
        getCommittees: builder.query<GetSpeakersResponse, void>({
            query: () => "/committee",
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ _id }) => ({ type: "Committees" as const, id: _id })),
                        { type: "Committees", id: "LIST" },
                    ]
                    : [{ type: "Committees", id: "LIST" }],
        }),

        // POST create new committees
        createCommittees: builder.mutation<CreateSpeakerResponse, FormData>({
            query: (formData) => ({
                url: "/committee",
                method: "POST",
                body: formData,
                formData: true,
            }),
            invalidatesTags: [{ type: "Committees", id: "LIST" }],
        }),

        // PUT update committees
        updateCommittees: builder.mutation<UpdateSpeakerResponse, { id: string; formData: FormData }>({
            query: ({ id, formData }) => ({
                url: `/committee/${id}`,
                method: "PUT",
                body: formData,
                formData: true,
            }),
            invalidatesTags: (_, __, { id }) => [{ type: "Committees", id }],
        }),

        // DELETE committees
        deleteCommittees: builder.mutation<{ success: boolean; message: string }, string>({
            query: (id) => ({
                url: `/committee/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (_, __, id) => [{ type: "Committees", id }],
        }),

        // SUPPORTTEAM CRUD OPERATIONS
        // GET all supportteams
        getSupportteams: builder.query<GetSpeakersResponse, void>({
            query: () => "/supportTeam",
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ _id }) => ({ type: "Supportteams" as const, id: _id })),
                        { type: "Supportteams", id: "LIST" },
                    ]
                    : [{ type: "Supportteams", id: "LIST" }],
        }),

        // POST create new supportteams
        createSupportteams: builder.mutation<CreateSpeakerResponse, FormData>({
            query: (formData) => ({
                url: "/supportTeam",
                method: "POST",
                body: formData,
                formData: true,
            }),
            invalidatesTags: [{ type: "Supportteams", id: "LIST" }],
        }),

        // PUT update supportteams
        updateSupportteams: builder.mutation<UpdateSpeakerResponse, { id: string; formData: FormData }>({
            query: ({ id, formData }) => ({
                url: `/supportTeam/${id}`,
                method: "PUT",
                body: formData,
                formData: true,
            }),
            invalidatesTags: (_, __, { id }) => [{ type: "Supportteams", id }],
        }),

        // DELETE supportteams
        deleteSupportteams: builder.mutation<{ success: boolean; message: string }, string>({
            query: (id) => ({
                url: `/supportTeam/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (_, __, id) => [{ type: "Supportteams", id }],
        }),

        // GET all award types
        getAwardTypes: builder.query<GetAwardTypesResponse, void>({
            query: () => "/awardType",
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ _id }) => ({ type: "AwardTypes" as const, id: _id })),
                        { type: "AwardTypes", id: "LIST" },
                    ]
                    : [{ type: "AwardTypes", id: "LIST" }],
        }),

        // POST create new award type
        createAwardType: builder.mutation<AwardTypeResponse, CreateAwardTypeRequest>({
            query: (awardTypeData) => ({
                url: "/awardType",
                method: "POST",
                body: awardTypeData,
            }),
            invalidatesTags: [{ type: "AwardTypes", id: "LIST" }],
        }),

        // PUT update award type
        updateAwardType: builder.mutation<AwardTypeResponse, UpdateAwardTypeRequest>({
            query: ({ id, ...data }) => ({
                url: `/awardType/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: (_, __, { id }) => [{ type: "AwardTypes", id }],
        }),

        // DELETE award type
        deleteAwardType: builder.mutation<DeleteAwardTypeResponse, string>({
            query: (id) => ({
                url: `/awardType/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (_, __, id) => [{ type: "AwardTypes", id }],
        }),

        // GET all awards
        getAwards: builder.query<GetAwardsResponse, void>({
            query: () => "/award",
            providesTags: (result) =>
                result?.data
                    ? [...result.data.map(({ _id }) => ({ type: "Awards" as const, id: _id })), { type: "Awards", id: "LIST" }]
                    : [{ type: "Awards", id: "LIST" }],
        }),

        // GET award type dropdown
        getAwardTypeDropdown: builder.query<GetAwardTypeDropdownResponse, void>({
            query: () => "/awardType/drops",
            providesTags: [{ type: "AwardTypeDropdown", id: "LIST" }],
        }),

        // POST create new award
        createAward: builder.mutation<AwardResponse, FormData>({
            query: (formData) => ({
                url: "/award",
                method: "POST",
                body: formData,
                formData: true,
            }),
            invalidatesTags: [{ type: "Awards", id: "LIST" }],
        }),

        // PUT update award
        updateAward: builder.mutation<AwardResponse, { id: string; formData: FormData }>({
            query: ({ id, formData }) => ({
                url: `/award/${id}`,
                method: "PUT",
                body: formData,
                formData: true,
            }),
            invalidatesTags: (_, __, { id }) => [{ type: "Awards", id }],
        }),

        // DELETE award
        deleteAward: builder.mutation<DeleteAwardResponse, string>({
            query: (id) => ({
                url: `/award/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (_, __, id) => [{ type: "Awards", id }],
        }),


        // GET all sponsors
        getSponsors: builder.query<GetSponsorsResponse, PaginationParams | void>({
            query: (params: PaginationParams = {}) => {
                const queryParams = new URLSearchParams()

                if (params.page) queryParams.append("page", params.page.toString())
                if (params.limit) queryParams.append("limit", params.limit.toString())
                if (params.search?.trim()) queryParams.append("search", params.search.trim())
                if (params.type) queryParams.append("type", params.type)

                const queryString = queryParams.toString()
                return `/sponsor${queryString ? `?${queryString}` : ""}`
            },
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ _id }) => ({ type: "Sponsors" as const, id: _id })),
                        { type: "Sponsors", id: "LIST" },
                    ]
                    : [{ type: "Sponsors", id: "LIST" }],
        }),

        // PUT update sponsor
        updateSponsor: builder.mutation<UpdateSponsorResponse, { id: string; formData: FormData }>({
            query: ({ id, formData }) => ({
                url: `/sponsor/${id}`,
                method: "PUT",
                body: formData,
                formData: true,
            }),
            invalidatesTags: (_, __, { id }) => [{ type: "Sponsors", id }],
        }),

        // DELETE sponsor
        deleteSponsor: builder.mutation<DeleteSponsorResponse, string>({
            query: (id) => ({
                url: `/sponsor/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (_, __, id) => [{ type: "Sponsors", id }],
        }),

        // GET sponsors content
        getSponsorsContent: builder.query<GetSponsorsContentResponse, void>({
            query: () => "/sponsorsContent",
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ _id }) => ({ type: "SponsorsContent" as const, id: _id })),
                        { type: "SponsorsContent", id: "LIST" },
                    ]
                    : [{ type: "SponsorsContent", id: "LIST" }],
        }),

        // PUT to update sponsors content
        updateSponsorsContent: builder.mutation<UpdateSponsorsContentResponse, UpdateSponsorsContentRequest>({
            query: ({ id, content }) => ({
                url: `/sponsorsContent/${id}`,
                method: "PUT",
                body: { content },
            }),
            invalidatesTags: (_, __, { id }) => [{ type: "SponsorsContent", id }],
        }),


        // ATTENDEE CRUD OPERATIONS
        // GET all attendees
        getAttendees: builder.query<GetAttendeesResponse, PaginationParams | void>({
            query: (params: PaginationParams = {}) => {
                const queryParams = new URLSearchParams()

                if (params.page) queryParams.append("page", params.page.toString())
                if (params.limit) queryParams.append("limit", params.limit.toString())
                if (params.search?.trim()) queryParams.append("search", params.search.trim())

                const queryString = queryParams.toString()
                return `/attendee${queryString ? `?${queryString}` : ""}`
            },
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ _id }) => ({ type: "Attendees" as const, id: _id })),
                        { type: "Attendees", id: "LIST" },
                    ]
                    : [{ type: "Attendees", id: "LIST" }],
        }),

        // PUT update attendee
        updateAttendee: builder.mutation<UpdateAttendeeResponse, UpdateAttendeeRequest>({
            query: ({ id, ...data }) => ({
                url: `/attendee/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: (_, __, { id }) => [{ type: "Attendees", id }],
        }),

        // DELETE attendee
        deleteAttendee: builder.mutation<DeleteAttendeeResponse, string>({
            query: (id) => ({
                url: `/attendee/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (_, __, id) => [{ type: "Attendees", id }],
        }),

        changePassword: builder.mutation<ChangePasswordResponse, ChangePasswordRequest>({
            query: (data) => ({
                url: "/auth/changePassword",
                method: "POST",
                body: data,
            }),
        }),

        // GET abstracts content
        getAbstractsContent: builder.query<GetAbstractsContentResponse, void>({
            query: () => "/abstractContent",
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ _id }) => ({ type: "AbstractContent" as const, id: _id })),
                        { type: "AbstractContent", id: "LIST" },
                    ]
                    : [{ type: "AbstractContent", id: "LIST" }],
        }),


        // PUT to update sponsors content
        updateAbstractsContent: builder.mutation<UpdateSponsorsContentResponse, UpdateSponsorsContentRequest>({
            query: ({ id, content }) => ({
                url: `/abstractContent/${id}`,
                method: "PUT",
                body: { content },
            }),
            invalidatesTags: (_, __, { id }) => [{ type: "AbstractContent", id }],
        }),


        // GET sponsor payments
        getSponsorPayments: builder.query<GetSponsorPaymentsResponse, SponsorPaymentParams | void>({
            query: (params: SponsorPaymentParams = {}) => {
                const queryParams = new URLSearchParams()

                if (params.page) queryParams.append("page", params.page.toString())
                if (params.limit) queryParams.append("limit", params.limit.toString())
                if (params.search?.trim()) queryParams.append("search", params.search.trim())
                if (params.startDate) queryParams.append("startDate", params.startDate)
                if (params.endDate) queryParams.append("endDate", params.endDate)
                if (params.type) queryParams.append("type", params.type)
                if (params.sponsorType) queryParams.append("sponsorType", params.sponsorType)

                const queryString = queryParams.toString()
                return `/payments/sponsors${queryString ? `?${queryString}` : ""}`
            },
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ payment }) => ({ type: "SponsorPayments" as const, id: payment._id })),
                        { type: "SponsorPayments", id: "LIST" },
                    ]
                    : [{ type: "SponsorPayments", id: "LIST" }],
        }),

        // NEW: POST refund attendee payment
        refundSponsorPayments: builder.mutation<RefundPaymentResponse, RefundPaymentRequest>({
            query: ({ transactionId }) => ({
                url: `/sponsor/refund/${transactionId}`,
                method: "POST",
            }),
            invalidatesTags: [{ type: "SponsorPayments", id: "LIST" }],
        }),

        getAttendeePayments: builder.query<AttendeePaymentsResponse, AttendeePaymentParams | void>({
            query: (params: AttendeePaymentParams = {}) => {
                const queryParams = new URLSearchParams()

                if (params.page) queryParams.append("page", params.page.toString())
                if (params.limit) queryParams.append("limit", params.limit.toString())
                if (params.search?.trim()) queryParams.append("search", params.search.trim())
                if (params.startDate) queryParams.append("startDate", params.startDate)
                if (params.endDate) queryParams.append("endDate", params.endDate)

                const queryString = queryParams.toString()
                return `/payments/attendees${queryString ? `?${queryString}` : ""}`
            },
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ payment }) => ({ type: "AttendeePayments" as const, id: payment._id })),
                        { type: "AttendeePayments", id: "LIST" },
                    ]
                    : [{ type: "AttendeePayments", id: "LIST" }],
        }),

        // NEW: POST refund attendee payment
        refundAttendeePayment: builder.mutation<RefundPaymentResponse, RefundPaymentRequest>({
            query: ({ transactionId }) => ({
                url: `/attendee/refund/${transactionId}`,
                method: "POST",
            }),
            invalidatesTags: [{ type: "AttendeePayments", id: "LIST" }],
        }),

        // NEW: PUT reorder speakers
        reorderSpeakers: builder.mutation<ReorderSpeakerResponse, ReorderSpeakerRequest>({
            query: (data) => ({
                url: "/speaker/reorder",
                method: "PUT",
                body: data,
            }),
            invalidatesTags: [{ type: "Speakers", id: "LIST" }],
        }),

        // NEW: PUT reorder committees
        reorderCommittees: builder.mutation<ReorderSpeakerResponse, ReorderSpeakerRequest>({
            query: (data) => ({
                url: "/committee/reorder",
                method: "PUT",
                body: data,
            }),
            invalidatesTags: [{ type: "Committees", id: "LIST" }],
        }),

        // NEW: PUT reorder speakers
        reorderSupportteams: builder.mutation<ReorderSpeakerResponse, ReorderSpeakerRequest>({
            query: (data) => ({
                url: "/supportTeam/reorder",
                method: "PUT",
                body: data,
            }),
            invalidatesTags: [{ type: "Supportteams", id: "LIST" }],
        }),

        // Get About Us content
        getAboutUsContent: builder.query<GetAboutUsContentResponse, void>({
            query: () => "/aboutUsContent",
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ _id }) => ({ type: "AboutUsContent" as const, id: _id })),
                        { type: "AboutUsContent", id: "LIST" },
                    ]
                    : [{ type: "AboutUsContent", id: "LIST" }],
        }),

        // Update About Us content
        updateAboutUsContent: builder.mutation({
            query: (data) => ({
                url: `/aboutUsContent/${data.id}`,
                method: "PUT",
                body: {
                    content: data.content,
                },
            }),
            invalidatesTags: [{ type: "AboutUsContent", id: "LIST" }],
        }),

        // GET SEO data - filter by page field
        getSEOData: builder.query<GetSEOResponse, string | void>({
            query: (page) => {
                const url = page ? `/seo?page=${encodeURIComponent(page)}` : "/seo"
                return url
            },
            providesTags: (result) =>
                result?.data
                    ? [...result.data.map(({ _id }) => ({ type: "SEO" as const, id: _id })), { type: "SEO", id: "LIST" }]
                    : [{ type: "SEO", id: "LIST" }],
        }),

        // PUT update SEO data
        updateSEOData: builder.mutation<UpdateSEOResponse, UpdateSEORequest>({
            query: ({ id, formData }) => ({
                url: `/seo/${id}`,
                method: "PUT",
                body: formData,
                formData: true,
            }),
            invalidatesTags: (_, __, { id }) => [
                { type: "SEO", id },
                { type: "SEO", id: "LIST" },
            ],
        }),

        // NEW: POST send notification
        sendNotification: builder.mutation<SendNotificationResponse, FormData>({
            query: (formData) => ({
                url: "/notification/all",
                method: "POST",
                body: formData,
            }),
            // Invalidate a 'LIST' tag if you have a page displaying all sent notifications
            invalidatesTags: [{ type: "Notification", id: "LIST" }],
        }),

        // NEW: GET notification user dropdown
        getNotificationUserDrops: builder.query<GetUserDropsResponse, { search?: string } | void>({
            query: (params) => {
                const queryParams = new URLSearchParams()
                if (params?.search?.trim()) {
                    queryParams.append("search", params.search.trim())
                }
                const queryString = queryParams.toString()
                return `/notification/drops${queryString ? `?${queryString}` : ""}`
            },
            providesTags: [{ type: "UserDrops", id: "LIST" }],
        }),

        // NEW: POST send single notification
        sendSingleNotification: builder.mutation<SendNotificationResponse, FormData>({
            query: (formData) => ({
                url: "/notification/single",
                method: "POST",
                body: formData,
            }),
            invalidatesTags: [{ type: "Notification", id: "LIST" }],
        }),

        // GET PhotoBooth records with filtering
        getPhotoBooth: builder.query<GetPhotoBoothResponse, PhotoBoothFilterParams | void>({
            query: (params: PhotoBoothFilterParams = {}) => {
                const queryParams = new URLSearchParams()
                if (params.attendeeId) queryParams.append("attendeeId", params.attendeeId)
                if (params.startDate) queryParams.append("startDate", params.startDate)
                if (params.endDate) queryParams.append("endDate", params.endDate)
                if (params.page) queryParams.append("page", params.page.toString())
                if (params.limit) queryParams.append("limit", params.limit.toString())

                const queryString = queryParams.toString()
                return `/photoBooth${queryString ? `?${queryString}` : ""}`
            },
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ _id }) => ({ type: "PhotoBooth" as const, id: _id })),
                        { type: "PhotoBooth", id: "LIST" },
                    ]
                    : [{ type: "PhotoBooth", id: "LIST" }],
        }),

        // PUT Update PhotoBooth images
        updatePhotoBooth: builder.mutation<UpdatePhotoBoothResponse, { urlToReplace: string; formData: FormData }>({
            query: ({ urlToReplace, formData }) => ({
                url: `/photoBooth/?urlToReplace=${encodeURIComponent(urlToReplace)}`,
                method: "PUT",
                body: formData,
                formData: true,
            }),
            invalidatesTags: [{ type: "PhotoBooth", id: "LIST" }],
        }),

        // DELETE PhotoBooth images
        deletePhotoBoothImages: builder.mutation<DeletePhotoBoothImagesResponse, DeletePhotoBoothImagesRequest>({
            query: (data) => ({
                url: "/photoBooth/DeleteMyImages",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [{ type: "PhotoBooth", id: "LIST" }],
        }),

        // GET Attendee dropdown for search
        getAttendeeDropdown: builder.query<GetAttendeeDropdownResponse, { search?: string } | void>({
            query: (params) => {
                const queryParams = new URLSearchParams()
                if (params?.search?.trim()) {
                    queryParams.append("search", params.search.trim())
                }
                const queryString = queryParams.toString()
                return `/attendee/drops${queryString ? `?${queryString}` : ""}`
            },
            providesTags: [{ type: "AttendeeDropdown", id: "LIST" }],
        }),



        // GET Srvice List
        // getServices: builder.query<ServiceApiResponse, void>({
        //     query: () => "/services/list",
        //     providesTags: (result) =>
        //         result?.data
        //             ? [...result.data.map(({ id }) => ({ type: "Services" as const, id })), { type: "Services", id: "LIST" }]
        //             : [{ type: "Services", id: "LIST" }],
        // }),

        // GET Srvice List for home_show=1
        // getHomeServices: builder.query<ServiceApiResponse, void>({
        //     query: () => "/services/list?home_show=1",
        //     providesTags: (result) =>
        //         result?.data
        //             ? [...result.data.map(({ id }) => ({ type: "Services" as const, id })), { type: "Services", id: "HOME_LIST" }]
        //             : [{ type: "Services", id: "HOME_LIST" }],
        // }),

        // POST api for contact form
        // submitContact: builder.mutation<Post, ContactFormData>({
        //     query: (post) => ({
        //         url: "/contact/create",
        //         method: "POST",
        //         body: post,
        //     }),
        //     invalidatesTags: [{ type: "Contact", id: "LIST" }],
        // }),
    }),
})

// Export the auto-generated hooks
export const {
    useGetPostsQuery,
    useGetPostByIdQuery,
    useCreatePostMutation,
    useUpdatePostMutation,
    useDeletePostMutation,
    useLoginUserMutation,
    useLoginUserWithPermissionsMutation,
    useGetAuthUsersQuery,
    useDeleteAuthUserMutation,
    useCreateAuthUserMutation,
    useUpdateAuthUserMutation,
    useGetRoleDropdownQuery,
    useGetAllRolePermissionsQuery,
    useCreateRolePermissionMutation,
    useUpdateRolePermissionMutation,
    useLazyGetPermissionsByRoleQuery,
    useDeleteRolePermissionMutation,
    useGetCouponsQuery,
    useCreateCouponMutation,
    useUpdateCouponMutation,
    useDeleteCouponMutation,
    useGetWelcomeContentQuery,
    useUpdateWelcomeContentMutation,
    useGetDashboardCountQuery,
    useGetHomeContentQuery,
    useUpdateHomeContentMutation,
    useGetAttendeeFormContentQuery,
    useUpdateAttendeeFormContentMutation,
    useGetAccommodationsContentQuery,
    useUpdateAccommodationsContentMutation,
    useGetResourcesContentQuery,
    useCreateResourceMutation,
    useUpdateResourceMutation,
    useDeleteResourceMutation,
    useGetQuestionContentQuery,
    useCreateQuestionContentMutation,
    useUpdateQuestionContentMutation,
    useDeleteQuestionContentMutation,
    useGetAgendasQuery,
    useCreateAgendaMutation,
    useUpdateAgendaMutation,
    useDeleteAgendaMutation,
    useGetFooterContentQuery,
    useUpdateFooterContentMutation,
    useCreateFooterContentMutation,
    useGetMainHeadingQuery,
    useUpdateMainHeadingMutation,
    useGetSpeakersQuery,
    useCreateSpeakerMutation,
    useUpdateSpeakerMutation,
    useDeleteSpeakerMutation,
    useGetCommitteesQuery,
    useCreateCommitteesMutation,
    useUpdateCommitteesMutation,
    useDeleteCommitteesMutation,
    useGetSupportteamsQuery,
    useCreateSupportteamsMutation,
    useUpdateSupportteamsMutation,
    useDeleteSupportteamsMutation,
    useGetAwardTypesQuery,
    useCreateAwardTypeMutation,
    useUpdateAwardTypeMutation,
    useDeleteAwardTypeMutation,
    useGetAwardsQuery,
    useGetAwardTypeDropdownQuery,
    useCreateAwardMutation,
    useUpdateAwardMutation,
    useDeleteAwardMutation,
    useGetSponsorsQuery,
    useUpdateSponsorMutation,
    useDeleteSponsorMutation,
    useGetSponsorsContentQuery,
    useUpdateSponsorsContentMutation,
    useGetAttendeesQuery,
    useUpdateAttendeeMutation,
    useDeleteAttendeeMutation,
    useChangePasswordMutation,
    useGetAbstractsContentQuery,
    useUpdateAbstractsContentMutation,
    useGetSponsorPaymentsQuery,
    useRefundSponsorPaymentsMutation,
    useGetAttendeePaymentsQuery,
    useRefundAttendeePaymentMutation,
    useReorderSpeakersMutation,
    useReorderCommitteesMutation,
    useReorderSupportteamsMutation,
    useGetAboutUsContentQuery,
    useUpdateAboutUsContentMutation,
    useGetSEODataQuery,
    useUpdateSEODataMutation,
    useLazyGetSEODataQuery,
    useSendNotificationMutation,
    useGetNotificationUserDropsQuery,
    useSendSingleNotificationMutation,
    useGetPhotoBoothQuery,
    useUpdatePhotoBoothMutation,
    useDeletePhotoBoothImagesMutation,
    useGetAttendeeDropdownQuery,
    useLazyGetAttendeeDropdownQuery,
    // useGetServicesQuery,
    // useGetHomeServicesQuery,
    // useSubmitContactMutation,
} = postsApiSlice
