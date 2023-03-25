import React, { useState, useEffect } from "react";
import "./App.css";

const TOTAL_FLOORS = 10;
const TOTAL_ELEVATORS = 5;
const WAIT_TIME = 2000;

const initialElevators = Array.from({ length: TOTAL_ELEVATORS }, (_, i) => ({
  id: i,
  floor: 0,
  state: "idle",
}));

function App() {
  const [floors, setFloors] = useState(
    Array(TOTAL_FLOORS).fill({ state: "call" })
  );
  const [elevators, setElevators] = useState(initialElevators);
  const [callQueue, setCallQueue] = useState([]);

  useEffect(() => {
    if (callQueue.length > 0) {
      const availableElevator = elevators.find(
        (elevator) => elevator.state === "idle"
      );
      if (availableElevator) {
        const nextCall = callQueue.shift();
        setCallQueue([...callQueue]);
        moveElevator(availableElevator.id, nextCall);
      }
    }
  }, [elevators, callQueue]);


  const findClosestElevator = (elevators,floor) => {
    let closest = elevators[0];
    let minDiff = Math.abs(elevators[0].floor - floor);

    elevators.map((elevator) => {
      let diff = Math.abs(elevator.floor - floor);
      if (diff < minDiff) {
        minDiff = diff;
        closest = elevator;
      }
    });

    return closest;
  };

  const callElevator = (floor) => {
    setFloors((prevState) => {
      const newFloors = [...prevState];
      newFloors[floor] = { ...newFloors[floor], state: "waiting" };
      return newFloors;
    });

    const availableElevator = elevators.filter(
      (elevator) => elevator.state === "idle"
    );
    if (availableElevator[0]) {
      const closetElevator = findClosestElevator(availableElevator,floor)
      moveElevator(closetElevator.id, floor);
    } else {
      setCallQueue([...callQueue, floor]);
    }
  };


  const moveElevator = (elevatorId, targetFloor) => {
    setElevators((prevState) => {
      const newElevators = [...prevState];
      const elevatorIndex = newElevators.findIndex(
        (elevator) => elevator.id === elevatorId
      );
      newElevators[elevatorIndex] = {
        ...newElevators[elevatorIndex],
        floor: targetFloor,
        state: "moving",
      };
      return newElevators;
    });

    setTimeout(() => {
      setElevators((prevState) => {
        const newElevators = [...prevState];
        const elevatorIndex = newElevators.findIndex(
          (elevator) => elevator.id === elevatorId
        );
        newElevators[elevatorIndex] = {
          ...newElevators[elevatorIndex],
          state: "arrived",
        };
        return newElevators;
      });

      setFloors((prevState) => {
        const newFloors = [...prevState];
        newFloors[targetFloor] = {
          ...newFloors[targetFloor],
          state: "arrived",
        };
        return newFloors;
      });

      setTimeout(() => {
        setElevators((prevState) => {
          const newElevators = [...prevState];
          const elevatorIndex = newElevators.findIndex(
            (elevator) => elevator.id === elevatorId
          );
          newElevators[elevatorIndex] = {
            ...newElevators[elevatorIndex],
            state: "idle",
          };
          return newElevators;
        });

        setFloors((prevState) => {
          const newFloors = [...prevState];
          newFloors[targetFloor] = { ...newFloors[targetFloor], state: "call" };
          return newFloors;
        });
      }, WAIT_TIME);
    }, WAIT_TIME);
  };

  return (
    <div className="App">
      <div className="building">
        {floors.map((floor, index) => (
          <div key={index} className="floor">
            Floor {index}
            <button
              className={`call-button ${floor.state}`}
              onClick={() => floor.state === "call" && callElevator(index)}
            >
              {floor.state === "call"
                ? "Call"
                : floor.state === "waiting"
                ? "Waiting"
                : "Arrived"}
            </button>
          </div>
        ))}
        <div className="elevator-container">
          {elevators.map((elevator, index) => (
            <div
              key={elevator.id}
              className={`elevator ${elevator.state}`}
              style={{ bottom: `${elevator.floor * 10}%` }}
            >
              Elevator {index + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
