jest.dontMock('../../constants/userConstants');
jest.dontMock('../userStore');
jest.dontMock('object-assign');

describe('UserStore', function() {
	var UserConstants = require('../../constants/UserConstants');
  	var AppDispatcher;
  	var NotificationStore;
  	var callback;

  	var actionUserMeSucc = {
		actionType: UserConstants.USER_ME_SUCC,
	    user: {
		  username: 'test',
		  caloriesTarget: 1000,
		  privilege: 0,
		  calories: 
		   [ { description: 'Burget Joint',
		       calories: 100,
		       timestamp: new Date(),
		       _id: '55d9d31f4192f83318b983b4' },
		     { description: 'Wendys',
		       calories: 200,
		       timestamp: 1440373668219,
		       _id: '55da5ba4949e366c1a9855a4' },
		     { description: 'Green Curry',
		       calories: 1000,
		       timestamp: new Date(),
		       _id: '55da5f37949e366c1a9855a5' } ] 
		}
	};

	var actionUserCaloriesAdd = {
		actionType: UserConstants.USER_CALORIES_ADD_SUCC,
		calorie: { description: 'test',
		       calories: 150,
		       timestamp: new Date(),
		       _id: '55d9d31f4192f83318b983b5' 
		}
	};

	var actionUserCaloriesRemove = {
		actionType: UserConstants.USER_CALORIES_REM_SUCC,
		id: '55da5f37949e366c1a9855a5'
	};

	var actionUserCaloriesEdit = {
		actionType: UserConstants.USER_CALORIES_UPD_SUCC,
		calorie: { description: 'UpdatedValue',
		       calories: 2000,
		       _id: '55d9d31f4192f83318b983b4' 
		}
	};

	var actionUserDelete = {
		actionType: UserConstants.USER_DELETE_SUCC
	};

	var actionCalorieTargetEdit = {
		actionType: UserConstants.USER_TARGETCAL_UPD_SUCC,
  		target: 2000
	};

	var actionUserGet = {
 		actionType: UserConstants.USER_GET_SUCC,
 		user: {
		  username: 'test2',
		  caloriesTarget: 500,
		  privilege: 0,
		  calories: 
		   [ { description: 'Le Ble',
		       calories: 100,
		       timestamp: 1440338719259,
		       _id: '55d9d31f4192f83318b983b4' },
		     { description: 'Pizza Hut',
		       calories: 200,
		       timestamp: 1440373668219,
		       _id: '55da5ba4949e366c1a9855a4' },
		       { description: 'Green Curry',
		       calories: 1000,
		       timestamp: new Date(),
		       _id: '55da5f37949e366c1a9855a5' } 
		     ] 
		}
	};

	var actionUserPrivilegeEscalate = {
		actionType: UserConstants.USER_ESCALATE_SUCC
	};

	var actionUserPrivilegeDowngrade = {
		actionType: UserConstants.USER_DOWNGRADE_SUCC
	};

	beforeEach(function() {
	    AppDispatcher = require('../../dispacher/dispacher');
	    UserStore = require('../userStore');
	    callback = AppDispatcher.register.mock.calls[0][0];
	});

	it('should initialize without loggued user', function(){
		var isLoggued = UserStore.getCurrentStatus();
		var currentUser = UserStore.getUser();
		var logguedUser = UserStore.getLogguedUser();
		expect(isLoggued).toBe(false);
		expect(currentUser).toEqual({});
		expect(logguedUser).toEqual({});

	});

	it('should log in user', function(){
		callback(actionUserMeSucc);
		var isLoggued = UserStore.getCurrentStatus();
		var currentUser = UserStore.getUser();
		var logguedUser = UserStore.getLogguedUser();
		expect(isLoggued).toBe(true);
		expect(currentUser).toEqual(logguedUser);
	});

	it('should add new calorie entry and update calories count', function(){
		callback(actionUserMeSucc);
		var user = UserStore.getUser()
		var caloriesSum = UserStore.getTodayCalorieSum();
		var caloriesCount = user.calories.length;
		callback(actionUserCaloriesAdd);
		expect(user.calories.length).toBe(caloriesCount + 1);
		expect(UserStore.getTodayCalorieSum()).toBe(caloriesSum + 150);
	});

	it('should edit a calorie entry', function(){
		callback(actionUserMeSucc);
		var user = UserStore.getUser();
		var caloriesSum = UserStore.getTodayCalorieSum();
		var caloriesCount = user.calories.length;
		callback(actionUserCaloriesEdit);
		expect(user.calories.length).toBe(caloriesCount);
		var elem = user.calories.find(function(elem,index,arr){ 
			if(elem._id == actionUserCaloriesEdit.calorie._id){
				return true
			}
			return false
		});
		expect(elem.calories).toBe(actionUserCaloriesEdit.calorie.calories);
		expect(elem.description).toBe(actionUserCaloriesEdit.calorie.description);
	});

	it('should remove a calorie entry and update calories count', function(){
		callback(actionUserMeSucc);
		var user = UserStore.getUser()
		var caloriesSum = UserStore.getTodayCalorieSum();
		var caloriesCount = user.calories.length;
		callback(actionUserCaloriesRemove);
		expect(user.calories.length).toBe(caloriesCount - 1);
		expect(UserStore.getTodayCalorieSum()).toBe(caloriesSum - 1000);
	});

	it('should delete and log out user', function(){
		callback(actionUserMeSucc);
		callback(actionUserDelete);
		var isLoggued = UserStore.getCurrentStatus();
		var currentUser = UserStore.getUser();
		var logguedUser = UserStore.getLogguedUser();
		expect(isLoggued).toBe(false);
		expect(currentUser).toEqual({});
		expect(logguedUser).toEqual({});
	});

	it('should update user calorie target', function(){
		callback(actionUserMeSucc);
		callback(actionCalorieTargetEdit);
		var currentUser = UserStore.getUser();
		expect(currentUser.caloriesTarget).toBe(actionCalorieTargetEdit.target);
	});

	it('should escalate privilege', function(){
		callback(actionUserMeSucc);
		callback(actionUserPrivilegeEscalate);
		expect(UserStore.getLogguedUser().privilege).toBe(1);
	});

	it('should downgrade privilege', function(){
		callback(actionUserMeSucc);
		var currentPrivilege = UserStore.getLogguedUser().privilege;
		callback(actionUserPrivilegeEscalate);
		expect(UserStore.getLogguedUser().privilege).toBe(currentPrivilege + 1);
		callback(actionUserPrivilegeDowngrade);
		expect(UserStore.getLogguedUser().privilege).toBe(currentPrivilege);
	});

	it('should get new user', function(){
		callback(actionUserMeSucc);
		callback(actionUserGet);
		var currentUser = UserStore.getUser();
		var logguedUser = UserStore.getLogguedUser();
		expect(currentUser).not.toBe(logguedUser);
	});

	it('should get new user and add a new calorie entry', function(){
		callback(actionUserMeSucc);
		callback(actionUserGet);
		var user = UserStore.getUser()
		var caloriesSum = UserStore.getTodayCalorieSum();
		var caloriesCount = user.calories.length;
		callback(actionUserCaloriesAdd);
		expect(user.calories.length).toBe(caloriesCount + 1);
		expect(UserStore.getTodayCalorieSum()).toBe(caloriesSum + 150);
	});

	it('should get a new user, remove a calorie entry and update calories count', function(){
		callback(actionUserMeSucc);
		callback(actionUserGet);
		var user = UserStore.getUser()
		var caloriesSum = UserStore.getTodayCalorieSum();
		var caloriesCount = user.calories.length;
		callback(actionUserCaloriesRemove);
		expect(user.calories.length).toBe(caloriesCount - 1);
		expect(UserStore.getTodayCalorieSum()).toBe(caloriesSum - 1000);
	});

	it('should get a new user, delete it and return to loggued user', function(){
		callback(actionUserMeSucc);
		callback(actionUserGet);
		callback(actionUserDelete);
		var isLoggued = UserStore.getCurrentStatus();
		var currentUser = UserStore.getUser();
		var logguedUser = UserStore.getLogguedUser();
		expect(isLoggued).toBe(true);
		expect(currentUser).toEqual(logguedUser);
	});

	it('should log out user after deleting loggued user', function(){
		callback(actionUserMeSucc);
		callback(actionUserDelete);
		var isLoggued = UserStore.getCurrentStatus();
		var currentUser = UserStore.getUser();
		var logguedUser = UserStore.getLogguedUser();
		expect(isLoggued).toBe(false);
		expect(currentUser).toEqual({});
		expect(logguedUser).toEqual({});
	});
});
