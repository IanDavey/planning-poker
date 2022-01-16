import { createContext, useContext, useState } from 'react';
import './App.css';

function SelectionContext({ children }) {
  const [value, setValue] = useState(undefined);
  const handleValueChange = newValue => {
    setValue(newValue);
    // send message to server about selection
  };
  return <SelectionContext.Context.Provider value={[value, handleValueChange]}>{children}</SelectionContext.Context.Provider>
}
SelectionContext.Context = createContext([]);
SelectionContext.useContext = () => useContext(SelectionContext.Context);

function RevealContext({ children }) {
  const [value, setValue] = useState(false);
  const handleValueChange = newValue => {
    setValue(newValue);
    if (newValue) {
      // send message to server for reveal
    } else {
      // send message to server for reset
    }
  };
  return <RevealContext.Context.Provider value={[value, handleValueChange]}>{children}</RevealContext.Context.Provider>
}
RevealContext.Context = createContext([]);
RevealContext.useContext = () => useContext(RevealContext.Context);

class GameObject {
  constructor() {
    // prompt for name, generate guisd
    this.players = [ // add as they join
      <PlayCard key={1} name="Person1"/>,
      <PlayCard key={2} name="Person2"/>,
      <PlayCard key={3} name="Person3"/>,
      <PlayCard key={4} name="Person4"/>,
      <PlayCard key={5} name="Person5"/>,
      <PlayCard key={6} name="Person6"/>
    ];
    this.me = { name: "Person1", guid: 1 };
  }

  setListener(onChange) { this._update = () => onChange(this); }
}

function GameContext({ children }) {
  const [value, setValue] = useState(new GameObject());
  value.setListener(setValue);
  return <GameContext.Context.Provider value={value}>{children}</GameContext.Context.Provider>
}
GameContext.Context = createContext([]);
GameContext.useContext = () => useContext(GameContext.Context);

function Card({ name, value, onSelect }) {
  value = value !== undefined ?
    isNaN(Number.parseFloat(value)) ? "?" : value :
    "";
  return <table><tbody>
    <tr><td><div className="Card-Display" onClick={onSelect}><span className="Card-Value">{value.toString()}</span></div></td></tr>
    <tr><td className="Name-Label">{name}</td></tr>
  </tbody></table>;
}

function PlayCard({ name, value }) {
  return <div className="PlayCard"><Card name={name} value={value}/></div>;
}

function SelectCard({ value }) {
  const [selection, setSelection] = SelectionContext.useContext();
  const selected = selection === value;
  return <div className={selected ? "SelectedCard" : ""}><Card value={value} onSelect={() => setSelection(selected ? undefined : value)}/></div>;
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
  const setReveal = RevealContext.useContext()[1];
  const handleClick = () => setReveal(true);
  return <button onClick={handleClick}>Show Cards</button>;
}

function ResetButton() {
  const setReveal = RevealContext.useContext()[1];
  const setSelection = SelectionContext.useContext()[1];
  const handleClick = () => {
    setReveal(false);
    setSelection(undefined);
  };
  return <button onClick={handleClick}>New Round</button>;
}

function Controls() {
  const visible = RevealContext.useContext()[0];
  return <SelectionContext>
    <Choices/>
    {visible ? <ResetButton/> : <ShowButton/>}
  </SelectionContext>;
}

function Results() {
  const visible = RevealContext.useContext()[0];
  return visible ? <table className="Results"><tbody>
    <tr><td align="right">Mean:</td><td>3</td></tr>
    <tr><td align="right">Mode:</td><td>2</td></tr>
  </tbody></table> : null;
}

function App() {
  return <div className="App">
    <GameContext>
      <RevealContext>
        <h1>Knockoff Planning Poker</h1>
        <Playfield
          headCard={<PlayCard key={1} name="Person1"/>}
          footCard={<PlayCard key={2} name="Person2"/>}
          upperCards={[<PlayCard key={3} name="Person3"/>, <PlayCard key={4} name="Person4"/>, <PlayCard key={6} name="Person6"/>, <PlayCard key={7} name="Person7"/>]}
          lowerCards={[<PlayCard key={5} name="Person5"/>]}
        />
        <Controls/>
        <Results/>
      </RevealContext>
    </GameContext>
  </div>;
}

export default App;
