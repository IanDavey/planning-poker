import { createContext, useContext, useEffect, useState } from 'react';
import './App.css';

import { io } from 'socket.io-client';
import { v4 as uuid } from 'uuid';

function Version() {
  const { serverVersion } = UIContext.useContext();
  return <div className="Version">
    <p>Client Version: {process.env.REACT_APP_VERSION}</p>
    <p>Server Version: {serverVersion}</p>
  </div>;
}

function UIContext({ children }) {
  const [selection, setSelection] = useState(undefined);
  const [revealed, setRevealed] = useState(false);
  const [serverVersion, setServerVersion] = useState(null);
  const socketFuncs = SocketFuncsContext.useContext()[0];
  const handleRevealChange = newValue => {
    setRevealed(newValue);
    if (newValue) {
      socketFuncs.sendReveal && socketFuncs.sendReveal();
    } else {
      socketFuncs.sendReset && socketFuncs.sendReset();
    }
  };
  const handleSelectionChange = newValue => {
    setSelection(newValue);
    if (newValue !== undefined) socketFuncs.sendSelect && socketFuncs.sendSelect(newValue);
    else socketFuncs.sendUnselect && socketFuncs.sendUnselect();
  };
  return <UIContext.Context.Provider value={{ revealed, setRevealed: handleRevealChange, selection, setSelection: handleSelectionChange, serverVersion, setServerVersion }}>{children}</UIContext.Context.Provider>
}
UIContext.Context = createContext([]);
UIContext.useContext = () => useContext(UIContext.Context);

function SocketFuncsContext({ children }) {
  const [funcs, setFuncs] = useState({});
  return <SocketFuncsContext.Context.Provider value={[funcs, setFuncs]}>{children}</SocketFuncsContext.Context.Provider>
}
SocketFuncsContext.Context = createContext([]);
SocketFuncsContext.useContext = () => useContext(SocketFuncsContext.Context);

function SocketHandler({ children }) {
  const game = GameContext.useContext();
  const { setRevealed, setSelection, setServerVersion } = UIContext.useContext();
  const setFuncs = SocketFuncsContext.useContext()[1];
  useEffect(() => {
    const socket = io({ path: '/poker/api' });
    socket.on('connect', () => socket.emit('register', game.me));
    socket.on('state', state => {
      const sels = new Map(state.selections);
      game.setPlayers(state.players.map(({ name, guid }) => sels.has(guid) ? <PlayCard key={guid} name={name} value={sels.get(guid)}/> : <PlayCard key={guid} name={name}/>));
      setServerVersion(state.version);
      setRevealed(oldValue => {
        if (oldValue && !state.revealed) setSelection(undefined);
        return state.revealed;
      });
      game.setStats(state.stats);
    });
    setFuncs({
      sendSelect(value) { socket.emit('select', value); },
      sendUnselect() { socket.emit('unselect'); },
      sendReveal() { socket.emit('reveal'); },
      sendReset() { socket.emit('reset'); }
    });
  }, []);
  return children;
}

function NamePrompt({ setReady }) {
  const [name, setName] = useState(window.localStorage.name ?? "");
  const handleChange = event => {
    setName(event.target.value);
  };
  const handleSubmit = event => {
    window.localStorage.name = name;
    setReady(name?.length > 0);
    event.preventDefault();
  };
  return <form onSubmit={handleSubmit}>
    <label>
      Your name:
      <input className="Name-Input" type="text" value={name} onChange={handleChange}/>
    </label>
    <input type="submit" value="Save"/>
  </form>;
}

function GameContext({ children }) {
  const [me, setMe] = useState({ name: window.localStorage.name, guid: uuid() });
  const [players, setPlayers] = useState([]);
  const [stats, setStats] = useState({ mean: 0 })
  return <GameContext.Context.Provider value={{ me, setMe, players, setPlayers, stats, setStats }}>{children}</GameContext.Context.Provider>;
}
GameContext.Context = createContext([]);
GameContext.useContext = () => useContext(GameContext.Context);

function Card({ name, value, onSelect }) {
  const number = isNaN(Number.parseFloat(value)) ? "?" : value;
  value = value !== undefined ? number : "";
  return <table><tbody>
    <tr><td><div className="Card-Display" onClick={onSelect}><span className="Card-Value">{value.toString()}</span></div></td></tr>
    <tr><td className="Name-Label">{name}</td></tr>
  </tbody></table>;
}

function PlayCard({ name, value }) {
  let className = "PlayCard";
  const { revealed } = UIContext.useContext();
  if (!revealed && value !== undefined) className += " PlayedCard";
  return <div className={className}>{
    revealed ? <Card name={name} value={value}/> : <Card name={name}/>
  }</div>;
}

function SelectCard({ value }) {
  const { revealed, selection, setSelection } = UIContext.useContext();
  const selected = selection === value;
  return <div className={selected ? "SelectedCard" : ""}><Card value={value} onSelect={() => revealed || setSelection(selected ? undefined : value)}/></div>;
}

function Table() {
  return <div className="Table"/>;
}

function Playfield() {
  const gameObject = GameContext.useContext();
  const headCard = gameObject.players[0];
  const footCard = gameObject.players.length > 1 ? gameObject.players[gameObject.players.length - 1] : null;
  const upperCards = [], lowerCards = [];
  for (let i = 1; i < gameObject.players.length - 1; i++) {
    (i % 2 === 1 ? upperCards : lowerCards).push(gameObject.players[i]);
  }
  return <table className="Playfield"><tbody>
    <tr className="TableUpper"><td/>{upperCards.map(card => <td>{card}</td>)}<td/></tr>
    <tr className="TableRow">
      <td className="TableHead">{headCard}</td>
      <td colSpan={Math.max(upperCards.length, lowerCards.length, 1)}><Table/></td>
      <td className="TableFoot">{footCard}</td>
    </tr>
    <tr className="TableLower"><td/>{lowerCards.map(card => <td>{card}</td>)}<td/></tr>
  </tbody></table>;
}

const CHOICES = [null, 0, 0.5, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];

function Choices() {
  return <div className="Choice-List">{CHOICES.map(choice => <SelectCard key={choice} value={choice}/>)}</div>;
}

function ShowButton() {
  const { setRevealed } = UIContext.useContext();
  const handleClick = () => setRevealed(true);
  return <button onClick={handleClick}>Show Cards</button>;
}

function ResetButton() {
  const { setRevealed, setSelection } = UIContext.useContext();
  const handleClick = () => {
    setRevealed(false);
    setSelection(undefined);
  };
  return <button onClick={handleClick}>New Round</button>;
}

function Controls() {
  const { revealed } = UIContext.useContext();
  return <div>
    <Choices/>
    <hr className="Show-Reset-Controls"/>
    {revealed ? <ResetButton/> : <ShowButton/>}
  </div>;
}

function Results() {
  const { revealed } = UIContext.useContext();
  const { stats } = GameContext.useContext();
  return revealed ? <table className="Results"><tbody>
    <tr><td align="right">Mean:</td><td>{Math.round(100*stats.mean) / 100}</td></tr>
  </tbody></table> : null;
}

function App() {
  const [ready, setReady] = useState(window.localStorage.name?.length > 0);
  return <div className="App">
    <h1>Knockoff Planning Poker</h1>
    {ready ? <GameContext>
      <SocketFuncsContext>
        <UIContext>
          <SocketHandler>
            <Playfield/>
            <Controls/>
            <Results/>
            <Version/>
          </SocketHandler>
        </UIContext>
      </SocketFuncsContext>
    </GameContext> :
    <NamePrompt setReady={setReady}/>}
  </div>;
}

export default App;
