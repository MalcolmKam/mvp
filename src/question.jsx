import React, { useEffect, useState } from 'react';
import axios from 'axios';

import '../public/question.css';

function Question({
  question, difficulty, score, highscore, setScore, setHighscore, limit
}) {
  const [shuffledDefinitions, setShuffledDefinitions] = useState([]);
  const [clickedButton, setClickedButton] = useState(null);
  const [text, setText] = useState('');
  const [finalText, setFinalText] = useState('');

  useEffect(() => {
    const allDefinitions = [question.definitions, ...question.incorrect_definitions];
    const shuffled = shuffleArray(allDefinitions);
    setShuffledDefinitions(shuffled);
  }, [question]);

  useEffect(() => {
    setClickedButton(null);
    setText('');
    setFinalText('');
  }, [difficulty, limit]);

  const shuffleArray = (array) => {
    const shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
  };

  const handleButtonClick = (event, definition) => {
    event.preventDefault();
    if (definition === question.definitions) {
      setScore(score + 1);
      setClickedButton(definition);
      if (score + 1 > highscore) {
        axios.put('/law-quiz/highscores', { difficulty, score: score + 1 })
          .then(() => axios.get('/law-quiz/highscores'))
          .then((response) => {
            if (difficulty === 'Normal') {
              setHighscore(response.data[0].score);
            } else {
              setHighscore(response.data[1].score);
            }
            console.log('Highscore updated successfully');
          })
          .catch((err) => {
            console.error('Failed to update highscore ', err);
          });
      }
      axios.put('law-quiz/increment-learning', { termId: question.id })
        .then(() => {
          console.log('Learning incremented successfully');
        })
        .catch((err) => {
          console.error('Failed to increment learning ', err);
        });
    } else {
      if (question.learning > 0) {
        axios.put('law-quiz/decrement-learning', { termId: question.id })
          .then(() => {
            console.log('Learning decremented successfully');
          })
          .catch((err) => {
            console.error('Failed to decrement learning ', err);
          });
      }
      setClickedButton(definition);
    }
  };

  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  const handleTextSubmit = (event, text) => {
    handleButtonClick(event, text);
    setFinalText(text);
  };

  return (
    <div>
      <h2>{question.terms}</h2>
      {difficulty === 'Hard' ? (
        <form>
          <textarea
            className="definition-input"
            placeholder="Enter your answer"
            value={text}
            onChange={handleTextChange}
            id="definition"
          />
          <button
            type="submit"
            // eslint-disable-next-line no-nested-ternary
            className={`submit-button ${finalText ? (finalText === question.definitions ? 'right' : 'wrong') : ''}`}
            onClick={(event) => handleTextSubmit(event, text)}
            disabled={finalText !== ''}
          >
            Submit Answer
          </button>
        </form>
      ) : (
        shuffledDefinitions.map((definition, index) => (
          <button
            key={index}
            type="button"
            // eslint-disable-next-line no-nested-ternary
            className={`definition-button ${clickedButton === definition ? (definition === question.definitions ? 'correct' : 'incorrect') : ''}`}
            onClick={(event) => handleButtonClick(event, definition)}
            disabled={clickedButton !== null}
          >
            {definition}
          </button>
        ))
      )}
    </div>
  );
}
export default Question;
