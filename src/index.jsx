import React from 'react';
import ReactDOM from 'react-dom';
import Game from './ui/Game';
import saveGame from './SaveGame';

window.onload = event => ReactDOM.render(
  <Game resourceManager={saveGame} />,
  document.getElementById('root'));