import React, { useState, useEffect } from "react";
import "./App.css";

const url = "https://cheaderthecoder.github.io/5-Letter-words/words.json";
const WORD_LENGTH = 5;

export default function App() {
  const [solution, setSolution] = useState("");
  const [guesses, setGuesses] = useState(Array(6).fill(""));
  const [currGuess, setCurrGuess] = useState("");
  const [isGameOver, setIsGameOver] = useState(false);
  const [solutionChars, setSolutionChars] = useState(Array(5).fill(""));

  useEffect(() => {
    console.log(currGuess);
  }, [currGuess]);

  useEffect(() => {
    const handleTyping = (event) => {
      if (isGameOver) {
        return;
      }

      const isCorrect = solution === currGuess;
      if (isCorrect) {
        setIsGameOver(true);
      }
      if (
        currGuess.length >= WORD_LENGTH &&
        event.key !== "Enter" &&
        event.key !== "Backspace"
      ) {
        return;
      }
      if (event.key === "Backspace") {
        setCurrGuess(currGuess.slice(0, -1));
        return;
      }
      if (event.key === "Enter") {
        if (currGuess.length !== WORD_LENGTH) return;

        const firstEmptyIndex = guesses.findIndex((word) => word === "");
        if (firstEmptyIndex !== -1) {
          const newGuesses = [...guesses];
          newGuesses[firstEmptyIndex] = currGuess;
          setGuesses(newGuesses);
          if (
            currGuess !== solution &&
            firstEmptyIndex === guesses.length - 1
          ) {
            setIsGameOver(true);
          }
          setCurrGuess("");
        }
      } else if (
        !event.key.match(/[a-z]/i) || // Not a letter
        [
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          "Tab",
          "Shift",
          "Escape",
          "Control",
          "Alt",
          "CapsLock",
          "Meta",
        ].includes(event.key) // Arrow keys, Tab, or Shift
      ) {
        event.preventDefault(); // Prevent the default behavior (e.g., scrolling, focusing)
        return; // Don't process the key press
      } else {
        setCurrGuess((oldGuess) => oldGuess + event.key);
      }
    };

    window.addEventListener("keydown", handleTyping);

    return () => {
      window.removeEventListener("keydown", handleTyping);
    };
  }, [currGuess, guesses, isGameOver, solution]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        const data = await response.json();
        const correct_word =
          data.words[Math.floor(Math.random() * data.words.length)];
        setSolution(correct_word);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (solution) {
      setSolutionChars(solution.split(""));
    }
  }, [solution]);

  return (
    <div className="board">
      {guesses.map((g, index) => {
        let firstEmpty = guesses.findIndex((char) => char === "");
        let isCurrentGuess = index === firstEmpty;
        return (
          <Line
            key={index}
            guess={isCurrentGuess ? currGuess : g}
            isFinal={!isCurrentGuess && g != ""}
            solutionChars={solutionChars}
          />
        );
      })}
      {isGameOver && (
        <>
          <h1>The answer is</h1>
          <h2>{solution}</h2>
        </>
      )}
    </div>
  );
}

function Line({ guess, isFinal, solutionChars }) {
  const tiles = [];
  let temp = [...solutionChars];
  let marked_as_correct = {};

  // Step 1: Identify correct positions first
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (isFinal) {
      const char = guess[i] || "";
      if (char === temp[i]) {
        temp[i] = null;
        marked_as_correct[i] = "tile correct";
      }
    }
  }

  // Step 2: Identify partial matches
  for (let i = 0; i < WORD_LENGTH; i++) {
    const char = guess[i] || "";
    if (isFinal && !(i in marked_as_correct)) {
      if (temp.includes(char)) {
        marked_as_correct[i] = "tile partial";
        temp[temp.indexOf(char)] = null;
      } else {
        marked_as_correct[i] = "tile incorrect";
      }
    }
  }

  for (let i = 0; i < WORD_LENGTH; i++) {
    tiles.push(
      <div key={i} className={marked_as_correct[i] || "tile"}>
        {guess[i] || ""}
      </div>
    );
  }

  return <div className="line">{tiles}</div>;
}
