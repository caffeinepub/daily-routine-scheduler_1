import Array "mo:core/Array";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Migration "migration";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

// Migration applies changes to persistent state declared outside actor {...} (including variables, maps, etc.)
(with migration = Migration.run)
actor {
  /// TASK TYPE
  type Task = {
    id : Nat;
    title : Text;
    time : Text;
    daysOfWeek : [Nat];
    notes : Text;
    createdAt : Int;
  };

  /// COMPLETION TYPE
  type DailyCompletion = {
    taskId : Nat;
    date : Text;
    completedAt : Int;
  };

  /// USER PROFILE TYPE
  public type UserProfile = {
    name : Text;
  };

  // TASK ORDERING BY TIME
  module TaskByTimeOrdering {
    public func compare(t1 : Task, t2 : Task) : Order.Order {
      Text.compare(t1.time, t2.time);
    };
  };

  // AUTHORIZATION
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var nextTaskId = 1;

  // TASK STORAGE
  let userTasks = Map.empty<Principal, Map.Map<Nat, Task>>();
  let userCompletions = Map.empty<Principal, Map.Map<Text, Map.Map<Nat, DailyCompletion>>>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  /// GET CALLER USER PROFILE
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  /// GET USER PROFILE
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  /// SAVE CALLER USER PROFILE
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  /// ADD TASK
  public shared ({ caller }) func addTask(title : Text, time : Text, daysOfWeek : [Nat], notes : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add tasks");
    };

    let task : Task = {
      id = nextTaskId;
      title;
      time;
      daysOfWeek;
      notes;
      createdAt = Time.now();
    };

    let userTaskMap = switch (userTasks.get(caller)) {
      case (null) { Map.empty<Nat, Task>() };
      case (?map) { map };
    };

    userTaskMap.add(nextTaskId, task);
    userTasks.add(caller, userTaskMap);
    nextTaskId += 1;
    task.id;
  };

  /// UPDATE TASK
  public shared ({ caller }) func updateTask(id : Nat, title : Text, time : Text, daysOfWeek : [Nat], notes : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update tasks");
    };

    switch (userTasks.get(caller)) {
      case (null) { false };
      case (?userTaskMap) {
        switch (userTaskMap.get(id)) {
          case (null) { false };
          case (?existingTask) {
            let updatedTask : Task = {
              id;
              title;
              time;
              daysOfWeek;
              notes;
              createdAt = existingTask.createdAt;
            };
            userTaskMap.add(id, updatedTask);
            true;
          };
        };
      };
    };
  };

  /// DELETE TASK
  public shared ({ caller }) func deleteTask(id : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete tasks");
    };

    switch (userTasks.get(caller)) {
      case (null) { false };
      case (?userTaskMap) {
        if (userTaskMap.containsKey(id)) {
          userTaskMap.remove(id);
          true;
        } else { false };
      };
    };
  };

  /// GET TASKS (SORTED BY TIME)
  public query ({ caller }) func getTasks() : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };

    switch (userTasks.get(caller)) {
      case (null) { [] };
      case (?userTaskMap) {
        let taskArray = userTaskMap.values().toArray();
        taskArray.sort();
      };
    };
  };

  /// MARK TASK DONE
  public shared ({ caller }) func markTaskDone(taskId : Nat, date : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark tasks");
    };

    let completion : DailyCompletion = {
      taskId;
      date;
      completedAt = Time.now();
    };

    let dateCompletions = switch (userCompletions.get(caller)) {
      case (null) { Map.empty<Text, Map.Map<Nat, DailyCompletion>>() };
      case (?map) { map };
    };

    let taskCompletions = switch (dateCompletions.get(date)) {
      case (null) { Map.empty<Nat, DailyCompletion>() };
      case (?map) { map };
    };

    taskCompletions.add(taskId, completion);
    dateCompletions.add(date, taskCompletions);
    userCompletions.add(caller, dateCompletions);
    true;
  };

  /// UNMARK TASK DONE
  public shared ({ caller }) func unmarkTaskDone(taskId : Nat, date : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unmark tasks");
    };

    switch (userCompletions.get(caller)) {
      case (null) { false };
      case (?dateCompletions) {
        switch (dateCompletions.get(date)) {
          case (null) { false };
          case (?taskCompletions) {
            if (taskCompletions.containsKey(taskId)) {
              taskCompletions.remove(taskId);
              true;
            } else { false };
          };
        };
      };
    };
  };

  /// GET COMPLETIONS FOR DATE
  public query ({ caller }) func getCompletionsForDate(date : Text) : async [DailyCompletion] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view completions");
    };

    switch (userCompletions.get(caller)) {
      case (null) { [] };
      case (?dateCompletions) {
        switch (dateCompletions.get(date)) {
          case (null) { [] };
          case (?taskCompletions) { taskCompletions.values().toArray() };
        };
      };
    };
  };

  /// GET ALL USERS SUMMARY (ADMIN ONLY)
  public query ({ caller }) func getAllUsersSummary() : async [{ userPrincipal : Text; taskCount : Nat }] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can get users summary");
    };

    let summary = userTasks.toArray().map(
      func((user, tasks)) {
        {
          userPrincipal = user.toText();
          taskCount = tasks.size();
        };
      }
    );

    summary;
  };
};
