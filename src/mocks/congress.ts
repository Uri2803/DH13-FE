// src/mocks/congress.ts

// --- Interfaces dùng chung ---

export interface CongressUpdate {
  id: string;
  title: string;
  description: string;
  location: string;
  scheduledTime: string;
  status: 'completed' | 'ongoing' | 'upcoming';
  priority: number;
  createdAt: string;
  imageUrls: string[];
}

export interface CongressInfo {
  id: string;
  title: string;
  content: string;
  imageUrl: string; // BẮT BUỘC
  isHighlight: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  fileSize: string;
  category: string;
  isPublic: boolean;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

// --- Mock data cho diễn biến Đại hội ---

export const mockCongressUpdates: CongressUpdate[] = [
  {
    id: '1',
    title: 'Khai mạc Đại hội',
    description:
      'Lễ khai mạc Đại hội Hội sinh viên lần thứ X nhiệm kỳ 2024-2026 với sự tham dự của 150 đại biểu từ 15 khoa/viện.',
    location: 'Hội trường A, ĐHQG-HCM',
    scheduledTime: '2024-12-20T08:00:00Z',
    status: 'completed',
    priority: 1,
    createdAt: '2024-12-20T08:30:00Z',
    imageUrls: [
      'https://readdy.ai/api/search-image?query=Vietnamese%20university%20congress%20opening%20ceremony%20with%20students%20delegates%20sitting%20in%20formal%20auditorium%2C%20Vietnamese%20flag%20displayed%20prominently%2C%20official%20podium%20with%20speakers%2C%20professional%20academic%20atmosphere%2C%20bright%20lighting%2C%20wide%20angle%20view%20showing%20organized%20seating%20arrangement%20and%20ceremonial%20decorations&width=600&height=400&seq=congress1a&orientation=landscape',
      'https://readdy.ai/api/search-image?query=Vietnamese%20university%20congress%20opening%20ceremony%20close%20up%20view%20of%20student%20leaders%20on%20stage%20giving%20opening%20speech%2C%20formal%20academic%20attire%2C%20microphone%20and%20podium%2C%20professional%20lighting%2C%20ceremonial%20atmosphere%20with%20flowers%20and%20banners&width=600&height=400&seq=congress1b&orientation=landscape',
      'https://readdy.ai/api/search-image?query=Vietnamese%20university%20congress%20opening%20ceremony%20audience%20view%20showing%20diverse%20student%20delegates%20from%20different%20faculties%2C%20formal%20seating%20arrangement%2C%20attentive%20listening%2C%20academic%20conference%20atmosphere%2C%20modern%20auditorium%20setting&width=600&height=400&seq=congress1c&orientation=landscape',
    ],
  },
  {
    id: '2',
    title: 'Báo cáo hoạt động nhiệm kỳ 2022-2024',
    description:
      'Trình bày báo cáo tổng kết các hoạt động và thành tích của Hội sinh viên trong nhiệm kỳ vừa qua.',
    location: 'Hội trường A, ĐHQG-HCM',
    scheduledTime: '2024-12-20T09:30:00Z',
    status: 'ongoing',
    priority: 2,
    createdAt: '2024-12-20T09:00:00Z',
    imageUrls: [
      'https://readdy.ai/api/search-image?query=Vietnamese%20university%20student%20leader%20presenting%20annual%20report%20on%20stage%20with%20projection%20screen%20showing%20charts%20and%20achievements%2C%20audience%20of%20student%20delegates%20listening%20attentively%2C%20modern%20conference%20hall%20setting%2C%20professional%20presentation%20atmosphere&width=600&height=400&seq=congress2a&orientation=landscape',
      'https://readdy.ai/api/search-image?query=Vietnamese%20university%20congress%20presentation%20screen%20showing%20detailed%20charts%20graphs%20and%20statistics%20of%20student%20activities%20achievements%2C%20colorful%20infographics%2C%20professional%20data%20visualization%2C%20modern%20conference%20room%20setting&width=600&height=400&seq=congress2b&orientation=landscape',
    ],
  },
  {
    id: '3',
    title: 'Bầu cử Ban chấp hành - Đã bầu ra 23 đồng chí',
    description:
      'Đại hội đã tiến hành bầu cử và bầu ra 23 đồng chí vào Ban chấp hành Hội sinh viên nhiệm kỳ 2024-2026. Các đồng chí được bầu đều là những sinh viên xuất sắc, có uy tín và nhiệt huyết với công tác Hội.',
    location: 'Hội trường A, ĐHQG-HCM',
    scheduledTime: '2024-12-21T09:00:00Z',
    status: 'completed',
    priority: 3,
    createdAt: '2024-12-21T11:00:00Z',
    imageUrls: [
      'https://readdy.ai/api/search-image?query=Vietnamese%20university%20student%20election%20results%20announcement%20with%2023%20newly%20elected%20executive%20committee%20members%20standing%20on%20stage%2C%20celebration%20atmosphere%20with%20applause%20from%20delegates%2C%20official%20ceremony%20with%20flowers%20and%20congratulatory%20banners%2C%20formal%20academic%20setting&width=600&height=400&seq=congress6a&orientation=landscape',
      'https://readdy.ai/api/search-image?query=Vietnamese%20university%20student%20election%20voting%20process%20with%20ballot%20boxes%20and%20democratic%20procedures%2C%20students%20casting%20votes%2C%20organized%20election%20setup%2C%20transparent%20democratic%20process%2C%20formal%20academic%20environment&width=600&height=400&seq=congress6b&orientation=landscape',
      'https://readdy.ai/api/search-image?query=Vietnamese%20university%20newly%20elected%20student%20executive%20committee%20members%20group%20photo%2C%2023%20young%20leaders%20in%20formal%20attire%2C%20congratulatory%20atmosphere%2C%20official%20ceremony%20backdrop%2C%20professional%20group%20portrait%20setting&width=600&height=400&seq=congress6c&orientation=landscape',
    ],
  },
  {
    id: '4',
    title: 'Thảo luận tổ',
    description:
      'Các đại biểu thảo luận về báo cáo hoạt động và đóng góp ý kiến cho kế hoạch nhiệm kỳ mới.',
    location: 'Phòng họp B1, B2, B3',
    scheduledTime: '2024-12-20T14:00:00Z',
    status: 'completed',
    priority: 4,
    createdAt: '2024-12-20T08:00:00Z',
    imageUrls: [
      'https://readdy.ai/api/search-image?query=Vietnamese%20university%20students%20in%20small%20group%20discussion%20meeting%2C%20sitting%20around%20conference%20table%20with%20documents%20and%20notebooks%2C%20engaged%20conversation%20and%20collaboration%2C%20modern%20meeting%20room%20with%20natural%20lighting%2C%20diverse%20group%20of%20young%20delegates%20participating%20actively&width=600&height=400&seq=congress3a&orientation=landscape',
      'https://readdy.ai/api/search-image?query=Vietnamese%20university%20student%20group%20discussion%20with%20participants%20taking%20notes%20and%20sharing%20ideas%2C%20collaborative%20atmosphere%2C%20meeting%20room%20setting%20with%20whiteboards%20and%20documents%2C%20active%20participation%20and%20engagement&width=600&height=400&seq=congress3b&orientation=landscape',
    ],
  },
  {
    id: '5',
    title: 'Bế mạc Đại hội',
    description:
      'Lễ bế mạc Đại hội và công bố kết quả bầu cử Ban chấp hành mới.',
    location: 'Hội trường A, ĐHQG-HCM',
    scheduledTime: '2024-12-21T16:00:00Z',
    status: 'upcoming',
    priority: 5,
    createdAt: '2024-12-20T08:00:00Z',
    imageUrls: [
      'https://readdy.ai/api/search-image?query=Vietnamese%20university%20congress%20closing%20ceremony%20with%20newly%20elected%20student%20leaders%20on%20stage%2C%20celebration%20atmosphere%20with%20applause%20from%20delegates%2C%20ceremonial%20handover%20of%20responsibilities%2C%20festive%20academic%20environment%20with%20flowers%20and%20congratulatory%20banners&width=600&height=400&seq=congress5a&orientation=landscape',
    ],
  },
];

// --- Mock data cho tài liệu ---

export const mockDocuments: Document[] = [
  {
    id: '1',
    title: 'Văn kiện',
    description:
      'Văn kiện',
    fileUrl: '#',
    fileType: 'PDF',
    fileSize: '2.5 MB',
    category: 'Văn kiện',
    isPublic: true,
    uploadedBy: 'Admin',
    createdAt: '2024-12-21T10:00:00Z',
    updatedAt: '2024-12-21T10:00:00Z',
  },
  // {
  //   id: '2',
  //   title: 'Báo cáo hoạt động nhiệm kỳ 2022-2024',
  //   description:
  //     'Báo cáo tổng kết đầy đủ các hoạt động và thành tích của Hội sinh viên trong nhiệm kỳ vừa qua',
  //   fileUrl: '#',
  //   fileType: 'PDF',
  //   fileSize: '5.2 MB',
  //   category: 'Báo cáo',
  //   isPublic: true,
  //   uploadedBy: 'Admin',
  //   createdAt: '2024-12-20T09:00:00Z',
  //   updatedAt: '2024-12-20T09:00:00Z',
  // },
  // {
  //   id: '3',
  //   title: 'Danh sách đại biểu chính thức',
  //   description:
  //     'Danh sách 150 đại biểu chính thức tham dự Đại hội từ 15 khoa/viện',
  //   fileUrl: '#',
  //   fileType: 'Excel',
  //   fileSize: '1.8 MB',
  //   category: 'Danh sách',
  //   isPublic: false,
  //   uploadedBy: 'Admin',
  //   createdAt: '2024-12-19T14:00:00Z',
  //   updatedAt: '2024-12-19T14:00:00Z',
  // },
  // {
  //   id: '4',
  //   title: 'Quy chế tổ chức Đại hội',
  //   description:
  //     'Quy chế và thể lệ tổ chức Đại hội Hội sinh viên lần thứ X',
  //   fileUrl: '#',
  //   fileType: 'PDF',
  //   fileSize: '3.1 MB',
  //   category: 'Quy chế',
  //   isPublic: true,
  //   uploadedBy: 'Admin',
  //   createdAt: '2024-12-15T08:00:00Z',
  //   updatedAt: '2024-12-15T08:00:00Z',
  // },
];

// --- Mock data cho thông tin cập nhật Đại hội ---

export const mockCongressInfo: CongressInfo[] = [
  {
    id: '1',
    title: 'Đã bầu ra 23 đồng chí vào Ban chấp hành',
    content:
      'Đại hội đã tiến hành bầu cử thành công và bầu ra 23 đồng chí vào Ban chấp hành Hội sinh viên nhiệm kỳ 2024-2026. Các đồng chí được bầu đều là những sinh viên xuất sắc, có uy tín cao và nhiệt huyết với công tác Hội.',
    imageUrl:
      'https://readdy.ai/api/search-image?query=Vietnamese%20university%20student%20election%20results%20with%2023%20newly%20elected%20executive%20committee%20members%20in%20formal%20group%20photo%2C%20professional%20academic%20setting%2C%20congratulatory%20atmosphere%20with%20flowers%20and%20official%20banners%2C%20bright%20lighting&width=800&height=500&seq=info1&orientation=landscape',
    isHighlight: true,
    createdAt: '2024-12-21T11:00:00Z',
    updatedAt: '2024-12-21T11:00:00Z',
  },
  {
    id: '2',
    title: 'Thông qua Nghị quyết Đại hội',
    content:
      'Đại hội đã thông qua Nghị quyết với 5 mục tiêu chính cho nhiệm kỳ 2024-2026, tập trung vào phát triển học thuật, tình nguyện cộng đồng, văn hóa thể thao, hỗ trợ sinh viên và hợp tác quốc tế.',
    imageUrl:
      'https://readdy.ai/api/search-image?query=Vietnamese%20university%20congress%20resolution%20document%20signing%20ceremony%2C%20official%20papers%20on%20table%2C%20student%20leaders%20and%20faculty%20members%2C%20formal%20academic%20atmosphere%2C%20professional%20lighting&width=800&height=500&seq=info2&orientation=landscape',
    isHighlight: false,
    createdAt: '2024-12-21T10:00:00Z',
    updatedAt: '2024-12-21T10:00:00Z',
  },
];
