var jest = require('jest');

jest.dontMock('../../constants/userConstants');
jest.dontMock('../userStore');
jest.dontMock('object-assign');

describe('UserStore', function() {
	var AuthConstants = require('../../constants/UserConstants');
  	var AppDispatcher;
  	var NotificationStore;
  	var callback;

  	var actionUserMeSucc = {
		actionType: UserConstants.USER_ME_SUCC,
	    user: {
		  username: 'test',
		  caloriesTarget: 445,
		  privilege: 0,
		  calories: 
		   [ { description: 'test',
		       calories: 123,
		       timestamp: 1440338719259,
		       _id: 55d9d31f4192f83318b983b4 },
		     { description: 'Wendys',
		       calories: 200,
		       timestamp: 1440373668219,
		       _id: 55da5ba4949e366c1a9855a4 },
		     { description: 'lala',
		       calories: 123,
		       timestamp: 1440374583717,
		       _id: 55da5f37949e366c1a9855a5 } ] 
		}

	};
	  
	var actionUserMeFail = {
	    actionType: UserConstants.USER_ME_FAIL,
	    message: "User not logued in"
	};

	var actionUserCaloriesAdd = {
		actionType: UserConstants.USER_CALORIES_ADD_SUCC,
		user: {
		  username: 'test',
		  caloriesTarget: 445,
		  privilege: 0,
		  calories: 
		   [ { description: 'test',
		       calories: 123,
		       timestamp: 1440338719259,
		       _id: 55d9d31f4192f83318b983b4 },
		     { description: 'Wendys',
		       calories: 200,
		       timestamp: 1440373668219,
		       _id: 55da5ba4949e366c1a9855a4 },
		     { description: 'lala',
		       calories: 123,
		       timestamp: 1440374583717,
		       _id: 55da5f37949e366c1a9855a5 } ] 
		}
	}
}
