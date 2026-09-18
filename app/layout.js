import './globals.css';

export const metadata = {
  title: 'Quản lý Nhân sự',
  description: 'Hệ thống quản lý nhân sự nội bộ',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
