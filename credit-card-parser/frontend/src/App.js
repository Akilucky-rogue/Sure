import './App.css';
import CcStatementParser from './components/CcStatementParser';

function App() {
  return (
    <div className="App">
      <div style={{maxWidth:1100, margin:'0 auto', padding:20}}>
        <header style={{marginBottom:18}}>
          <h1 style={{margin:0}}>Statement Tools</h1>
          <p style={{margin:0, color:'#6b7280'}}>Quick utilities to extract and inspect card-like numbers from statements.</p>
        </header>
        <CcStatementParser />
      </div>
    </div>
  );
}

export default App;
