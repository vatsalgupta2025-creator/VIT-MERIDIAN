export type BusRoute = {
  id: string;
  routeNumber: string;
  startPoint: string;
  endPoint: string;
  driverName: string;
  driverPhone: string;
  status: 'on_time' | 'delayed' | 'boarding';
  currentLocation?: string; // e.g. "Tambaram Sanatorium"
  delayMinutes?: number;
  stops: {
    name: string;
    expectedTimeMorn: string;
    expectedTimeEve: string;
    lat?: number;
    lng?: number;
  }[];
};

export type BusPass = {
  studentId: string;
  studentName: string;
  registrationNumber: string;
  routeAssigned: string;
  boardingPoint: string;
  validUntil: string;
  status: 'active' | 'expired' | 'pending';
};

export const MOCK_BUS_ROUTES: BusRoute[] = [
  {
    id: 'route-1',
    routeNumber: '1',
    startPoint: 'Tambaram',
    endPoint: 'VIT Chennai',
    driverName: 'Ramesh K.',
    driverPhone: '+91 98765 43210',
    status: 'on_time',
    currentLocation: 'Perungalathur',
    stops: [
      { name: 'Tambaram Junction', expectedTimeMorn: '07:10 AM', expectedTimeEve: '06:00 PM' },
      { name: 'Tambaram Sanatorium', expectedTimeMorn: '07:15 AM', expectedTimeEve: '05:55 PM' },
      { name: 'Perungalathur', expectedTimeMorn: '07:25 AM', expectedTimeEve: '05:45 PM' },
      { name: 'Vandalur Zoo', expectedTimeMorn: '07:35 AM', expectedTimeEve: '05:35 PM' },
      { name: 'Kandigai', expectedTimeMorn: '07:50 AM', expectedTimeEve: '05:20 PM' },
      { name: 'VIT Chennai', expectedTimeMorn: '08:00 AM', expectedTimeEve: '05:10 PM' },
    ]
  },
  {
    id: 'route-2',
    routeNumber: '2',
    startPoint: 'Velachery',
    endPoint: 'VIT Chennai',
    driverName: 'Suresh M.',
    driverPhone: '+91 98765 43211',
    status: 'delayed',
    currentLocation: 'Medavakkam',
    delayMinutes: 15,
    stops: [
      { name: 'Velachery MRTS', expectedTimeMorn: '07:00 AM', expectedTimeEve: '06:10 PM' },
      { name: 'Pallikaranai', expectedTimeMorn: '07:15 AM', expectedTimeEve: '05:55 PM' },
      { name: 'Medavakkam', expectedTimeMorn: '07:25 AM', expectedTimeEve: '05:45 PM' },
      { name: 'Mambakkam', expectedTimeMorn: '07:45 AM', expectedTimeEve: '05:25 PM' },
      { name: 'VIT Chennai', expectedTimeMorn: '08:00 AM', expectedTimeEve: '05:10 PM' },
    ]
  },
  {
    id: 'route-4',
    routeNumber: '4',
    startPoint: 'Adyar',
    endPoint: 'VIT Chennai',
    driverName: 'Murugan P.',
    driverPhone: '+91 98765 43212',
    status: 'boarding',
    stops: [
      { name: 'Adyar Depot', expectedTimeMorn: '06:45 AM', expectedTimeEve: '06:30 PM' },
      { name: 'Thiruvanmiyur', expectedTimeMorn: '06:55 AM', expectedTimeEve: '06:20 PM' },
      { name: 'Sholinganallur', expectedTimeMorn: '07:15 AM', expectedTimeEve: '06:00 PM' },
      { name: 'Navalur', expectedTimeMorn: '07:30 AM', expectedTimeEve: '05:45 PM' },
      { name: 'Kelambakkam', expectedTimeMorn: '07:45 AM', expectedTimeEve: '05:30 PM' },
      { name: 'VIT Chennai', expectedTimeMorn: '08:00 AM', expectedTimeEve: '05:10 PM' },
    ]
  }
];

export const MY_BUS_PASS: BusPass = {
  studentId: 'student-123',
  studentName: 'Vatsal Gupta',
  registrationNumber: '21BCE1000',
  routeAssigned: '1',
  boardingPoint: 'Perungalathur',
  validUntil: '2024-05-31',
  status: 'active'
};

export const TRANSPORT_ANNOUNCEMENTS = [
  { id: 1, text: "Route 2 is delayed by 15 mins due to heavy traffic near Medavakkam.", type: "warning", time: "10 mins ago" },
  { id: 2, text: "Evening buses will depart at 5:30 PM instead of 5:10 PM today due to the special event.", type: "info", time: "2 hours ago" }
];
