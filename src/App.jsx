import Dashboard from './pages/Dashboard.jsx';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Finance Dashboard</h1>
        <p className="app-subtitle">Market data for IBM and major competitors</p>
      </header>
      <main className="app-main">
        <Dashboard />
      </main>
      <footer className="app-footer">
        <p>Data provided via Yahoo Finance. For demonstration purposes only.</p>
      </footer>
    </div>
  );
}

export default App;
