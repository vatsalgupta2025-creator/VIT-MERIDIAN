// VIT Chennai Hostel Data
export interface RoomType {
  type: string;
  ac: boolean;
}

export interface MessInfo {
  hallName: string;
  types: string[];
  note?: string;
}

export interface WardenContact {
  names: string[];
  email: string | null;
  phone: string | null;
  note?: string;
  label?: string;
}

export interface Hostel {
  id: string;
  name: string;
  category: 'Men\'s Hostel' | 'Ladies Hostel';
  yearGroup: string;
  tags: string[];
  acStatus: 'full' | 'partial' | 'none';
  accent: string;
  accentBg: string;
  accentText: string;
  roomTypes: RoomType[];
  mess: MessInfo;
  warden: WardenContact;
  secondaryWarden?: WardenContact;
  videoTourUrl: string | null;
  description: string;
}

export interface CentralAdmin {
  role: string;
  name: string;
  email: string;
  phone: string | null;
}

export const hostels: Hostel[] = [
  {
    id: 'block-a',
    name: 'A Block',
    category: "Men's Hostel",
    yearGroup: 'Mixed',
    tags: ['AC', 'Non-AC'],
    acStatus: 'partial',
    accent: '#3b82f6',
    accentBg: 'rgba(59,130,246,0.12)',
    accentText: '#60a5fa',
    description: 'One of the largest men\'s hostels offering both AC and Non-AC room options for students across all years.',
    roomTypes: [
      { type: '4-Sharing', ac: true },
      { type: '4-Sharing', ac: false },
      { type: '2-Sharing', ac: false },
      { type: '3-Sharing', ac: true },
    ],
    mess: {
      hallName: 'PR Caterers / Darling Mess Hall',
      types: ['South Veg', 'North Veg', 'South Non-Veg', 'North Non-Veg'],
    },
    warden: {
      names: ['Dr. Manikandan P.', 'Dr. Sunil Kumar Pradhan'],
      email: 'wmha.cc@vit.ac.in',
      phone: '044-3993 1205',
    },
    videoTourUrl: null,
  },
  {
    id: 'block-b',
    name: 'B Block',
    category: 'Ladies Hostel',
    yearGroup: 'Mixed',
    tags: ['AC', 'Non-AC'],
    acStatus: 'partial',
    accent: '#f59e0b',
    accentBg: 'rgba(245,158,11,0.12)',
    accentText: '#fbbf24',
    description: 'A ladies hostel providing comfortable mixed accommodation options with central dining facilities.',
    roomTypes: [
      { type: '2-Sharing', ac: true },
      { type: '3-Sharing', ac: true },
      { type: '4-Sharing', ac: false },
    ],
    mess: {
      hallName: 'Central Mess (PR Caterers & Fusion Dining)',
      types: ['Veg', 'Non-Veg', 'Special Mess'],
    },
    warden: {
      names: [],
      email: null,
      phone: null,
      note: 'Managed under Central Ladies Hostel administration — contact central office for details.',
    },
    videoTourUrl: null,
  },
  {
    id: 'block-c',
    name: 'C Block',
    category: 'Ladies Hostel',
    yearGroup: 'Freshers & Seniors',
    tags: ['Mixed Seniority'],
    acStatus: 'partial',
    accent: '#8b5cf6',
    accentBg: 'rgba(139,92,246,0.12)',
    accentText: '#a78bfa',
    description: 'A ladies hostel welcoming both freshers and senior students, fostering a vibrant campus community.',
    roomTypes: [
      { type: '2-Sharing', ac: true },
      { type: '3-Sharing', ac: false },
      { type: '4-Sharing', ac: false },
    ],
    mess: {
      hallName: 'Central Mess (PR Caterers & Fusion Dining)',
      types: ['Veg', 'Non-Veg', 'Special Mess'],
    },
    warden: {
      names: ['Dr. Mansoor Hussain D.', 'Dr. Ankit Kumar'],
      email: 'wmhc.cc@vit.ac.in',
      phone: '044-3993 1180',
    },
    videoTourUrl: null,
  },
  {
    id: 'block-d',
    name: 'D Block',
    category: "Men's Hostel",
    yearGroup: '3rd Year',
    tags: ['Full AC'],
    acStatus: 'full',
    accent: '#10b981',
    accentBg: 'rgba(16,185,129,0.12)',
    accentText: '#34d399',
    description: 'Premium fully air-conditioned men\'s hostel for 3rd year students, featuring a food park with à-la-carte options.',
    roomTypes: [
      { type: '4-Sharing', ac: true },
      { type: '2-Sharing', ac: true },
      { type: '6-Sharing', ac: true },
    ],
    mess: {
      hallName: 'D-Block Food Park & CR Caterers Hall (Grace & Proodle)',
      types: ['Veg', 'Non-Veg', 'Special Mess', 'Food Park À-la-carte'],
    },
    warden: {
      names: ['Dr. Trilok Nath Pandey', 'Dr. Sankar P.'],
      email: 'wmhd.cc@vit.ac.in',
      phone: '044-3993 1668',
      label: 'D Block',
    },
    secondaryWarden: {
      names: ['Dr. Natarajan B.', 'Prof. Tanmay Roy'],
      email: 'wmhd2.cc@vit.ac.in',
      phone: '044-3993 1518',
      label: 'D2 Sub-Block',
    },
    videoTourUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: 'block-e',
    name: 'E Block',
    category: "Men's Hostel",
    yearGroup: '2nd Year',
    tags: ['Full AC'],
    acStatus: 'full',
    accent: '#f97316',
    accentBg: 'rgba(249,115,22,0.12)',
    accentText: '#fb923c',
    description: 'Fully air-conditioned men\'s hostel for 2nd year students with modern dining options.',
    roomTypes: [
      { type: '4-Sharing', ac: true },
      { type: '2-Sharing', ac: true },
      { type: '6-Sharing', ac: true },
    ],
    mess: {
      hallName: 'Zen Dining Hall / Modern Food Court (Grace & Proodle)',
      types: ['Veg', 'Non-Veg', 'Special Mess', 'Food Court'],
    },
    warden: {
      names: ['Dr. Rajeesh C. S.'],
      email: 'wmhe.cc@vit.ac.in',
      phone: '044-3993 1231',
    },
    videoTourUrl: null,
  },
  {
    id: 'block-f',
    name: 'F Block',
    category: "Men's Hostel",
    yearGroup: 'Freshers',
    tags: ['AC', 'Non-AC'],
    acStatus: 'partial',
    accent: '#06b6d4',
    accentBg: 'rgba(6,182,212,0.12)',
    accentText: '#22d3ee',
    description: 'The freshers\' men\'s hostel designed to help first-year students settle into campus life comfortably.',
    roomTypes: [
      { type: '2-Sharing', ac: true },
      { type: '3-Sharing', ac: true },
      { type: '4-Sharing', ac: false },
    ],
    mess: {
      hallName: 'Mess Hall (to be confirmed)',
      types: ['Veg', 'Non-Veg'],
      note: 'Mess hall details are being updated. Please check with the hostel office.',
    },
    warden: {
      names: [],
      email: null,
      phone: null,
      note: 'Warden details will be updated soon. Contact central administration for assistance.',
    },
    videoTourUrl: null,
  },
];

export const centralAdmin: CentralAdmin[] = [
  {
    role: 'Director (Hostels)',
    name: 'Dr. Janardhan Reddy K',
    email: 'chennai.dirhostel@vit.ac.in',
    phone: '044-3993 1272',
  },
  {
    role: 'Deputy Director (Men\'s Hostel)',
    name: 'Dr. Felix A.',
    email: 'chennai.dydirectormh@vit.ac.in',
    phone: '044-3993 1321',
  },
  {
    role: 'Warden (Food)',
    name: 'Dr. Abhijit Mishra',
    email: 'wmhfood.cc@vit.ac.in',
    phone: null,
  },
  {
    role: 'Warden (Discipline)',
    name: 'Dr. Murali Mohan G.',
    email: 'wmhdiscipline.cc@vit.ac.in',
    phone: '044-3993 1180',
  },
  {
    role: 'Warden (Maintenance)',
    name: 'Dr. Mohamed Imran A.',
    email: 'wmhmaintenance.cc@vit.ac.in',
    phone: '044-3993 1556',
  },
];
