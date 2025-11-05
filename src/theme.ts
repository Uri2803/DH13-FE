// src/theme.ts
import { createTheme } from '@mui/material/styles';

// --- MÃ MÀU CHUẨN TỪ BRANDING ---
const PRIMARY_BLUE = '#00529B'; // Xanh đậm
const CYAN_BLUE = '#00ADEF';
const FIRE_ORANGE = '#F7931E'; // Cam
const TEXT_RED = '#E65C19';

const theme = createTheme({
  palette: {
    primary: { main: PRIMARY_BLUE },
    secondary: { main: FIRE_ORANGE },
    info: { main: CYAN_BLUE },
    error: { main: TEXT_RED },
    
    // --- SỬA Ở ĐÂY ---
    background: {
      default: '#ffffff', // Đổi nền trang thành màu trắng
    },
    // ------------------
  },

  typography: {
    fontFamily: ['"Be Vietnam Pro"', 'Roboto', 'sans-serif'].join(','),
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600, color: PRIMARY_BLUE },
    h5: { fontWeight: 600, color: PRIMARY_BLUE },
  },

  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 8px 24px rgba(0, 82, 155, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          transition: 'transform 0.2s ease',
          '&:hover': {
            transform: 'scale(1.03)', // Phóng to nhẹ khi hover
          },
        },
      },
    },
  },
});

export default theme;