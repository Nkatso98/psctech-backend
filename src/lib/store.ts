import { v4 as uuidv4 } from 'uuid';
import {
  Institution,
  User,
  Learner,
  Teacher,
  Attendance,
  Performance,
  UserRole,
  SchoolType,
  Subscription,
  Voucher
} from './types';

// Type alias for subscription status
type SubscriptionStatus = 'Active' | 'Expired' | 'None';

// LocalStorage keys
const STORAGE_KEYS = {
  CURRENT_USER: 'psctech_current_user',
  CURRENT_INSTITUTION: 'psctech_current_institution',
  USERS: 'psctech_users',
  INSTITUTIONS: 'psctech_institutions',
  LEARNERS: 'psctech_learners',
  TEACHERS: 'psctech_teachers',
  ATTENDANCES: 'psctech_attendances',
  PERFORMANCES: 'psctech_performances',
  SUBSCRIPTIONS: 'psctech_subscriptions',
  VOUCHERS: 'psctech_vouchers'
};

// Generic function to get data from localStorage
function getFromStorage<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

// Generic function to save data to localStorage
function saveToStorage<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// User Store
export const userStore = {
  getAll: (): User[] => getFromStorage<User>(STORAGE_KEYS.USERS),
  
  getAllByInstitution: (institutionId: string): User[] => {
    return getFromStorage<User>(STORAGE_KEYS.USERS)
      .filter(user => user.institutionId === institutionId);
  },
  
  getById: (id: string): User | undefined => {
    return getFromStorage<User>(STORAGE_KEYS.USERS).find(user => user.userId === id);
  },
  
  getByUsername: (username: string): User | undefined => {
    return getFromStorage<User>(STORAGE_KEYS.USERS).find(user => user.username === username);
  },
  
  create: (user: Omit<User, 'userId'>): User => {
    const users = getFromStorage<User>(STORAGE_KEYS.USERS);
    const newUser = {
      ...user,
      userId: uuidv4()
    } as User;
    users.push(newUser);
    saveToStorage(STORAGE_KEYS.USERS, users);
    return newUser;
  },
  
  update: (user: User): void => {
    const users = getFromStorage<User>(STORAGE_KEYS.USERS);
    const index = users.findIndex(u => u.userId === user.userId);
    if (index !== -1) {
      users[index] = user;
      saveToStorage(STORAGE_KEYS.USERS, users);
    }
  },
  
  delete: (id: string): void => {
    const users = getFromStorage<User>(STORAGE_KEYS.USERS);
    saveToStorage(
      STORAGE_KEYS.USERS,
      users.filter(user => user.userId !== id)
    );
  },
  
  getCurrentUser: (): User | null => {
    const userData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return userData ? JSON.parse(userData) : null;
  },
  
  setCurrentUser: (user: User | null): void => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }
};

// Institution Store
export const institutionStore = {
  getAll: (): Institution[] => getFromStorage<Institution>(STORAGE_KEYS.INSTITUTIONS),
  
  getById: (id: string): Institution | undefined => {
    return getFromStorage<Institution>(STORAGE_KEYS.INSTITUTIONS).find(institution => institution.institutionId === id);
  },
  
  create: (institution: Omit<Institution, 'institutionId'>): Institution => {
    const institutions = getFromStorage<Institution>(STORAGE_KEYS.INSTITUTIONS);
    const newInstitution = {
      ...institution,
      institutionId: uuidv4()
    } as Institution;
    institutions.push(newInstitution);
    saveToStorage(STORAGE_KEYS.INSTITUTIONS, institutions);
    return newInstitution;
  },
  
  update: (institution: Institution): void => {
    const institutions = getFromStorage<Institution>(STORAGE_KEYS.INSTITUTIONS);
    const index = institutions.findIndex(i => i.institutionId === institution.institutionId);
    if (index !== -1) {
      institutions[index] = institution;
      saveToStorage(STORAGE_KEYS.INSTITUTIONS, institutions);
    }
  },
  
  delete: (id: string): void => {
    const institutions = getFromStorage<Institution>(STORAGE_KEYS.INSTITUTIONS);
    saveToStorage(
      STORAGE_KEYS.INSTITUTIONS,
      institutions.filter(institution => institution.institutionId !== id)
    );
  }
};

// Learner Store
export const learnerStore = {
  getAll: (): Learner[] => getFromStorage<Learner>(STORAGE_KEYS.LEARNERS),
  
  getById: (id: string): Learner | undefined => {
    return getFromStorage<Learner>(STORAGE_KEYS.LEARNERS).find(learner => learner.learnerId === id);
  },
  
  getByInstitution: (institutionId: string): Learner[] => {
    return getFromStorage<Learner>(STORAGE_KEYS.LEARNERS)
      .filter(learner => learner.institutionId === institutionId);
  },

  getByField: <K extends keyof Learner>(field: K, value: Learner[K]): Learner[] => {
    return getFromStorage<Learner>(STORAGE_KEYS.LEARNERS).filter(learner => learner[field] === value);
  },
  
  create: (learner: Omit<Learner, 'learnerId'>): Learner => {
    const learners = getFromStorage<Learner>(STORAGE_KEYS.LEARNERS);
    const newLearner = {
      ...learner,
      learnerId: uuidv4()
    } as Learner;
    learners.push(newLearner);
    saveToStorage(STORAGE_KEYS.LEARNERS, learners);
    return newLearner;
  },
  
  update: (learner: Learner): void => {
    const learners = getFromStorage<Learner>(STORAGE_KEYS.LEARNERS);
    const index = learners.findIndex(l => l.learnerId === learner.learnerId);
    if (index !== -1) {
      learners[index] = learner;
      saveToStorage(STORAGE_KEYS.LEARNERS, learners);
    }
  },
  
  delete: (id: string): void => {
    const learners = getFromStorage<Learner>(STORAGE_KEYS.LEARNERS);
    saveToStorage(
      STORAGE_KEYS.LEARNERS,
      learners.filter(learner => learner.learnerId !== id)
    );
  }
};

// Teacher Store
export const teacherStore = {
  getAll: (): Teacher[] => getFromStorage<Teacher>(STORAGE_KEYS.TEACHERS),
  
  getById: (id: string): Teacher | undefined => {
    return getFromStorage<Teacher>(STORAGE_KEYS.TEACHERS).find(teacher => teacher.teacherId === id);
  },
  
  getByInstitution: (institutionId: string): Teacher[] => {
    return getFromStorage<Teacher>(STORAGE_KEYS.TEACHERS)
      .filter(teacher => teacher.institutionId === institutionId);
  },

  getByField: <K extends keyof Teacher>(field: K, value: Teacher[K]): Teacher[] => {
    return getFromStorage<Teacher>(STORAGE_KEYS.TEACHERS).filter(teacher => teacher[field] === value);
  },
  
  create: (teacher: Omit<Teacher, 'teacherId'>): Teacher => {
    const teachers = getFromStorage<Teacher>(STORAGE_KEYS.TEACHERS);
    const newTeacher = {
      ...teacher,
      teacherId: uuidv4()
    } as Teacher;
    teachers.push(newTeacher);
    saveToStorage(STORAGE_KEYS.TEACHERS, teachers);
    return newTeacher;
  },
  
  update: (teacher: Teacher): void => {
    const teachers = getFromStorage<Teacher>(STORAGE_KEYS.TEACHERS);
    const index = teachers.findIndex(t => t.teacherId === teacher.teacherId);
    if (index !== -1) {
      teachers[index] = teacher;
      saveToStorage(STORAGE_KEYS.TEACHERS, teachers);
    }
  },
  
  delete: (id: string): void => {
    const teachers = getFromStorage<Teacher>(STORAGE_KEYS.TEACHERS);
    saveToStorage(
      STORAGE_KEYS.TEACHERS,
      teachers.filter(teacher => teacher.teacherId !== id)
    );
  }
};

// Attendance Store
export const attendanceStore = {
  getAll: (): Attendance[] => getFromStorage<Attendance>(STORAGE_KEYS.ATTENDANCES),
  
  getByLearner: (learnerId: string): Attendance[] => {
    return getFromStorage<Attendance>(STORAGE_KEYS.ATTENDANCES)
      .filter(attendance => attendance.learnerId === learnerId);
  },
  
  getByClass: (institutionId: string, className: string): Attendance[] => {
    return getFromStorage<Attendance>(STORAGE_KEYS.ATTENDANCES)
      .filter(attendance => {
        const learner = learnerStore.getById(attendance.learnerId);
        return learner && 
               learner.institutionId === institutionId && 
               learner.class === className;
      });
  },
  
  create: (attendance: Omit<Attendance, 'attendanceId'>): Attendance => {
    const attendances = getFromStorage<Attendance>(STORAGE_KEYS.ATTENDANCES);
    const newAttendance = {
      ...attendance,
      attendanceId: uuidv4()
    } as Attendance;
    attendances.push(newAttendance);
    saveToStorage(STORAGE_KEYS.ATTENDANCES, attendances);
    return newAttendance;
  },
  
  update: (attendance: Attendance): void => {
    const attendances = getFromStorage<Attendance>(STORAGE_KEYS.ATTENDANCES);
    const index = attendances.findIndex(a => a.attendanceId === attendance.attendanceId);
    if (index !== -1) {
      attendances[index] = attendance;
      saveToStorage(STORAGE_KEYS.ATTENDANCES, attendances);
    }
  },
  
  delete: (id: string): void => {
    const attendances = getFromStorage<Attendance>(STORAGE_KEYS.ATTENDANCES);
    saveToStorage(
      STORAGE_KEYS.ATTENDANCES,
      attendances.filter(attendance => attendance.attendanceId !== id)
    );
  }
};

// Performance Store
export const performanceStore = {
  getAll: (): Performance[] => getFromStorage<Performance>(STORAGE_KEYS.PERFORMANCES),
  
  getByLearner: (learnerId: string): Performance[] => {
    return getFromStorage<Performance>(STORAGE_KEYS.PERFORMANCES)
      .filter(performance => performance.learnerId === learnerId);
  },
  
  getByClass: (institutionId: string, className: string): Performance[] => {
    return getFromStorage<Performance>(STORAGE_KEYS.PERFORMANCES)
      .filter(performance => {
        const learner = learnerStore.getById(performance.learnerId);
        return learner && 
               learner.institutionId === institutionId && 
               learner.class === className;
      });
  },
  
  create: (performance: Omit<Performance, 'performanceId'>): Performance => {
    const performances = getFromStorage<Performance>(STORAGE_KEYS.PERFORMANCES);
    const newPerformance = {
      ...performance,
      performanceId: uuidv4()
    } as Performance;
    performances.push(newPerformance);
    saveToStorage(STORAGE_KEYS.PERFORMANCES, performances);
    return newPerformance;
  },
  
  update: (performance: Performance): void => {
    const performances = getFromStorage<Performance>(STORAGE_KEYS.PERFORMANCES);
    const index = performances.findIndex(p => p.performanceId === performance.performanceId);
    if (index !== -1) {
      performances[index] = performance;
      saveToStorage(STORAGE_KEYS.PERFORMANCES, performances);
    }
  },
  
  delete: (id: string): void => {
    const performances = getFromStorage<Performance>(STORAGE_KEYS.PERFORMANCES);
    saveToStorage(
      STORAGE_KEYS.PERFORMANCES,
      performances.filter(performance => performance.performanceId !== id)
    );
  }
};

// Voucher Store
export const voucherStore = {
  getAll: (): Voucher[] => getFromStorage<Voucher>(STORAGE_KEYS.VOUCHERS),
  
  getByCode: (code: string): Voucher | undefined => {
    return getFromStorage<Voucher>(STORAGE_KEYS.VOUCHERS)
      .find(voucher => voucher.code === code);
  },
  
  create: (voucher: Omit<Voucher, 'voucherId'>): Voucher => {
    const vouchers = getFromStorage<Voucher>(STORAGE_KEYS.VOUCHERS);
    const newVoucher = {
      ...voucher,
      voucherId: uuidv4()
    } as Voucher;
    vouchers.push(newVoucher);
    saveToStorage(STORAGE_KEYS.VOUCHERS, vouchers);
    return newVoucher;
  },
  
  update: (voucher: Voucher): void => {
    const vouchers = getFromStorage<Voucher>(STORAGE_KEYS.VOUCHERS);
    const index = vouchers.findIndex(v => v.voucherId === voucher.voucherId);
    if (index !== -1) {
      vouchers[index] = voucher;
      saveToStorage(STORAGE_KEYS.VOUCHERS, vouchers);
    }
  },
  
  delete: (id: string): void => {
    const vouchers = getFromStorage<Voucher>(STORAGE_KEYS.VOUCHERS);
    saveToStorage(
      STORAGE_KEYS.VOUCHERS,
      vouchers.filter(voucher => voucher.voucherId !== id)
    );
  }
};

// Subscription Store
export const subscriptionStore = {
  getAll: (): Subscription[] => getFromStorage<Subscription>(STORAGE_KEYS.SUBSCRIPTIONS),
  
  getByParent: (parentId: string): Subscription[] => {
    return getFromStorage<Subscription>(STORAGE_KEYS.SUBSCRIPTIONS)
      .filter(subscription => subscription.parentUserId === parentId);
  },
  
  getByLearner: (learnerId: string): Subscription[] => {
    return getFromStorage<Subscription>(STORAGE_KEYS.SUBSCRIPTIONS)
      .filter(subscription => subscription.learnerId === learnerId);
  },
  
  create: (subscription: Omit<Subscription, 'subscriptionId'>): Subscription => {
    const subscriptions = getFromStorage<Subscription>(STORAGE_KEYS.SUBSCRIPTIONS);
    const newSubscription = {
      ...subscription,
      subscriptionId: uuidv4()
    } as Subscription;
    subscriptions.push(newSubscription);
    saveToStorage(STORAGE_KEYS.SUBSCRIPTIONS, subscriptions);
    return newSubscription;
  },
  
  update: (subscription: Subscription): void => {
    const subscriptions = getFromStorage<Subscription>(STORAGE_KEYS.SUBSCRIPTIONS);
    const index = subscriptions.findIndex(s => s.subscriptionId === subscription.subscriptionId);
    if (index !== -1) {
      subscriptions[index] = subscription;
      saveToStorage(STORAGE_KEYS.SUBSCRIPTIONS, subscriptions);
    }
  },
  
  delete: (id: string): void => {
    const subscriptions = getFromStorage<Subscription>(STORAGE_KEYS.SUBSCRIPTIONS);
    saveToStorage(
      STORAGE_KEYS.SUBSCRIPTIONS,
      subscriptions.filter(subscription => subscription.subscriptionId !== id)
    );
  }
};

// Subscription Manager
export const subscriptionManager = {
  // Redeem a voucher code
  redeemVoucher: (code: string, userId: string): { success: boolean; message: string; credits?: number } => {
    // Check if the voucher exists
    const voucher = voucherStore.getByCode(code);
    
    if (!voucher) {
      return { success: false, message: 'Invalid voucher code. Please check and try again.' };
    }
    
    // Check if already redeemed
    if (voucher.isRedeemed) {
      return { success: false, message: 'This voucher has already been redeemed.' };
    }
    
    // Update the voucher
    voucher.isRedeemed = false; // Mark as associated with user but not fully consumed
    voucher.redeemedBy = userId;
    voucher.redeemedOn = new Date().toISOString();
    
    voucherStore.update(voucher);
    
    return {
      success: true,
      message: `Successfully redeemed voucher for ${voucher.credits} subscription credits.`,
      credits: voucher.credits
    };
  },
  
  // Subscribe a learner
  subscribeLearner: (learnerId: string, parentId: string, creditsToUse: number = 1): { success: boolean; message: string } => {
    // Check if parent has enough vouchers
    const availableVouchers = voucherStore.getAll().filter(v => v.redeemedBy === parentId && !v.isRedeemed);
    
    if (availableVouchers.length < creditsToUse) {
      return { success: false, message: 'Insufficient voucher credits' };
    }
    
    // Create subscription
    const subscription: Omit<Subscription, 'subscriptionId'> = {
      learnerId,
      parentUserId: parentId,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      status: 'Active',
      amountPaid: creditsToUse
    };
    
    subscriptionStore.create(subscription);
    
    // Mark vouchers as redeemed
    availableVouchers.slice(0, creditsToUse).forEach(voucher => {
      voucherStore.update(voucher); // Use update to mark as redeemed
    });
    
    return { success: true, message: 'Subscription created successfully' };
  },
  
  // Update status of all subscriptions (check for expired)
  updateSubscriptionStatuses: (): void => {
    const now = new Date();
    const subscriptions = subscriptionStore.getAll();
    
    subscriptions.forEach(subscription => {
      const endDate = new Date(subscription.endDate);
      
      if (endDate < now && subscription.status !== 'Expired') {
        subscription.status = 'Expired';
        subscriptionStore.update(subscription);
      }
    });
  }
};

// Get and set current institution
export function getCurrentInstitution(): Institution | null {
  const institutionData = localStorage.getItem(STORAGE_KEYS.CURRENT_INSTITUTION);
  return institutionData ? JSON.parse(institutionData) : null;
}

export function setCurrentInstitution(institution: Institution | null): void {
  if (institution) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_INSTITUTION, JSON.stringify(institution));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_INSTITUTION);
  }
}

// Initialize demo data
export function initializeDemoData() {
  // Check if demo data already exists
  const existingInstitutions = getFromStorage<Institution>(STORAGE_KEYS.INSTITUTIONS);
  
  if (existingInstitutions.length > 0) {
    // Don't automatically set a current user - let users log in manually
    return;
  }

  console.log('Initializing demo data...');

  // Clear any existing data first
  localStorage.removeItem(STORAGE_KEYS.USERS);
  localStorage.removeItem(STORAGE_KEYS.INSTITUTIONS);
  localStorage.removeItem(STORAGE_KEYS.LEARNERS);
  localStorage.removeItem(STORAGE_KEYS.TEACHERS);
  localStorage.removeItem(STORAGE_KEYS.ATTENDANCES);
  localStorage.removeItem(STORAGE_KEYS.PERFORMANCES);
  localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTIONS);
  localStorage.removeItem(STORAGE_KEYS.VOUCHERS);

  // Create a demo institution
  const demoInstitution: Institution = {
    institutionId: 'inst-001',
    name: 'PSC Tech Demo School',
    type: 'Combined',
    district: 'Demo District',
    address: '123 Education Street, Demo Town',
    registeredOn: new Date().toISOString()
  };
  
  // Add institution
  saveToStorage(STORAGE_KEYS.INSTITUTIONS, [demoInstitution]);
  
  // Create demo users
  const demoUsers: User[] = [
    {
      userId: 'user-001',
      institutionId: demoInstitution.institutionId,
      role: 'Principal',
      fullName: 'Principal Demo',
      username: 'principal',
      passwordHash: 'password123', // In real app would be properly hashed
      linkedIdNumber: '0001',
      status: 'Active',
      email: 'principal@psctech.co.za'
    },
    {
      userId: 'user-002',
      institutionId: demoInstitution.institutionId,
      role: 'Teacher',
      fullName: 'Teacher Demo',
      username: 'teacher',
      passwordHash: 'password123',
      linkedIdNumber: '0002',
      status: 'Active',
      email: 'teacher@psctech.co.za'
    },
    {
      userId: 'user-003',
      institutionId: demoInstitution.institutionId,
      role: 'Parent',
      fullName: 'Parent Demo',
      username: 'parent',
      passwordHash: 'password123',
      linkedIdNumber: '0003',
      status: 'Active',
      email: 'parent@example.com'
    },
    {
      userId: 'user-004',
      institutionId: demoInstitution.institutionId,
      role: 'Learner',
      fullName: 'Learner Demo',
      username: 'learner',
      passwordHash: 'password123',
      linkedIdNumber: '0004',
      status: 'Active'
    },
    {
      userId: 'user-005',
      institutionId: demoInstitution.institutionId,
      role: 'SGB',
      fullName: 'SGB Member Demo',
      username: 'sgb',
      passwordHash: 'password123',
      linkedIdNumber: '0005',
      status: 'Active',
      email: 'sgb@example.com'
    }
  ];
  
  // Add users
  saveToStorage(STORAGE_KEYS.USERS, demoUsers);
  
  // Create demo teachers
  const demoTeachers: Teacher[] = [
    {
      teacherId: 'teacher-001',
      userId: 'user-002',
      institutionId: demoInstitution.institutionId,
      subject: 'Mathematics',
      grade: 10,
      class: 'A',
      companyNumber: 'T00123'
    }
  ];
  
  // Add teachers
  saveToStorage(STORAGE_KEYS.TEACHERS, demoTeachers);
  
  // Create demo learners
  const demoLearners: Learner[] = [
    {
      learnerId: 'learner-001',
      userId: 'user-004',
      institutionId: demoInstitution.institutionId,
      grade: 10,
      class: 'A',
      parentUserId: 'user-003',
      dateOfBirth: '2010-01-01',
      subscriptionStatus: 'Active',
      subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
    }
  ];
  
  // Add learners
  saveToStorage(STORAGE_KEYS.LEARNERS, demoLearners);
  
  // Create demo attendances
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const demoAttendances: Attendance[] = [
    {
      attendanceId: 'att-001',
      learnerId: 'learner-001',
      teacherId: 'teacher-001',
      date: today.toISOString(),
      period: '1',
      status: 'Present'
    },
    {
      attendanceId: 'att-002',
      learnerId: 'learner-001',
      teacherId: 'teacher-001',
      date: yesterday.toISOString(),
      period: '1',
      status: 'Absent'
    }
  ];
  
  // Add attendances
  saveToStorage(STORAGE_KEYS.ATTENDANCES, demoAttendances);
  
  // Create demo performances
  const demoPerformances: Performance[] = [
    {
      performanceId: 'perf-001',
      learnerId: 'learner-001',
      subject: 'Mathematics',
      term: 'Term 1',
      mark: 78,
      comment: 'Good progress in algebra, needs more practice with geometry.',
      dateEntered: new Date().toISOString()
    }
  ];
  
  // Add performances
  saveToStorage(STORAGE_KEYS.PERFORMANCES, demoPerformances);
  
  // Create demo subscriptions
  const demoSubscriptions: Subscription[] = [
    {
      subscriptionId: 'sub-001',
      learnerId: 'learner-001',
      parentUserId: 'user-003',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      status: 'Active',
      amountPaid: 5
    }
  ];
  
  // Add subscriptions
  saveToStorage(STORAGE_KEYS.SUBSCRIPTIONS, demoSubscriptions);
  
  // Create demo vouchers
  const demoVouchers: Voucher[] = [
    {
      voucherId: 'voucher-001',
      code: 'DEMO123',
      credits: 3,
      isRedeemed: false
    },
    {
      voucherId: 'voucher-002',
      code: 'PARENT5',
      credits: 1,
      isRedeemed: true,
      redeemedBy: 'user-003',
      redeemedOn: new Date().toISOString()
    }
  ];
  
  // Add vouchers
  saveToStorage(STORAGE_KEYS.VOUCHERS, demoVouchers);
  
  console.log('Demo data initialized successfully');
}

// Re-export from ai-testing-system.ts
export { aiTestStore, testSessionStore, testResultStore } from './ai-testing-system';
export { default as aiTestingSystem } from './ai-testing-system';