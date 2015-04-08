# angularResourceAugments

Augments instances of $resource with an $updateModified method that calculates the changes to a model

**This works, but is not yet staged for an early release.**

### Basic Setup

First, add this module to your application:

	angular.module('myApp', ['angularResourceAugments'])


### Methods

#### resourceAugments.addModified(ResourceConstructor)

	let User = $resource('api/user/:id', {
		id: '@id'
	}, {
		update: {
			method: 'PUT'
		}
	})

	resourceAugments.addModified(User)

Use case:

	let taylor = User.get({
		id: 123
	})

	console.log(taylor.weight) // 172

	taylor.weight = 170

	taylor.$updateModified()

In this case, invoking `$updateModified` will issue:

	 PUT /api/user/123

With a request body of:

	 {
	 	weight: 170
	 }