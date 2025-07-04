import React from 'react';
import AppRoutes from './routes';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

const darkTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

const App = () => {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AppRoutes />
    </ThemeProvider>
  );
};

export default App;
