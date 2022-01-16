import './App.css';

function Card({ name, value, type = "play" }) {
  value = value !== undefined ?
    isNaN(Number.parseFloat(value)) ? "?" : value :
    "";
  return <table className={type === "play" ? "Card" : ""}>
    <tr><td><div className="Card-Display"><span className="Card-Value">{value.toString()}</span></div></td></tr>
    <tr><td className="Name-Label">{name}</td></tr>
  </table>
}

function Table() {
  return <div className="Table"/>;
}

function Playfield({ upperCards, lowerCards, headCard, footCard }) {
  return <table className="Playfield">
    <tr className="TableUpper"><td/>{upperCards.map(card => <td>{card}</td>)}<td/></tr>
    <tr className="TableRow">
      <td className="TableHead">{headCard}</td>
      <td colSpan={Math.max(upperCards.length, lowerCards.length, 1)}><Table/></td>
      <td className="TableFoot">{footCard}</td>
    </tr>
    <tr className="TableLower"><td/>{lowerCards.map(card => <td>{card}</td>)}<td/></tr>
  </table>
}

const CHOICES = [null, 0, 0.5, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];

function Choices() {
  return <div className="Choice-List">{CHOICES.map(choice => <Card value={choice} type="select"/>)}</div>
}

function App() {
  return <div className="App">
    <h1>Knockoff Planning Poker</h1>
    <Playfield
      headCard={<Card name="Person1"/>}
      footCard={<Card name="Person2"/>}
      upperCards={[<Card name="Person3"/>, <Card name="Person4"/>, <Card name="Person6"/>, <Card name="Person7"/>]}
      lowerCards={[<Card name="Person5"/>]}
    />
    <Choices/>
    <button>Show Cards</button>
  </div>;
}

export default App;
