import { useAuth } from './contexts/AuthContext';
import Header from './components/Header';

export default function App() {
  const { isLoggedIn } = useAuth();

  return (
    <div className='App'>
      <Header />
      {isLoggedIn ? <LoggedInText /> : <LoggedOutText />}
    </div>
  );
}

const LoggedInText = () => {
  const { account } = useAuth();
  return <p>Hey, {account.username}! I'm happy to let you know: you are authenticated!</p>;
};

const LoggedOutText = () => (
  <div>
    <p>Don't forget to start your backend server, then authenticate yourself.</p>
    <h1>LockedIn</h1>
  </div>
  );
  const Navbar = () => {
    return (
      <nav className="navbar">
        <h1>LockedIn</h1>
        <ul>
          <li>Home</li>
          <li>Chatbot</li>
          <li>Grades Analyzer</li>
          <li>Improvement Suggestions</li>
        </ul>
      </nav>
    );
  };
  
  // Chatbot Component
  const Chatbot = () => {
    return (
      <div>
        <h2>AI Chatbot</h2>
        <p>Ask me anything about your studies!</p>
        {/* Add a chatbot UI component here */}
      </div>
    );
  };
  
  // Grades Analyzer Component
  const GradesAnalyzer = () => {
    return (
      <div>
        <h2>Grades Trend Analyzer</h2>
        <p>Visualize your grades over time.</p>
        {/* Add a chart or graph component here */}
      </div>
    );
  };
  
  // Improvement Suggestions Component
  const ImprovementSuggestions = () => {
    return (
      <div>
        <h2>Grades Improvement Suggestions</h2>
        <p>Get personalized tips to improve your grades.</p>
        {/* Add suggestions list or tips component here */}
      </div>
    );
  };
  
  // Main Bar Component
  const MainContent = () => {
    return (
      <div className="App">
        <Navbar />
        <main>
          <Chatbot />
          <GradesAnalyzer />
          <ImprovementSuggestions />
        </main>
      </div>
    );
  };



