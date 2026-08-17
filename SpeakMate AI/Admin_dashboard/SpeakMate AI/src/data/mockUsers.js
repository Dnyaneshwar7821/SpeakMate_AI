const mockUsers = [
  {
    id: 1,
    firstName: "Jane",
    lastName: "Cooper",
    email: "jane.cooper@example.com",
    role: "ADMIN",
    active: true,
    createdAt: "2024-06-15T10:00:00Z",
  },
  {
    id: 2,
    firstName: "Alex",
    lastName: "Morgan",
    email: "alex.morgan@example.com",
    role: "USER",
    active: true,
    createdAt: "2024-07-02T14:30:00Z",
  },
  {
    id: 3,
    firstName: "Sarah",
    lastName: "Wilson",
    email: "sarah.wilson@example.com",
    role: "USER",
    active: true,
    createdAt: "2024-07-10T09:15:00Z",
  },
  {
    id: 4,
    firstName: "Mike",
    lastName: "Johnson",
    email: "mike.johnson@example.com",
    role: "USER",
    active: false,
    createdAt: "2024-05-20T11:45:00Z",
  },
  {
    id: 5,
    firstName: "Emily",
    lastName: "Davis",
    email: "emily.davis@example.com",
    role: "USER",
    active: true,
    createdAt: "2024-07-18T16:20:00Z",
  },
  {
    id: 6,
    firstName: "David",
    lastName: "Chen",
    email: "david.chen@example.com",
    role: "USER",
    active: true,
    createdAt: "2024-07-22T08:00:00Z",
  },
  {
    id: 7,
    firstName: "Olivia",
    lastName: "Martinez",
    email: "olivia.martinez@example.com",
    role: "USER",
    active: false,
    createdAt: "2024-06-30T12:00:00Z",
  },
  {
    id: 8,
    firstName: "James",
    lastName: "Taylor",
    email: "james.taylor@example.com",
    role: "ADMIN",
    active: true,
    createdAt: "2024-05-10T09:30:00Z",
  },
];

export const getMockUserById = (id) => mockUsers.find((u) => u.id === id) || null;

export const addMockUser = (user) => {
  const newUser = {
    ...user,
    id: Date.now(),
    createdAt: new Date().toISOString(),
  };
  mockUsers.push(newUser);
  return newUser;
};

export const updateMockUser = (id, updates) => {
  const idx = mockUsers.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  mockUsers[idx] = { ...mockUsers[idx], ...updates };
  return mockUsers[idx];
};

export const deleteMockUser = (id) => {
  const idx = mockUsers.findIndex((u) => u.id === id);
  if (idx === -1) return false;
  mockUsers.splice(idx, 1);
  return true;
};

export default mockUsers;
