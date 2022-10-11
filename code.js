({
  init: function (elevators, floors) {
    const UP = "up";
    const DOWN = "down";

    // Floors where passengers are waiting.
    let waitingFloors = {
      all: [],
      add: function (floorNumber, direction) {
        if (
          !this.all.find(
            (x) => x.floor === floorNumber && x.direction === direction
          )
        ) {
          this.all.push({
            floor: floorNumber,
            direction,
          });
        }
      },
      remove: function (floorNumber, direction) {
        this.all = this.all.filter(
          (x) => !(x.floor === floorNumber && x.direction === direction)
        );
      },
      getByDirection: function (direction) {
        return this.all.filter((x) => x.direction === direction);
      },
    };

    // When a button is pressed on a floor, add it to waitingFloors.
    floors.forEach((floor) => {
      let floorNumber = floor.floorNum();
      let onButtonPressed = (direction) => {
        waitingFloors.add(floorNumber, direction);
      };
      floor.on("up_button_pressed", onButtonPressed.bind(null, UP));
      floor.on("down_button_pressed", onButtonPressed.bind(null, DOWN));
    });

    elevators.forEach((elevator) => {
      let travelDirection = UP;

      setElevatorDirectionIndicators(elevator, travelDirection);

      // When a button in the elevator is pressed, ensure it is in destinationQueue.
      elevator.on("floor_button_pressed", function (floorNumber) {
        // assumes button pressed will be in same direction as travel
        if (!elevator.destinationQueue.includes(floorNumber)) {
          elevator.destinationQueue.push(floorNumber);
          elevator.destinationQueue.sort((a, b) => {
            if (travelDirection === UP) {
              return a - b;
            } else {
              return b - a;
            }
          });
          elevator.checkDestinationQueue();
        }
      });

      elevator.on("idle", function () {
        // Are we closer to the top or bottom
        let currentFloor = elevator.currentFloor();
        // If the distance to the top is less than the distance to the bottom
        let closerToTop = Math.abs(currentFloor - floors.length) < currentFloor;

        travelDirection = closerToTop ? DOWN : UP;

        let destinations = waitingFloors.getByDirection(travelDirection);

        // If we have nowhere to go in this direction, try the other direction.
        if (destinations.length === 0) {
          let otherDirection = travelDirection === UP ? DOWN : UP;
          let x = waitingFloors.getByDirection(otherDirection);
          if (x.length > 0) {
            travelDirection = otherDirection;
            destinations = x;
          }
        }

        setElevatorDirectionIndicators(elevator, travelDirection);

        destinations.sort((a, b) => {
          if (travelDirection === UP) {
            return a.floor - b.floor;
          } else {
            return b.floor - a.floor;
          }
        });

        // Remove destinations from waiting floors proactively
        destinations.forEach((a) => waitingFloors.remove(a.floor, a.direction));

        elevator.destinationQueue = destinations.map((y) => y.floor);
        elevator.checkDestinationQueue();
      });
    });

    function setElevatorDirectionIndicators(elevator, direction) {
      elevator.goingUpIndicator(direction === UP);
      elevator.goingDownIndicator(direction === DOWN);
    }
  },
  update: function (dt, elevators, floors) {},
});
