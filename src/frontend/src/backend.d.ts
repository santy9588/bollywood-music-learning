import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface Enrollment {
    paymentStatus: PaymentStatus;
    userId: Principal;
    enrolledAt: bigint;
    stripePaymentIntentId: string;
    courseId: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface Course {
    id: string;
    title: string;
    thumbnailUrl: string;
    description: string;
    lessonIds: Array<string>;
    createdTimestamp: bigint;
    category: CourseCategory;
    priceCents: bigint;
    instructorName: string;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface Lesson {
    id: string;
    title: string;
    contentUrl: string;
    description: string;
    durationMinutes: bigint;
    courseId: string;
    orderIndex: bigint;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Progress {
    lastAccessed: bigint;
    userId: Principal;
    completedLessonIds: Array<string>;
    courseId: string;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface UserProfile {
    bio: string;
    name: string;
    role: string;
    email: string;
}
export enum CourseCategory {
    vocals = "vocals",
    instruments = "instruments",
    theory = "theory",
    dance = "dance"
}
export enum PaymentStatus {
    pending = "pending",
    completed = "completed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    checkCoursePaymentStatus(sessionId: string): Promise<StripeSessionStatus>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createCoursePaymentSession(courseId: string): Promise<string>;
    createOrUpdateCourse(course: Course): Promise<void>;
    createOrUpdateLesson(lesson: Lesson): Promise<void>;
    deleteCourse(courseId: string): Promise<void>;
    enrollUserInCourse(courseId: string, paymentIntentId: string): Promise<void>;
    getAllCourses(): Promise<Array<Course>>;
    getAllEnrollments(): Promise<Array<Enrollment>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCourse(courseId: string): Promise<Course | null>;
    getCourseProgressForUser(userId: Principal, courseId: string): Promise<Progress | null>;
    getCourseRecommendations(): Promise<Array<Course>>;
    getEnrollmentsForUser(userId: Principal): Promise<Array<Enrollment>>;
    getLesson(lessonId: string): Promise<Lesson | null>;
    getLessonsForCourse(courseId: string): Promise<Array<Lesson>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateLessonProgress(courseId: string, lessonId: string): Promise<void>;
}
