/**
 * Attaches a KinematicCharacterController class on the global "p2" object.
 * Original code from: https://github.com/SebLague/2DPlatformer-Tutorial
 */
(function(p2){

	// exports
	p2.KinematicCharacterController = KinematicCharacterController;

	// imports
	var vec2 = p2.vec2;
	var Ray = p2.Ray;
	var RaycastResult = p2.RaycastResult;
	var AABB = p2.AABB;
	var EventEmitter = p2.EventEmitter;

	// constants
	var ZERO = vec2.create();
	var UNIT_Y = vec2.fromValues(0,1);

	// math helpers
	function sign(x){
		return x >= 0 ? 1 : -1;
	}
	function lerp(factor, start, end){
		return start + (end - start) * factor;
	}
	function clamp(value, min, max){
		return Math.min(max, Math.max(min, value));
	}
	function angle(a, b){
		return Math.acos(vec2.dot(a, b));
	}
	function expandAABB(aabb, amount){
		var halfAmount = amount * 0.5;
		aabb.lowerBound[0] -= halfAmount;
		aabb.lowerBound[1] -= halfAmount;
		aabb.upperBound[0] += halfAmount;
		aabb.upperBound[1] += halfAmount;
	}

	/**
	 * @class RaycastController
	 * @constructor
	 * @param {object} [options]
	 * @param {number} [options.collisionMask=-1]
	 * @param {number} [options.skinWidth=0.015]
	 * @param {number} [options.horizontalRayCount=4]
	 * @param {number} [options.verticalRayCount=4]
	 */
	function RaycastController(options) {
		options = options || {};
		EventEmitter.apply(this, arguments);

		this.world = options.world;
		this.body = options.body;

		/**
		 * @property {number} collisionMask
		 */
		this.collisionMask = options.collisionMask !== undefined ? options.collisionMask : -1;

		/**
		 * @property {number} skinWidth
		 */
		this.skinWidth = options.skinWidth !== undefined ? options.skinWidth : 0.015;

		/**
		 * @property {number} horizontalRayCount
		 */
		this.horizontalRayCount = options.horizontalRayCount !== undefined ? options.horizontalRayCount : 4;

		/**
		 * @property {number} verticalRayCount
		 */
		this.verticalRayCount = options.verticalRayCount !== undefined ? options.verticalRayCount : 4;

		this.horizontalRaySpacing = null;
		this.verticalRaySpacing = null;

		this.raycastOrigins = {
			topLeft: vec2.create(),
			topRight: vec2.create(),
			bottomLeft: vec2.create(),
			bottomRight: vec2.create()
		};

		this.calculateRaySpacing();
	}
	RaycastController.prototype = Object.create(EventEmitter.prototype);
	RaycastController.prototype.constructor = RaycastController;

	RaycastController.prototype.updateRaycastOrigins = (function() {
		var bounds = new AABB();
		return function(){
			this.body.aabbNeedsUpdate = true;
			this.calculateRaySpacing();
			bounds.copy(this.body.getAABB());

			expandAABB(bounds, this.skinWidth * -2);

			var raycastOrigins = this.raycastOrigins;

			vec2.copy(raycastOrigins.bottomLeft, bounds.lowerBound);
			vec2.set(raycastOrigins.bottomRight, bounds.upperBound[0], bounds.lowerBound[1]);
			vec2.set(raycastOrigins.topLeft, bounds.lowerBound[0], bounds.upperBound[1]);
			vec2.copy(raycastOrigins.topRight, bounds.upperBound);
		};
	})();

	RaycastController.prototype.calculateRaySpacing = (function() {
		var bounds = new AABB();
		return function(){
			this.body.aabbNeedsUpdate = true;
			bounds.copy(this.body.getAABB());
			expandAABB(bounds, this.skinWidth * -2);

			this.horizontalRayCount = clamp(this.horizontalRayCount, 2, Number.MAX_SAFE_INTEGER);
			this.verticalRayCount = clamp(this.verticalRayCount, 2, Number.MAX_SAFE_INTEGER);

			var sizeX = (bounds.upperBound[0] - bounds.lowerBound[0]);
			var sizeY = (bounds.upperBound[1] - bounds.lowerBound[1]);
			this.horizontalRaySpacing = sizeY / (this.horizontalRayCount - 1);
			this.verticalRaySpacing = sizeX / (this.verticalRayCount - 1);
		};
	})();

	/**
	 * @class Controller
	 * @extends {RaycastController}
	 * @constructor
	 * @param {object} [options]
	 * @param {number} [options.maxClimbAngle]
	 * @param {number} [options.maxDescendAngle]
	 */
	function Controller(options) {
		RaycastController.apply(this, arguments);

		var DEG_TO_RAD = Math.PI / 180;

		/**
		 * @property {number} maxClimbAngle
		 */
		this.maxClimbAngle = options.maxClimbAngle !== undefined ? options.maxClimbAngle : 80 * DEG_TO_RAD;

		/**
		 * @property {number} maxDescendAngle
		 */
		this.maxDescendAngle = options.maxDescendAngle !== undefined ? options.maxDescendAngle : 80 * DEG_TO_RAD;

		this.collisions = {
			above: false,
			below: false,
			left: false,
			right: false,
			climbingSlope: false,
			descendingSlope: false,
			slopeAngle: 0,
			slopeAngleOld: 0,
			velocityOld: vec2.create(),
			faceDir: 1,
			fallingThroughPlatform: false
		};

		this.ray = new Ray({
			mode: Ray.CLOSEST
		});
		this.raycastResult = new RaycastResult();
	}

	Controller.prototype = Object.create(RaycastController.prototype);
	Controller.prototype.constructor = Controller;

	Controller.prototype.resetCollisions = function(velocity) {
		var collisions = this.collisions;

		collisions.above = collisions.below = false;
		collisions.left = collisions.right = false;
		collisions.climbingSlope = false;
		collisions.descendingSlope = false;
		collisions.slopeAngleOld = collisions.slopeAngle;
		collisions.slopeAngle = 0;
		vec2.copy(collisions.velocityOld, velocity);
	};

	Controller.prototype.moveWithZeroInput = function(velocity, standingOnPlatform) {
		return this.move(velocity, ZERO, standingOnPlatform);
	};

	Controller.prototype.move = function(velocity, input, standingOnPlatform) {
		var collisions = this.collisions;

		this.updateRaycastOrigins();
		this.resetCollisions(velocity);

		if (velocity[0] !== 0) {
			collisions.faceDir = sign(velocity[0]);
		}

		if (velocity[1] < 0) {
			this.descendSlope(velocity);
		}

		this.horizontalCollisions(velocity);
		if (velocity[1] !== 0) {
			this.verticalCollisions(velocity, input);
		}

		vec2.add(this.body.position, this.body.position, velocity);

		if (standingOnPlatform) {
			collisions.below = true;
		}
	};

	Controller.prototype.emitRayCastEvent = (function(){
		var raycastEvent = {
			type: 'raycast',
			ray: null
		};
		return function() {
			raycastEvent.ray = this.ray;
			this.emit(raycastEvent);
		};
	})();

	Controller.prototype.horizontalCollisions = function(velocity) {
		var collisions = this.collisions;
		var maxClimbAngle = this.maxClimbAngle;
		var directionX = collisions.faceDir;
		var skinWidth = this.skinWidth;
		var rayLength = Math.abs(velocity[0]) + skinWidth;
		var raycastOrigins = this.raycastOrigins;

		// if (Math.abs(velocity[0]) < skinWidth) {
		// rayLength = 2 * skinWidth;
		// }

		for (var i = 0; i < this.horizontalRayCount; i ++) {
			var ray = this.ray;
			ray.collisionMask = this.collisionMask;
			vec2.copy(ray.from, (directionX === -1) ? raycastOrigins.bottomLeft : raycastOrigins.bottomRight);
			ray.from[1] += this.horizontalRaySpacing * i;
			vec2.set(ray.to, ray.from[0] + directionX * rayLength, ray.from[1]);
			ray.update();
			this.world.raycast(this.raycastResult, ray);
			this.emitRayCastEvent();

			if (this.raycastResult.body) {
				var distance = this.raycastResult.getHitDistance(ray);
				if (distance === 0) {
					continue;
				}

				var slopeAngle = angle(this.raycastResult.normal, UNIT_Y);

				if (i === 0 && slopeAngle <= maxClimbAngle) {
					if (collisions.descendingSlope) {
						collisions.descendingSlope = false;
						vec2.copy(velocity, collisions.velocityOld);
					}
					var distanceToSlopeStart = 0;
					if (slopeAngle !== collisions.slopeAngleOld) {
						distanceToSlopeStart = distance - skinWidth;
						velocity[0] -= distanceToSlopeStart * directionX;
					}
					this.climbSlope(velocity, slopeAngle);
					velocity[0] += distanceToSlopeStart * directionX;
				}

				if (!collisions.climbingSlope || slopeAngle > maxClimbAngle) {
					velocity[0] = (distance - skinWidth) * directionX;
					rayLength = distance;

					if (collisions.climbingSlope) {
						velocity[1] = Math.tan(collisions.slopeAngle) * Math.abs(velocity[0]);
					}

					collisions.left = directionX === -1;
					collisions.right = directionX === 1;
				}
			}

			this.raycastResult.reset();
		}
	};

	Controller.prototype.verticalCollisions = function(velocity, input) {
		var collisions = this.collisions;
		var skinWidth = this.skinWidth;
		var raycastOrigins = this.raycastOrigins;
		var directionY = sign(velocity[1]);
		var rayLength = Math.abs(velocity[1]) + skinWidth;
		var ray = this.ray;

		for (var i = 0; i < this.verticalRayCount; i ++) {
			ray.collisionMask = this.collisionMask;
			vec2.copy(ray.from, (directionY === -1) ? raycastOrigins.bottomLeft : raycastOrigins.topLeft);
			ray.from[0] += this.verticalRaySpacing * i + velocity[0];
			vec2.set(ray.to, ray.from[0], ray.from[1] + directionY * rayLength);
			ray.update();
			this.world.raycast(this.raycastResult, ray);
			this.emitRayCastEvent();

			if (this.raycastResult.body) {
				// TODO: fall through platform
				/*
				if (hit.collider.tag === "Through") {
					if (directionY === 1 || hit.distance === 0) {
						continue;
					}
					if (collisions.fallingThroughPlatform) {
						continue;
					}
					if (input[1] == -1) {
						collisions.fallingThroughPlatform = true;
						var that = this;
						setTimeout(function(){
							that.resetFallingThroughPlatform();
						}, 0.5 * 1000);
						continue;
					}
				}
				*/

				var distance = this.raycastResult.getHitDistance(ray);
				velocity[1] = (distance - skinWidth) * directionY;
				rayLength = distance;

				if (collisions.climbingSlope) {
					velocity[0] = velocity[1] / Math.tan(collisions.slopeAngle) * sign(velocity[0]);
				}

				collisions.below = directionY === -1;
				collisions.above = directionY === 1;
			}

			this.raycastResult.reset();
		}

		if (collisions.climbingSlope) {
			var directionX = sign(velocity[0]);
			rayLength = Math.abs(velocity[0]) + skinWidth;

			ray.collisionMask = this.collisionMask;
			vec2.copy(ray.from, ((directionX === -1) ? raycastOrigins.bottomLeft : raycastOrigins.bottomRight));
			ray.from[1] += velocity[1];
			vec2.set(ray.to, ray.from[0] + directionX * rayLength, ray.from[1]);
			ray.update();
			this.world.raycast(this.raycastResult, ray);
			this.emitRayCastEvent();

			if (this.raycastResult.body) {
				var slopeAngle = angle(this.raycastResult.normal, UNIT_Y);
				if (slopeAngle !== collisions.slopeAngle) {
					velocity[0] = (this.raycastResult.getHitDistance(ray) - skinWidth) * directionX;
					collisions.slopeAngle = slopeAngle;
				}
			}
		}
	};

	Controller.prototype.climbSlope = function(velocity, slopeAngle) {
		var collisions = this.collisions;
		var moveDistance = Math.abs(velocity[0]);
		var climbVelocityY = Math.sin(slopeAngle) * moveDistance;

		if (velocity[1] <= climbVelocityY) {
			velocity[1] = climbVelocityY;
			velocity[0] = Math.cos(slopeAngle) * moveDistance * sign (velocity[0]);
			collisions.below = true;
			collisions.climbingSlope = true;
			collisions.slopeAngle = slopeAngle;
		}
	};

	Controller.prototype.descendSlope = function(velocity) {
		var raycastOrigins = this.raycastOrigins;
		var directionX = sign (velocity[0]);
		var collisions = this.collisions;
		var ray = this.ray;
		ray.collisionMask = this.collisionMask;
		vec2.copy(ray.from, (directionX === -1) ? raycastOrigins.bottomRight : raycastOrigins.bottomLeft);
		vec2.set(ray.to, ray.from[0], ray.from[1] - 1e6);
		ray.update();
		this.world.raycast(this.raycastResult, ray);
		this.emitRayCastEvent();

		if (this.raycastResult.body) {
			var slopeAngle = angle(this.raycastResult.normal, UNIT_Y);
			if (slopeAngle !== 0 && slopeAngle <= this.maxDescendAngle) {
				if (sign(this.raycastResult.normal[0]) === directionX) {
					if (this.raycastResult.getHitDistance(ray) - this.skinWidth <= Math.tan(slopeAngle) * Math.abs(velocity[0])) {
						var moveDistance = Math.abs(velocity[0]);
						var descendVelocityY = Math.sin(slopeAngle) * moveDistance;
						velocity[0] = Math.cos(slopeAngle) * moveDistance * sign(velocity[0]);
						velocity[1] -= descendVelocityY;

						collisions.slopeAngle = slopeAngle;
						collisions.descendingSlope = true;
						collisions.below = true;
					}
				}
			}
		}

		this.raycastResult.reset();
	};

	Controller.prototype.resetFallingThroughPlatform = function() {
		this.collisions.fallingThroughPlatform = false;
	};


	// TODO: platform controller
	/*
	function PlatformController(options) {
		RaycastController.apply(this, arguments);

		this.passengerMask = -1;

		this.localWaypoints = [];
		this.globalWaypoints = [];

		this.speed = 0;
		this.cyclic = false;
		this.waitTime = 0;

		// Range(0,2)
		this.easeAmount = 0;

		this.fromWaypointIndex = 0;
		this.percentBetweenWaypoints = 0;
		this.nextMoveTime = 0;

		List<PassengerMovement> passengerMovement;
		Dictionary<Transform,Controller2D> passengerDictionary = new Dictionary<Transform, Controller2D>();
	}

	PlatformController.prototype.Start = function () {
		base.Start();
		globalWaypoints = new Vector3[localWaypoints.Length];
		for (int i =0; i < localWaypoints.Length; i++) {
			globalWaypoints[i] = localWaypoints[i] + transform.position;
		}
	}

	PlatformController.prototype.Update = function () {
		UpdateRaycastOrigins ();
		Vector3 velocity = CalculatePlatformMovement();
		CalculatePassengerMovement(velocity);
		MovePassengers (true);
		transform.Translate (velocity);
		MovePassengers (false);
	};

	PlatformController.prototype.Ease = function(x) {
		var a = this.easeAmount + 1;
		return Math.pow(x,a) / (Math.pow(x,a) + Math.pow(1-x,a));
	}

	PlatformController.prototype.CalculatePlatformMovement = function() {
		if (Time.time < nextMoveTime) {
			return Vector3.zero;
		}

		fromWaypointIndex %= globalWaypoints.Length;
		int toWaypointIndex = (fromWaypointIndex + 1) % globalWaypoints.Length;
		float distanceBetweenWaypoints = Vector3.Distance (globalWaypoints [fromWaypointIndex], globalWaypoints [toWaypointIndex]);
		percentBetweenWaypoints += Time.deltaTime * speed/distanceBetweenWaypoints;
		percentBetweenWaypoints = Mathf.Clamp01 (percentBetweenWaypoints);
		float easedPercentBetweenWaypoints = Ease (percentBetweenWaypoints);

		Vector3 newPos = Vector3.Lerp (globalWaypoints [fromWaypointIndex], globalWaypoints [toWaypointIndex], easedPercentBetweenWaypoints);

		if (percentBetweenWaypoints >= 1) {
			percentBetweenWaypoints = 0;
			fromWaypointIndex ++;

			if (!cyclic) {
				if (fromWaypointIndex >= globalWaypoints.Length-1) {
					fromWaypointIndex = 0;
					System.Array.Reverse(globalWaypoints);
				}
			}
			nextMoveTime = Time.time + waitTime;
		}

		return newPos - transform.position;
	}

	void MovePassengers(bool beforeMovePlatform) {
		foreach (PassengerMovement passenger in passengerMovement) {
			if (!passengerDictionary.ContainsKey(passenger.transform)) {
				passengerDictionary.Add(passenger.transform,passenger.transform.GetComponent<Controller2D>());
			}

			if (passenger.moveBeforePlatform == beforeMovePlatform) {
				passengerDictionary[passenger.transform].moveWithZeroInput(passenger.velocity, passenger.standingOnPlatform);
			}
		}
	}

	void CalculatePassengerMovement(Vector3 velocity) {
		HashSet<Transform> movedPassengers = new HashSet<Transform> ();
		passengerMovement = new List<PassengerMovement> ();

		float directionX = Mathf.Sign (velocity.x);
		float directionY = Mathf.Sign (velocity.y);

		// Vertically moving platform
		if (velocity.y != 0) {
			float rayLength = Mathf.Abs (velocity.y) + skinWidth;

			for (int i = 0; i < verticalRayCount; i ++) {
				Vector2 rayOrigin = (directionY == -1)?raycastOrigins.bottomLeft:raycastOrigins.topLeft;
				rayOrigin += Vector2.right * (verticalRaySpacing * i);
				RaycastHit2D hit = Physics2D.Raycast(rayOrigin, Vector2.up * directionY, rayLength, passengerMask);

				if (hit && hit.distance != 0) {
					if (!movedPassengers.Contains(hit.transform)) {
						movedPassengers.Add(hit.transform);
						float pushX = (directionY == 1)?velocity.x:0;
						float pushY = velocity.y - (hit.distance - skinWidth) * directionY;

						passengerMovement.Add(new PassengerMovement(hit.transform,new Vector3(pushX,pushY), directionY == 1, true));
					}
				}
			}
		}

		// Horizontally moving platform
		if (velocity.x != 0) {
			float rayLength = Mathf.Abs (velocity.x) + skinWidth;

			for (int i = 0; i < horizontalRayCount; i ++) {
				Vector2 rayOrigin = (directionX == -1)?raycastOrigins.bottomLeft:raycastOrigins.bottomRight;
				rayOrigin += Vector2.up * (horizontalRaySpacing * i);
				RaycastHit2D hit = Physics2D.Raycast(rayOrigin, Vector2.right * directionX, rayLength, passengerMask);

				if (hit && hit.distance != 0) {
					if (!movedPassengers.Contains(hit.transform)) {
						movedPassengers.Add(hit.transform);
						float pushX = velocity.x - (hit.distance - skinWidth) * directionX;
						float pushY = -skinWidth;

						passengerMovement.Add(new PassengerMovement(hit.transform,new Vector3(pushX,pushY), false, true));
					}
				}
			}
		}

		// Passenger on top of a horizontally or downward moving platform
		if (directionY == -1 || velocity.y == 0 && velocity.x != 0) {
			float rayLength = skinWidth * 2;

			for (int i = 0; i < verticalRayCount; i ++) {
				Vector2 rayOrigin = raycastOrigins.topLeft + Vector2.right * (verticalRaySpacing * i);
				RaycastHit2D hit = Physics2D.Raycast(rayOrigin, Vector2.up, rayLength, passengerMask);

				if (hit && hit.distance != 0) {
					if (!movedPassengers.Contains(hit.transform)) {
						movedPassengers.Add(hit.transform);
						float pushX = velocity.x;
						float pushY = velocity.y;

						passengerMovement.Add(new PassengerMovement(hit.transform,new Vector3(pushX,pushY), true, false));
					}
				}
			}
		}
	}

	struct PassengerMovement {
		public Transform transform;
		public Vector3 velocity;
		public bool standingOnPlatform;
		public bool moveBeforePlatform;

		public PassengerMovement(Transform _transform, Vector3 _velocity, bool _standingOnPlatform, bool _moveBeforePlatform) {
			transform = _transform;
			velocity = _velocity;
			standingOnPlatform = _standingOnPlatform;
			moveBeforePlatform = _moveBeforePlatform;
		}
	}

	void OnDrawGizmos() {
		if (localWaypoints != null) {
			Gizmos.color = Color.red;
			float size = .3f;

			for (int i =0; i < localWaypoints.Length; i ++) {
				Vector3 globalWaypointPos = (Application.isPlaying)?globalWaypoints[i] : localWaypoints[i] + transform.position;
				Gizmos.DrawLine(globalWaypointPos - Vector3.up * size, globalWaypointPos + Vector3.up * size);
				Gizmos.DrawLine(globalWaypointPos - Vector3.left * size, globalWaypointPos + Vector3.left * size);
			}
		}
	}
	 */




	/**
	 * @class KinematicCharacterController
	 * @extends {Controller}
	 * @constructor
	 * @param {object} [options]
	 * @param {number} [options.accelerationTimeAirborne=0.2]
	 * @param {number} [options.accelerationTimeGrounded=0.1]
	 * @param {number} [options.moveSpeed=6]
	 * @param {number} [options.wallSlideSpeedMax=3]
	 * @param {number} [options.wallStickTime=0.25]
	 * @param {array} [options.wallJumpClimb]
	 * @param {array} [options.wallJumpOff]
	 * @param {array} [options.wallLeap]
	 * @param {number} [options.timeToJumpApex=0.4]
	 * @param {number} [options.maxJumpHeight=4]
	 * @param {number} [options.minJumpHeight=1]
	 * @param {number} [options.velocityXSmoothing=0.2]
	 * @param {number} [options.velocityXMin=0.0001]
	 * @param {number} [options.maxClimbAngle]
	 * @param {number} [options.maxDescendAngle]
	 * @param {number} [options.collisionMask=-1]
	 * @param {number} [options.skinWidth=0.015]
	 * @param {number} [options.horizontalRayCount=4]
	 * @param {number} [options.verticalRayCount=4]
	 */
	function KinematicCharacterController(options) {
		Controller.apply(this, arguments);

		options = options || {};

		this.input = vec2.create();

		this.accelerationTimeAirborne = options.accelerationTimeAirborne !== undefined ? options.accelerationTimeAirborne : 0.2;
		this.accelerationTimeGrounded = options.accelerationTimeGrounded !== undefined ? options.accelerationTimeGrounded : 0.1;
		this.moveSpeed = options.moveSpeed !== undefined ? options.moveSpeed : 6;
		this.wallSlideSpeedMax = options.wallSlideSpeedMax !== undefined ? options.wallSlideSpeedMax : 3;
		this.wallStickTime = options.wallStickTime !== undefined ? options.wallStickTime : 0.25;

		this.wallJumpClimb = vec2.clone(options.wallJumpClimb || [10, 10]);
		this.wallJumpOff = vec2.clone(options.wallJumpOff || [10, 10]);
		this.wallLeap = vec2.clone(options.wallLeap || [10, 10]);

		var timeToJumpApex = options.timeToJumpApex !== undefined ? options.timeToJumpApex : 0.4;
		var maxJumpHeight = options.maxJumpHeight !== undefined ? options.maxJumpHeight : 4;
		var minJumpHeight = options.minJumpHeight !== undefined ? options.minJumpHeight : 1;
		this.gravity = -(2 * maxJumpHeight) / Math.pow(timeToJumpApex, 2);
		this.maxJumpVelocity = Math.abs(this.gravity) * timeToJumpApex;
		this.minJumpVelocity = Math.sqrt(2 * Math.abs(this.gravity) * minJumpHeight);

		this.velocity = vec2.create();
		this.velocityXSmoothing = options.velocityXSmoothing !== undefined ? options.velocityXSmoothing : 0.2;
		this.velocityXMin = options.velocityXMin !== undefined ? options.velocityXMin : 0.0001;

		this.timeToWallUnstick = 0;
		this._requestJump = false;
		this._requestUnJump = false;
	}
	KinematicCharacterController.prototype = Object.create(Controller.prototype);
	KinematicCharacterController.prototype.constructor = KinematicCharacterController;

	/**
	 * Set the jump button state. If it is down, pass true, else false.
	 * @method setJumpKeyState
	 * @param {boolean} isDown
	 */
	KinematicCharacterController.prototype.setJumpKeyState = function(isDown) {
		if(isDown){
			this._requestJump = true;
		} else {
			this._requestUnJump = true;
		}
	};

	/**
	 * Should be executed after each physics tick, using the physics deltaTime.
	 * @param {number} deltaTime
	 */
	KinematicCharacterController.prototype.update = (function(){
		var scaledVelocity = vec2.create();
		return function (deltaTime) {
			var input = this.input;
			var velocity = this.velocity;
			var controller = this;

			var wallDirX = (controller.collisions.left) ? -1 : 1;
			var targetVelocityX = input[0] * this.moveSpeed;

			var smoothing = this.velocityXSmoothing;
			smoothing *= controller.collisions.below ? this.accelerationTimeGrounded : this.accelerationTimeAirborne;
			var factor = 1 - Math.pow(smoothing, deltaTime);
			velocity[0]	= lerp(factor, velocity[0], targetVelocityX);
			if(Math.abs(velocity[0]) < this.velocityXMin){
				velocity[0] = 0;
			}

			var wallSliding = false;
			if ((controller.collisions.left || controller.collisions.right) && !controller.collisions.below && velocity[1] < 0) {
				wallSliding = true;

				if (velocity[1] < -this.wallSlideSpeedMax) {
					velocity[1] = -this.wallSlideSpeedMax;
				}

				if (this.timeToWallUnstick > 0) {
					velocity[0] = 0;

					if (input[0] !== wallDirX && input[0] !== 0) {
						this.timeToWallUnstick -= deltaTime;
					} else {
						this.timeToWallUnstick = this.wallStickTime;
					}
				} else {
					this.timeToWallUnstick = this.wallStickTime;
				}
			}

			if (this._requestJump) {
				this._requestJump = false;

				if (wallSliding) {
					if (wallDirX === input[0]) {
						velocity[0] = -wallDirX * this.wallJumpClimb[0];
						velocity[1] = this.wallJumpClimb[1];
					} else if (input[0] === 0) {
						velocity[0] = -wallDirX * this.wallJumpOff[0];
						velocity[1] = this.wallJumpOff[1];
					} else {
						velocity[0] = -wallDirX * this.wallLeap[0];
						velocity[1] = this.wallLeap[1];
					}
				}

				if (controller.collisions.below) {
					velocity[1] = this.maxJumpVelocity;
				}
			}

			if (this._requestUnJump) {
				this._requestUnJump = false;
				if (velocity[1] > this.minJumpVelocity) {
					velocity[1] = this.minJumpVelocity;
				}
			}

			velocity[1] += this.gravity * deltaTime;
			vec2.scale(scaledVelocity, velocity, deltaTime);
			controller.move(scaledVelocity, input);

			if (controller.collisions.above || controller.collisions.below) {
				velocity[1] = 0;
			}
		};
	})();

})(this.p2);