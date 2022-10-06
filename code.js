({
  init: function (elevators, floors) {
    // Floors where passengers are waiting.
    let waitingFloors = [];

    // When a button is pressed on a floor, add it to waitingFloors.
    floors.forEach((floor) => {
      let floorNumber = floor.floorNum();
      let onButtonPressed = (direction) => {
        if (!waitingFloors.includes(floorNumber)) {
          waitingFloors.push(floorNumber);
        }
      };
      floor.on("up_button_pressed", onButtonPressed.bind(null, "up"));
      floor.on("down_button_pressed", onButtonPressed.bind(null, "down"));
    });

    elevators.forEach((elevator) => {
      // Floors where passengers in this elevator want to go.
      let deliveryFloors = [];

      // When a button in the elevator is pressed, add to deliveryFloors.
      elevator.on("floor_button_pressed", function (floorNumber) {
        if (!deliveryFloors.includes(floorNumber)) {
          deliveryFloors.push(floorNumber);
        }
      });

      // When the elevator is idle, first try and drop off passengers, then try and pick up more.
      elevator.on("idle", function () {
        let floor = deliveryFloors[0] || waitingFloors[0];
        if (floor != null) {
          elevator.goToFloor(floor);
        }
      });

      // Remove floors from the queues when the elevator stops at them.
      elevator.on("stopped_at_floor", function (floorNumber) {
        waitingFloors = waitingFloors.filter((x) => x !== floorNumber);
        deliveryFloors = deliveryFloors.filter((x) => x !== floorNumber);
      });
    });
  },
  update: function (dt, elevators, floors) {},
});
