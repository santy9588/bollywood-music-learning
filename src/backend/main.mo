import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import OutCall "http-outcalls/outcall";
import Stripe "stripe/stripe";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";


actor {
  // Types
  public type CourseCategory = {
    #vocals;
    #instruments;
    #dance;
    #theory;
  };

  public type Course = {
    id : Text;
    title : Text;
    description : Text;
    instructorName : Text;
    priceCents : Nat;
    category : CourseCategory;
    thumbnailUrl : Text;
    lessonIds : [Text];
    createdTimestamp : Int;
  };

  module Course {
    public func compare(c1 : Course, c2 : Course) : Order.Order {
      Text.compare(c1.id, c2.id);
    };
  };

  public type Lesson = {
    id : Text;
    courseId : Text;
    title : Text;
    description : Text;
    contentUrl : Text;
    durationMinutes : Nat;
    orderIndex : Nat;
  };

  module Lesson {
    public func compare(l1 : Lesson, l2 : Lesson) : Order.Order {
      Text.compare(l1.id, l2.id);
    };
  };

  public type PaymentStatus = { #pending; #completed };

  public type Enrollment = {
    userId : Principal;
    courseId : Text;
    paymentStatus : PaymentStatus;
    enrolledAt : Int;
    stripePaymentIntentId : Text;
  };

  public type Progress = {
    userId : Principal;
    courseId : Text;
    completedLessonIds : [Text];
    lastAccessed : Int;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    bio : Text;
    role : Text; // "student" or "admin"
  };

  // Storage
  let courses = Map.empty<Text, Course>();
  let lessons = Map.empty<Text, Lesson>();
  let enrollments = Map.empty<Principal, Map.Map<Text, Enrollment>>();
  let progress = Map.empty<Principal, Map.Map<Text, Progress>>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let paymentSessions = Map.empty<Text, Principal>(); // sessionId -> userId mapping

  // Auth
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Helper function to check if user is enrolled in a course
  func isUserEnrolledInCourse(userId : Principal, courseId : Text) : Bool {
    switch (enrollments.get(userId)) {
      case (?userEnrollments) {
        switch (userEnrollments.get(courseId)) {
          case (?enrollment) { enrollment.paymentStatus == #completed };
          case (null) { false };
        };
      };
      case (null) { false };
    };
  };

  // Courses
  public shared ({ caller }) func createOrUpdateCourse(course : Course) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create or update courses");
    };
    courses.add(course.id, course);
  };

  public query ({ caller }) func getCourse(courseId : Text) : async ?Course {
    courses.get(courseId);
  };

  public query ({ caller }) func getAllCourses() : async [Course] {
    courses.values().toArray().sort();
  };

  public shared ({ caller }) func deleteCourse(courseId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete courses");
    };
    courses.remove(courseId);
  };

  // Lessons
  public shared ({ caller }) func createOrUpdateLesson(lesson : Lesson) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create or update lessons");
    };
    lessons.add(lesson.id, lesson);
  };

  public query ({ caller }) func getLesson(lessonId : Text) : async ?Lesson {
    let lesson = switch (lessons.get(lessonId)) {
      case (?l) { l };
      case (null) { return null };
    };

    // Allow admins or enrolled users to view lessons
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return ?lesson;
    };

    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only enrolled users can view lessons");
    };

    if (isUserEnrolledInCourse(caller, lesson.courseId)) {
      return ?lesson;
    };

    Runtime.trap("Unauthorized: Must be enrolled in the course to view lessons");
  };

  public query ({ caller }) func getLessonsForCourse(courseId : Text) : async [Lesson] {
    // Allow admins or enrolled users to view lessons
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
        Runtime.trap("Unauthorized: Only enrolled users can view lessons");
      };

      if (not isUserEnrolledInCourse(caller, courseId)) {
        Runtime.trap("Unauthorized: Must be enrolled in the course to view lessons");
      };
    };

    lessons.values().toArray().filter(
      func(l) { l.courseId == courseId }
    );
  };

  // Enrollments
  public shared ({ caller }) func enrollUserInCourse(courseId : Text, paymentIntentId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can enroll in courses");
    };

    let userEnrollments = switch (enrollments.get(caller)) {
      case (?e) { e };
      case (null) {
        let newMap = Map.empty<Text, Enrollment>();
        enrollments.add(caller, newMap);
        newMap;
      };
    };

    if (userEnrollments.containsKey(courseId)) {
      Runtime.trap("Already enrolled in this course");
    };

    let enrollment : Enrollment = {
      userId = caller;
      courseId;
      paymentStatus = #completed;
      enrolledAt = Time.now();
      stripePaymentIntentId = paymentIntentId;
    };

    userEnrollments.add(courseId, enrollment);
  };

  public query ({ caller }) func getEnrollmentsForUser(userId : Principal) : async [Enrollment] {
    // Users can only view their own enrollments, admins can view any
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own enrollments");
    };

    switch (enrollments.get(userId)) {
      case (?userEnrollments) { userEnrollments.values().toArray() };
      case (null) { [] };
    };
  };

  public query ({ caller }) func getAllEnrollments() : async [Enrollment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all enrollments");
    };

    let all = List.empty<Enrollment>();
    for ((userId, userEnrollments) in enrollments.entries()) {
      let userEnrollmentsArray = userEnrollments.values().toArray();
      all.addAll(userEnrollmentsArray.values());
    };
    all.toArray();
  };

  // Progress Tracking
  public shared ({ caller }) func updateLessonProgress(courseId : Text, lessonId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update lesson progress");
    };

    // Verify user is enrolled in the course
    if (not isUserEnrolledInCourse(caller, courseId)) {
      Runtime.trap("Unauthorized: Must be enrolled in the course to update progress");
    };

    let userProgress = switch (progress.get(caller)) {
      case (?p) { p };
      case (null) {
        let newMap = Map.empty<Text, Progress>();
        progress.add(caller, newMap);
        newMap;
      };
    };

    switch (userProgress.get(courseId)) {
      case (?p) {
        let completed = List.fromArray(p.completedLessonIds);
        if (not completed.contains(lessonId)) {
          completed.add(lessonId);
          userProgress.add(
            courseId,
            {
              userId = caller;
              courseId;
              completedLessonIds = completed.toArray();
              lastAccessed = Time.now();
            },
          );
        };
      };
      case (null) {
        userProgress.add(
          courseId,
          {
            userId = caller;
            courseId;
            completedLessonIds = [lessonId];
            lastAccessed = Time.now();
          },
        );
      };
    };
  };

  public query ({ caller }) func getCourseProgressForUser(userId : Principal, courseId : Text) : async ?Progress {
    // Users can only view their own progress, admins can view any
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own progress");
    };

    switch (progress.get(userId)) {
      case (?userProgress) { userProgress.get(courseId) };
      case (null) { null };
    };
  };

  // AI Recommendations (simple same category logic)
  public query ({ caller }) func getCourseRecommendations() : async [Course] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get recommendations");
    };

    let myEnrollments = switch (enrollments.get(caller)) {
      case (?e) { e };
      case (null) { return [] };
    };

    if (myEnrollments.isEmpty()) {
      return [];
    };

    let courseIds = myEnrollments.values().toArray().map(func(e) { e.courseId });
    let categories = courseIds.map(
      func(cid) {
        switch (courses.get(cid)) {
          case (?course) { ?course.category };
          case (null) { null };
        };
      }
    );

    let filtered = courses.values().toArray().filter(
      func(c) {
        let sameCategory = categories.any(
          func(cat) { switch (cat) { case (?cat) { cat == c.category }; case (null) { false } } }
        );
        let notEnrolled = not courseIds.any(func(cid) { cid == c.id });
        sameCategory and notEnrolled;
      }
    );

    let takeFirst = func(array : [Course], count : Nat) : [Course] {
      let size = Nat.min(count, array.size());
      array.sliceToArray(0, size);
    };

    takeFirst(filtered, 5);
  };

  // Stripe integration (simplified setup)
  var stripeConfig : ?Stripe.StripeConfiguration = null;

  public query ({ caller }) func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can configure Stripe");
    };
    stripeConfig := ?config;
  };

  func getStripeConfig() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (?config) { config };
      case (null) {
        Runtime.trap("Stripe needs to be first configured");
      };
    };
  };

  // Create Stripe payment session for a course
  public shared ({ caller }) func createCoursePaymentSession(courseId : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create payment sessions");
    };

    let course = switch (courses.get(courseId)) {
      case (?c) { c };
      case (null) { Runtime.trap("Course not found") };
    };

    let item : Stripe.ShoppingItem = {
      currency = "usd";
      productName = course.title;
      productDescription = course.description;
      priceInCents = course.priceCents;
      quantity = 1;
    };

    let successUrl = "https://www.subratadash.com/success";
    let cancelUrl = "https://www.subratadash.com/cancel";

    let sessionId = await Stripe.createCheckoutSession(getStripeConfig(), caller, [item], successUrl, cancelUrl, transform);

    // Store session ownership for later verification
    paymentSessions.add(sessionId, caller);

    sessionId;
  };

  // Check course payment status via Stripe session id
  public shared ({ caller }) func checkCoursePaymentStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    // Verify the caller owns this payment session or is an admin
    switch (paymentSessions.get(sessionId)) {
      case (?owner) {
        if (caller != owner and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only check your own payment sessions");
        };
      };
      case (null) {
        Runtime.trap("Payment session not found");
      };
    };

    await Stripe.getSessionStatus(getStripeConfig(), sessionId, transform);
  };

  // Add missing Stripe integration functions for compilation
  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfig(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfig(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };
};
