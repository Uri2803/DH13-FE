
export const mockDelegates = [
  {
    id: '1',
    unit: 'Khoa Toán - Tin học',
    delegateCode: 'DT001',
    fullName: 'Nguyễn Văn An',
    position: 'Chủ tịch Hội sinh viên khoa',
    studentId: '20120001',
    birthDate: '2002-05-15',
    gender: 'Nam',
    religion: 'Không',
    ethnicity: 'Kinh',
    unionJoinDate: '2020-09-01',
    partyJoinDate: '2022-03-15',
    partyMember: true,
    isStudent: true,
    academicYear: 4,
    gpa: 3.75,
    achievements: 'Sinh viên xuất sắc, Giải nhất Olympic Toán học',
    shirtSize: 'L',
    phone: '0901234567',
    email: 'nguyenvanan@student.hcmus.edu.vn',
    checkedIn: true,
    checkinTime: '2024-12-19T08:30:00Z'
  },
  {
    id: '2',
    unit: 'Khoa Vật lý - Vật lý kỹ thuật',
    delegateCode: 'DT002',
    fullName: 'Trần Thị Bình',
    position: 'Phó Chủ tịch Hội sinh viên khoa',
    studentId: '20120002',
    birthDate: '2002-08-20',
    gender: 'Nữ',
    religion: 'Công giáo',
    ethnicity: 'Kinh',
    unionJoinDate: '2020-09-01',
    partyJoinDate: '',
    partyMember: false,
    isStudent: true,
    academicYear: 4,
    gpa: 3.85,
    achievements: 'Sinh viên giỏi, Giải nhì cuộc thi Khoa học kỹ thuật',
    shirtSize: 'M',
    phone: '0901234568',
    email: 'tranthibinh@student.hcmus.edu.vn',
    checkedIn: false,
    checkinTime: null
  },
  {
    id: '3',
    unit: 'Khoa Hóa học',
    delegateCode: 'DT003',
    fullName: 'Lê Minh Cường',
    position: 'Ủy viên Ban chấp hành',
    studentId: '20120003',
    birthDate: '2001-12-10',
    gender: 'Nam',
    religion: 'Phật giáo',
    ethnicity: 'Kinh',
    unionJoinDate: '2019-09-01',
    partyJoinDate: '2021-11-20',
    partyMember: true,
    isStudent: true,
    academicYear: 5,
    gpa: 3.65,
    achievements: 'Sinh viên 5 tốt, Tham gia nghiên cứu khoa học',
    shirtSize: 'XL',
    phone: '0901234569',
    email: 'leminhcuong@student.hcmus.edu.vn',
    checkedIn: true,
    checkinTime: '2024-12-19T09:15:00Z'
  }
];

export const mockWishes = [
  {
    id: '1',
    senderName: 'Nguyễn Văn An',
    senderPosition: 'Chủ tịch Hội sinh viên khoa Toán - Tin học',
    content: 'Chúc Đại hội thành công tốt đẹp, đoàn kết và phát triển mạnh mẽ!',
    isDelegate: true,
    createdAt: '2024-12-19T10:00:00Z'
  },
  {
    id: '2',
    senderName: 'Trần Thị Mai',
    senderPosition: 'Sinh viên năm 3',
    content: 'Chúc các anh chị đại biểu sức khỏe và thành công trong nhiệm kỳ mới!',
    isDelegate: false,
    createdAt: '2024-12-19T10:30:00Z'
  }
];

export const mockDocuments = [
  {
    id: '1',
    title: 'Báo cáo hoạt động nhiệm kỳ 2022-2024',
    description: 'Tổng kết các hoạt động và thành tích của Hội sinh viên trong nhiệm kỳ vừa qua',
    fileUrl: '#',
    isActive: true,
    uploadDate: '2024-12-15T00:00:00Z'
  },
  {
    id: '2',
    title: 'Điều lệ Hội sinh viên',
    description: 'Điều lệ và quy định hoạt động của Hội sinh viên trường',
    fileUrl: '#',
    isActive: true,
    uploadDate: '2024-12-10T00:00:00Z'
  },
  {
    id: '3',
    title: 'Kế hoạch hoạt động 2024-2026',
    description: 'Kế hoạch và định hướng phát triển cho nhiệm kỳ mới',
    fileUrl: '#',
    isActive: false,
    uploadDate: '2024-12-18T00:00:00Z'
  }
];
