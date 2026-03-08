import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";

module {
  // Types from the previous program version
  type OldQuestion = {
    id : Nat;
    question : Text;
    answer : Text;
    timestamp : Int;
  };
  type OldActor = {
    var nextId : Nat;
    questions : Map.Map<Nat, OldQuestion>;
  };

  // Types from the new program version
  type Task = {
    id : Nat;
    title : Text;
    time : Text;
    daysOfWeek : [Nat];
    notes : Text;
    createdAt : Int;
  };
  type DailyCompletion = {
    taskId : Nat;
    date : Text;
    completedAt : Int;
  };
  type UserProfile = {
    name : Text;
  };
  type NewActor = {
    var nextTaskId : Nat;
    userTasks : Map.Map<Principal, Map.Map<Nat, Task>>;
    userCompletions : Map.Map<Principal, Map.Map<Text, Map.Map<Nat, DailyCompletion>>>;
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  public func run(_old : OldActor) : NewActor {
    {
      var nextTaskId = 1;
      userTasks = Map.empty<Principal, Map.Map<Nat, Task>>();
      userCompletions = Map.empty<Principal, Map.Map<Text, Map.Map<Nat, DailyCompletion>>>();
      userProfiles = Map.empty<Principal, UserProfile>();
    };
  };
};
