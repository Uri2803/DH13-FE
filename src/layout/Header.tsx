// src/layout/Header.tsx
import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Container,
  Avatar,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SendIcon from '@mui/icons-material/Send'; // Icon Gửi lời chúc

export default function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar
      // 1. LUÔN DÍNH Ở TRÊN
      position="sticky"
      sx={{
        // 2. HIỆU ỨNG KÍNH MỜ (GLASSMORPHISM)
        backgroundColor: 'rgba(255, 255, 255, 0.7)', // Nền trắng mờ
        backdropFilter: 'blur(10px)', // Hiệu ứng mờ
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)', // Đổ bóng nhẹ
        color: 'primary.main', // Chữ/icon màu xanh
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          {isMobile ? (
            // --- GIAO DIỆN MOBILE (LOGO) ---
            <>
              <Avatar
                src="/logo-square.png" // Logo trong /public
                alt="Logo Đại hội"
                sx={{ width: 40, height: 40 }}
              />
              <Box sx={{ flexGrow: 1 }} />
              <IconButton
                color="primary" // Màu xanh
                aria-label="menu"
                onClick={handleMenuClick}
                edge="end"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                sx={{ mt: '40px' }}
              >
                <MenuItem onClick={handleMenuClose}>Gửi lời chúc</MenuItem>
                <MenuItem onClick={handleMenuClose}>Đăng nhập Đại biểu</MenuItem>
              </Menu>
            </>
          ) : (
            // --- GIAO DIỆN DESKTOP (CHỮ) ---
            <>
              <Typography
                variant="h6"
                component="div"
                sx={{ flexGrow: 1, fontWeight: 700 }} // Chữ đậm
              >
                Đại hội Hội Sinh viên Trường Đại học Khoa học Tự nhiên, ĐHQG-HCM lần thứ XIII
              </Typography>

              {/* 3. NÚT BẤM "LỬA" (MÀU CAM) */}
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Button
                  variant="contained"
                  color="secondary" // Dùng màu cam (lửa)
                  startIcon={<SendIcon />}
                  sx={{ fontWeight: 600 }}
                >
                  Gửi lời chúc
                </Button>
                <Button
                  variant="outlined" // Nút viền
                  color="primary" // Màu xanh
                  sx={{ fontWeight: 600 }}
                >
                  Đăng nhập Đại biểu
                </Button>
              </Box>
            </>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}