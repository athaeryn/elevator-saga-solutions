{
    init: function(elevators, floors) {
        let elevator = elevators[0];
        
        // Floors where passengers are waiting.
        let waitingFloors = [];
        
        // Floors where passengers want to go.
        let deliveryFloors = [];
        
        // When a button is pressed on a floor, add it to waitingFloors.
        floors.forEach(function(floor) {
            let floorNumber = floor.floorNum();
            function onButtonPressed(direction) {
                if (!waitingFloors.includes(floorNumber)) {
                    waitingFloors.push(floorNumber);
                }
            }
            floor.on("up_button_pressed", onButtonPressed.bind(null, "up"));
            floor.on("down_button_pressed", onButtonPressed.bind(null, "down"));
        })
        
        // When a button in the elevator is pressed, add to deliveryFloors.
        elevator.on("floor_button_pressed", function(floorNumber) {
            if (!deliveryFloors.includes(floorNumber)) {
                deliveryFloors.push(floorNumber);
            }
        })
        
        function getWaitingFloor() {
            return waitingFloors.shift();
        }
        
        function getDeliveryFloor() {
            return deliveryFloors.shift();
        }

        // When the elevator is idle, first try and drop off passengers, then try and pick up more.
        elevator.on("idle", function() {
            let floor = getDeliveryFloor() || getWaitingFloor();
            if (floor != null) {
                elevator.goToFloor(floor);
            }
        });
    },
    update: function(dt, elevators, floors) {}
}
