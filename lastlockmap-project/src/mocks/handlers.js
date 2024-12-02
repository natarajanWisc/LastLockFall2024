import { http, HttpResponse } from 'msw';

// Mock data for conference room bookings
const mockBookings = [
  {
    "bookingId": "B001",
    "roomId": "R101",
    "roomName": "Truck Bay",
    "startTime": "2024-10-30T09:00:00Z",
    "endTime": "2024-10-30T09:30:00Z",
    "userId": "U123",
    "userName": "Jane Doe",
    "createdBy": "U123",
    "createdAt": "2024-10-29T12:30:00Z",
    "accessStatus": "Authorized"
  },
  {
    "bookingId": "B002",
    "roomId": "R102",
    "roomName": "Service and Storage",
    "startTime": "2024-10-30T09:15:00Z",
    "endTime": "2024-10-30T09:45:00Z",
    "userId": "U124",
    "userName": "John Smith",
    "createdBy": "U124",
    "createdAt": "2024-10-29T13:00:00Z",
    "accessStatus": "Authorized"
  },
  {
    "bookingId": "B003",
    "roomId": "R429",
    "roomName": "Conference Room A",
    "startTime": "2024-10-30T09:00:00Z",
    "endTime": "2024-10-30T09:30:00Z",
    "userId": "U125",
    "userName": "Alice Johnson",
    "createdBy": "U125",
    "createdAt": "2024-10-29T14:00:00Z",
    "accessStatus": "Authorized"
  },
  {
    "bookingId": "B004",
    "roomId": "R421",
    "roomName": "Conference Room B",
    "startTime": "2024-10-30T09:00:00Z",
    "endTime": "2024-10-30T10:00:00Z",
    "userId": "U126",
    "userName": "Bob Brown",
    "createdBy": "U126",
    "createdAt": "2024-10-29T15:00:00Z",
    "accessStatus": "Authorized"
  },
  {
    "bookingId": "B005",
    "roomId": "R422",
    "roomName": "Conference Room C",
    "startTime": "2024-10-30T10:15:00Z",
    "endTime": "2024-10-30T10:45:00Z",
    "userId": "U127",
    "userName": "Eve Davis",
    "createdBy": "U127",
    "createdAt": "2024-10-29T15:30:00Z",
    "accessStatus": "Authorized"
  },
  {
    "bookingId": "B006",
    "roomId": "R426",
    "roomName": "Conference Room D",
    "startTime": "2024-10-30T10:00:00Z",
    "endTime": "2024-10-30T10:45:00Z",
    "userId": "U127",
    "userName": "Jane Smith",
    "createdBy": "U140",
    "createdAt": "2024-10-29T15:30:00Z",
    "accessStatus": "Authorized"
  },
  {
    "bookingId": "B007",
    "roomId": "R101",
    "roomName": "Truck Bay",
    "startTime": "2024-10-30T10:30:00Z",
    "endTime": "2024-10-30T11:00:00Z",
    "userId": "U128",
    "userName": "Chris Lee",
    "createdBy": "U128",
    "createdAt": "2024-10-29T16:00:00Z",
    "accessStatus": "Authorized"
  },
  {
    "bookingId": "B008",
    "roomId": "R102",
    "roomName": "Service and Storage",
    "startTime": "2024-10-30T10:45:00Z",
    "endTime": "2024-10-30T11:15:00Z",
    "userId": "U123",
    "userName": "Jane Doe",
    "createdBy": "U123",
    "createdAt": "2024-10-29T17:00:00Z",
    "accessStatus": "Authorized"
  },
  {
    "bookingId": "B009",
    "roomId": "R429",
    "roomName": "Conference Room A",
    "startTime": "2024-10-30T11:00:00Z",
    "endTime": "2024-10-30T11:30:00Z",
    "userId": "U129",
    "userName": "Megan Hart",
    "createdBy": "U129",
    "createdAt": "2024-10-29T18:00:00Z",
    "accessStatus": "Authorized"
  },
  {
    "bookingId": "B010",
    "roomId": "R421",
    "roomName": "Conference Room B",
    "startTime": "2024-10-30T11:15:00Z",
    "endTime": "2024-10-30T11:45:00Z",
    "userId": "U124",
    "userName": "John Smith",
    "createdBy": "U124",
    "createdAt": "2024-10-29T18:30:00Z",
    "accessStatus": "Authorized"
  },
  {
    "bookingId": "B011",
    "roomId": "R422",
    "roomName": "Conference Room C",
    "startTime": "2024-10-30T11:30:00Z",
    "endTime": "2024-10-30T12:00:00Z",
    "userId": "U130",
    "userName": "Sam Turner",
    "createdBy": "U130",
    "createdAt": "2024-10-29T19:00:00Z",
    "accessStatus": "Authorized"
  },
  {
    "bookingId": "B012",
    "roomId": "R426",
    "roomName": "Conference Room D",
    "startTime": "2024-10-30T11:00:00Z",
    "endTime": "2024-10-30T11:30:00Z",
    "userId": "U127",
    "userName": "Jane Smith",
    "createdBy": "U140",
    "createdAt": "2024-10-29T15:30:00Z",
    "accessStatus": "Authorized"
  }
];

// Mock data for room access attempts
const mockRoomAccessLogs = [
  {
    "roomId": "R101",
    "userId": "U123",
    "userName": "Jane Doe",
    "accessAttemptTime": "2024-10-30T09:00:00Z"
  },
  {
    "roomId": "R102",
    "userId": "U124",
    "userName": "John Smith",
    "accessAttemptTime": "2024-10-30T09:15:00Z"
  },
  {
    "roomId": "R429",
    "userId": "U125",
    "userName": "Alice Johnson",
    "accessAttemptTime": "2024-10-30T09:00:00Z"
  },
  {
    "roomId": "R422",
    "userId": "U127",
    "userName": "Eve Davis",
    "accessAttemptTime": "2024-10-30T10:15:00Z"
  },
  {
    "roomId": "R426",
    "userId": "U140",
    "userName": "Jane Smith",
    "accessAttemptTime": "2024-10-30T09:00:00Z"
  },
  {
    "roomId": "R421",
    "userId": "U124",
    "userName": "John Smith",
    "accessAttemptTime": "2024-10-30T11:15:00Z"
  }
];

// Handlers array to define various mock API routes
export const handlers = [
  http.get('/api/bookings', () => {
    return HttpResponse.json({mockBookings})
  }),
  http.get('/api/room-access-logs', () => {
    return HttpResponse.json({mockRoomAccessLogs})
  })
];
