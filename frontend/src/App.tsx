import { CarList } from './components/CarList';

function App() {
  return (
    <div style={{ backgroundColor: '#f4f6f9', minHeight: '100vh', direction: 'rtl' }}>
      <header style={{ backgroundColor: '#1a73e8', color: '#fff', padding: '15px', textAlign: 'center' }}>
        <h1 style={{ margin: 0 }}>Mini Car Marketplace 🚗</h1>
      </header>
      <main>
        <CarList />
      </main>
    </div>
  );
}

export default App;