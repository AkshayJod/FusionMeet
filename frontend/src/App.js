import './App.css';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme/theme';
import LandingPage from './pages/landing';
import Authentication from './pages/authentication';
import { AuthProvider } from './contexts/AuthContext';
import VideoMeetComponent from './pages/VideoMeet';
import HomeComponent from './pages/home';
import History from './pages/history';
import CameraTest from './components/CameraTest';
import CalendarView from './components/CalendarView';
import { NotificationProvider } from './components/NotificationSystem';
import NotificationSystem from './components/NotificationSystem';
import ErrorBoundary from './components/ErrorBoundary';

function App() {

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="App">
          <NotificationProvider>
            <Router>
              <AuthProvider>
                <Routes>
                  <Route path='/' element={<LandingPage />} />
                  <Route path='/auth' element={<Authentication />} />
                  <Route path='/home' element={<HomeComponent />} />
                  <Route path='/calendar' element={<CalendarView />} />
                  <Route path='/history' element={<History />} />
                  <Route path='/camera-test' element={<CameraTest />} />

                  <Route path='/:meetingId' element={<VideoMeetComponent />} />
                </Routes>
              </AuthProvider>
            </Router>
            <NotificationSystem />
          </NotificationProvider>
        </div>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
